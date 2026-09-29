#!/usr/bin/env python3
"""Find a page in the goodparty.org sitemap.

The sitemap is ~570k URLs split across 116 files, and each file takes 15-25s to
render server-side. That cost is why this script exists: it narrows the search to
the band that can hold the answer, fetches those files in parallel, and caches
them so a second question about the same band is instant.

Usage:
  sitemap_lookup.py "joy page"                 # search the people band
  sitemap_lookup.py "joy page" --band people
  sitemap_lookup.py "bozeman" --band elections --state mt
  sitemap_lookup.py "blog" --band main
  sitemap_lookup.py --shard-for /people/joy-page-1424135b   # no download needed
  sitemap_lookup.py "page" --band people --verify           # curl each hit

Exit codes: 0 = at least one match, 1 = no match, 2 = bad usage.
"""

from __future__ import annotations  # 3.9 evaluates `int | None` annotations eagerly without this

import argparse
import concurrent.futures
import os
import pathlib
import re
import subprocess
import sys
import time

BASE = "https://goodparty.org"
INDEX = f"{BASE}/sitemap.xml"

# Band layout, from src/lib/sitemap-entries.ts (getSitemapIds).
#   id 0        -> main site pages
#   id 1..51    -> election pages, one file per state
#   id 52..115  -> /people profiles, sharded on the person id
STATE_CODES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI",
    "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
    "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
    "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
    "WV", "WI", "WY",
]
PEOPLE_SHARD_COUNT = 64
PEOPLE_BAND_START = 1 + len(STATE_CODES)  # 52
LAST_SHARD = PEOPLE_BAND_START + PEOPLE_SHARD_COUNT - 1  # 115

LOC = re.compile(r"<loc>([^<]+)</loc>")
# The 8 hex chars a canonical /people URL ends in.
ID8 = re.compile(r"-([0-9a-f]{8})$", re.I)


def cache_dir() -> pathlib.Path:
    root = os.environ.get("SITEMAP_CACHE_DIR")
    if not root:
        scratch = os.environ.get("CLAUDE_SCRATCHPAD_DIR", "")
        root = os.path.join(scratch or "/tmp", "sitemap-cache")
    p = pathlib.Path(root)
    p.mkdir(parents=True, exist_ok=True)
    return p


def people_shard_for(url_or_slug: str) -> int | None:
    """The shard id holding a /people URL, read straight off its id suffix.

    Mirrors peopleShardForPersonId: parseInt(id8, 16) % 64, offset by the band
    start. An id with no hex tail falls in shard 0 of the band rather than being
    dropped, because a person with no shard would be a person with no entry.
    """
    slug = url_or_slug.rstrip("/").split("/")[-1]
    m = ID8.search(slug)
    if not m:
        return None
    return PEOPLE_BAND_START + (int(m.group(1), 16) % PEOPLE_SHARD_COUNT)


def shard_for_url(url: str) -> tuple[int | None, str]:
    """Reverse lookup: which file advertises this URL. Costs nothing to compute."""
    path = url.split(BASE)[-1] if BASE in url else url
    path = "/" + path.lstrip("/")
    if path.startswith("/people/"):
        s = people_shard_for(path)
        if s is None:
            return PEOPLE_BAND_START, "people band, but the slug has no 8-hex id tail"
        return s, "people band"
    if path.startswith("/elections/"):
        parts = [p for p in path.split("/") if p]
        if len(parts) >= 2 and len(parts[1]) == 2:
            code = parts[1].upper()
            if code in STATE_CODES:
                return STATE_CODES.index(code) + 1, f"elections band, state {code}"
        return None, "elections band, but no state code in the URL to pin the file"
    if path.startswith("/candidate/") or path.startswith("/candidates/"):
        return None, ("no /candidate* URL is in the sitemap - profile pages live "
                      "under /people/<name>-<id8>. Search the people band by name "
                      "instead. (These paths 404 today, so do not hand one out.)")
    return 0, "main site pages"


def shards_for_band(band: str, state: str | None) -> list[int]:
    if band == "main":
        return [0]
    if band == "elections":
        if state:
            code = state.upper()
            if code not in STATE_CODES:
                sys.exit(f"error: {state!r} is not one of the 51 state/DC codes")
            return [STATE_CODES.index(code) + 1]
        return list(range(1, len(STATE_CODES) + 1))
    if band == "people":
        return list(range(PEOPLE_BAND_START, LAST_SHARD + 1))
    return list(range(0, LAST_SHARD + 1))


def live_shard_count() -> int | None:
    """How many files the live index lists, or None if it cannot be read.

    Worth checking when a sweep comes back empty. PEOPLE_SITEMAP_SHARD_COUNT is
    meant to be raised as the site grows, and if it has been, this script would
    be searching the wrong file ids and reporting a confident "not found".
    """
    r = subprocess.run(
        ["curl", "-sS", "--compressed", "--max-time", "60", INDEX],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        return None
    n = len(LOC.findall(r.stdout))
    return n or None


def fetch_shard(shard: int, refresh: bool = False) -> tuple[int, pathlib.Path | None, str]:
    dest = cache_dir() / f"{shard}.xml"
    if dest.exists() and dest.stat().st_size > 0 and not refresh:
        return shard, dest, "cached"
    tmp = dest.with_suffix(".part")
    # curl over urllib: it follows the CDN's redirects and retries transient 5xx
    # without extra code. --compressed shrinks transfer ~10x but does not speed
    # this up, because the wait is server-side sitemap generation, not bytes.
    cmd = [
        "curl", "-sS", "--compressed", "--fail", "--retry", "2",
        "--retry-delay", "1", "--max-time", "120",
        f"{BASE}/sitemap/{shard}.xml", "-o", str(tmp),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0 or not tmp.exists() or tmp.stat().st_size == 0:
        tmp.unlink(missing_ok=True)
        return shard, None, (r.stderr or "empty response").strip()[:200]
    tmp.replace(dest)
    return shard, dest, "fetched"


def search(shards: list[int], pattern: re.Pattern, jobs: int, refresh: bool,
           quiet: bool) -> tuple[list[tuple[int, str]], list[tuple[int, str]]]:
    hits: list[tuple[int, str]] = []
    failures: list[tuple[int, str]] = []
    done = 0
    started = time.time()
    # A \r progress line is for a human watching a slow cold fetch. Piped into a
    # log or an agent's context it is 64 lines of noise, so only draw it on a tty.
    show_progress = not quiet and sys.stderr.isatty()
    with concurrent.futures.ThreadPoolExecutor(max_workers=jobs) as pool:
        futures = {pool.submit(fetch_shard, s, refresh): s for s in shards}
        for fut in concurrent.futures.as_completed(futures):
            shard, path, note = fut.result()
            done += 1
            if path is None:
                failures.append((shard, note))
            else:
                text = path.read_text(errors="replace")
                for url in LOC.findall(text):
                    if pattern.search(url):
                        hits.append((shard, url))
            if show_progress:
                elapsed = int(time.time() - started)
                print(f"\r  searched {done}/{len(shards)} files, "
                      f"{len(hits)} match(es), {elapsed}s", end="", file=sys.stderr)
    if show_progress:
        print(file=sys.stderr)
    elif not quiet:
        fetched = len(shards) - len(failures)
        print(f"  read {fetched}/{len(shards)} files in "
              f"{int(time.time() - started)}s", file=sys.stderr)
    return hits, failures


def verify(url: str) -> str:
    """Status, title, and any redirect.

    The redirect matters: a sitemap URL that 308s somewhere else is a bug worth
    reporting, not the canonical answer. Some /elections city URLs redirect to a
    wrong-county path, so a bare 200 after -L would hide the interesting part.
    """
    r = subprocess.run(
        ["curl", "-sS", "-L", "-o", "-", "--max-time", "60",
         "-w", "\n__META__%{http_code}\t%{url_effective}", url],
        capture_output=True, text=True,
    )
    body, _, meta = r.stdout.rpartition("__META__")
    status, _, effective = meta.strip().partition("\t")
    m = re.search(r"<title>([^<]*)</title>", body)
    title = m.group(1).strip() if m else ""
    out = f"{status or '???'}  {title}"
    if effective and effective.rstrip("/") != url.rstrip("/"):
        out += f"\n    REDIRECTED to {effective} - the sitemap URL is not the final page"
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("query", nargs="?", help="text or regex to match against URLs")
    ap.add_argument("--band", choices=["people", "elections", "main", "all"],
                    default="people",
                    help="which band to search (default: people)")
    ap.add_argument("--state", help="two-letter state/DC code, narrows --band elections to one file")
    ap.add_argument("--shard-for", metavar="URL",
                    help="print which sitemap file advertises this URL, without downloading")
    ap.add_argument("--regex", action="store_true",
                    help="treat the query as a regex instead of a name/substring")
    ap.add_argument("--verify", action="store_true",
                    help="curl each match and report its status code and page title")
    ap.add_argument("--limit", type=int, default=50,
                    help="max matches to print (default: 50; 0 prints none and just counts)")
    ap.add_argument("--jobs", type=int, default=6,
                    help="parallel downloads (default: 6; higher provokes 500s, see notes)")
    ap.add_argument("--refresh", action="store_true", help="ignore the cache and refetch")
    ap.add_argument("--quiet", action="store_true", help="suppress the progress line")
    args = ap.parse_args()

    if args.shard_for:
        shard, why = shard_for_url(args.shard_for)
        if shard is None:
            print(f"no single file: {why}")
            return 1
        print(f"{BASE}/sitemap/{shard}.xml   ({why})")
        return 0

    if not args.query:
        ap.error("give a query, or use --shard-for URL")

    # A /people URL or full slug pins one file, so skip the band sweep.
    if args.band == "people" and not args.regex:
        direct = people_shard_for(args.query)
        if direct is not None:
            shards = [direct]
            print(f"The id tail pins this to one file, {BASE}/sitemap/{direct}.xml",
                  file=sys.stderr)
        else:
            shards = shards_for_band(args.band, args.state)
    else:
        shards = shards_for_band(args.band, args.state)

    if args.regex:
        pattern = re.compile(args.query, re.I)
    else:
        # "Joy Page" should match /people/joy-page-1424135b, so spaces and
        # underscores are all treated as the slug's hyphen.
        # A pasted URL or path should match on its slug, not the whole string:
        # "https://.../people/joy-page-1424135b" tokenized whole would try to
        # match "https" and "goodparty.org" inside the URL and find nothing.
        needle = args.query.strip()
        if "/" in needle:
            needle = needle.rstrip("/").split("/")[-1]
        parts = [re.escape(p) for p in re.split(r"[\s_-]+", needle) if p]
        pattern = re.compile(r"[-/]".join(parts), re.I) if parts else re.compile(re.escape(needle), re.I)

    if not args.quiet:
        print(f"Searching {len(shards)} sitemap file(s) for {args.query!r} "
              f"(cache: {cache_dir()})", file=sys.stderr)

    hits, failures = search(shards, pattern, args.jobs, args.refresh, args.quiet)

    if failures:
        retry = [s for s, _ in failures]
        if not args.quiet:
            print(f"  {len(retry)} file(s) errored (the server 500s under load); "
                  f"retrying them gently", file=sys.stderr)
        more_hits, failures = search(retry, pattern, 2, True, args.quiet)
        hits.extend(more_hits)

    seen = set()
    unique = []
    for shard, url in sorted(hits, key=lambda h: h[1]):
        if url not in seen:
            seen.add(url)
            unique.append((shard, url))

    for shard, url in unique[: args.limit]:
        line = f"{url}\n    in {BASE}/sitemap/{shard}.xml"
        if args.verify:
            line += f"\n    live: {verify(url)}"
        print(line)

    # --limit 0 is the "just count them" mode, so the elision note would be noise.
    if args.limit > 0 and len(unique) > args.limit:
        print(f"\n... and {len(unique) - args.limit} more "
              f"(raise --limit to see them)")

    if failures:
        print(f"\nWARNING: {len(failures)} file(s) could not be read, so this "
              f"search was not exhaustive:", file=sys.stderr)
        for shard, note in failures[:10]:
            print(f"  sitemap/{shard}.xml: {note}", file=sys.stderr)
        print("  Re-run to retry just the missing files (the rest stay cached).",
              file=sys.stderr)

    print(f"\n{len(unique)} match(es) across {len(shards)} file(s) searched.")
    if not unique and not failures:
        print("Nothing matched. If you expected a profile page, check the "
              "spelling, try just the surname, or widen with --band all.")
        expected = LAST_SHARD + 1
        live = live_shard_count()
        if live is not None and live != expected:
            print(f"\nHEADS UP: the live index lists {live} sitemap files but this "
                  f"script assumes {expected}. The site has been resharded, so the "
                  f"band math above is stale and this search looked in the wrong "
                  f"files. Update STATE_CODES / PEOPLE_SHARD_COUNT against "
                  f"getSitemapIds() in src/lib/sitemap-entries.ts before trusting "
                  f"a negative result.")
    return 0 if unique else 1


if __name__ == "__main__":
    sys.exit(main())
