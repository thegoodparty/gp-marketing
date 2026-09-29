---
name: sitemap-lookup
description: Find the live URL of any goodparty.org page in the sitemap — a candidate or elected-official profile, an election or position page, a blog post, or a main site page — and confirm it actually loads. Use this whenever someone asks for "the URL for X", "where does X live", "is X in the sitemap", "which sitemap file holds X", "does this page exist", or wants a person's profile page found by name. Also use it before quoting any goodparty.org URL you have not fetched, and when someone asks how many URLs of some kind the site publishes.
---

# Look up a page in the goodparty.org sitemap

The sitemap is the site's own index of every page it publishes: roughly 570,000
URLs, which makes it the fastest way to answer "what is the URL for X" without
guessing. Guessing is the thing to avoid here — slugs carry an id tail and a
county segment that you cannot reconstruct from a name, so a hand-built URL is
usually a 404.

**The job is done when you have a URL you have actually fetched and seen return
200.** Presence in the sitemap alone is not proof the page works; see
"Sitemap presence proves less than it looks like" below.

## Use the script

`scripts/sitemap_lookup.py` (stdlib Python 3, no install) handles the shard math,
parallel fetching, and caching. Run it from the repo root.

```bash
# Find a person's profile by name (searches the 64 people files)
python3 .claude/skills/sitemap-lookup/scripts/sitemap_lookup.py "joy page" --verify

# Election pages in one state — narrow with --state, it is ~60x less work
python3 .claude/skills/sitemap-lookup/scripts/sitemap_lookup.py "bozeman" --band elections --state mt

# Main site pages (blog, about, contact, FAQs...)
python3 .claude/skills/sitemap-lookup/scripts/sitemap_lookup.py "how-to-run" --band main

# Reverse: which sitemap file advertises a URL I already have? Costs nothing.
python3 .claude/skills/sitemap-lookup/scripts/sitemap_lookup.py --shard-for /people/joy-page-1424135b

# Cast a wide net when you are not sure which band (slow — all 116 files)
python3 .claude/skills/sitemap-lookup/scripts/sitemap_lookup.py "ranked choice" --band all
```

Useful flags: `--verify` fetches each hit and reports its status, page title, and
any redirect; `--regex` treats the query as a regex (anchor with `$` to avoid
matching child paths); `--limit` raises the 50-match print cap, and `--limit 0`
counts matches without listing them; `--refresh` ignores the cache.

To answer "how many pages of kind X are there", combine `--regex` with
`--limit 0` — e.g. `"/position/" --band elections --state tx --regex --limit 0`
reports 996 position pages in Texas.

Always pass `--verify` when you are going to hand the URL to someone. A match
with no verification is a claim you have not checked.

### Why it is slow the first time, and fast after

Each sitemap file takes 15–25 seconds because the server generates it on demand.
That is the whole cost, and it has two counterintuitive consequences:

- **Compression does not help.** `--compressed` shrinks the transfer about 10x
  and saves no time at all, because you are waiting on generation, not bytes.
- **More parallelism does not help either, and can corrupt the answer.** At 12
  concurrent requests the server starts returning 500s — a measured sweep lost 5
  of 64 files that way. The script defaults to 6, which came back clean. Raising
  `--jobs` buys nothing and risks a sweep with holes in it.

Measured timings: a single file or a single state ~2s; the whole people band
about 7 minutes; all 116 files 5–10 minutes. Fetched files are cached under the
scratchpad, so a repeat question about the same band answers in well under a
second. Warn the person up front that a name sweep takes several minutes instead
of leaving them waiting in silence — and if they can give you the state, an
elections lookup drops from minutes to seconds.

If any file errors, the script retries the stragglers at low concurrency and
then tells you if a gap remains. **A "not found" from a sweep with gaps is not a
finding** — re-run (cached files are skipped, so it is cheap) before telling
anyone a page does not exist.

## How the sitemap is laid out

The index at `/sitemap.xml` lists 116 files at `/sitemap/<id>.xml`, in three
bands (the source of truth is `getSitemapIds()` in `src/lib/sitemap-entries.ts`):

| File ids | Band | Holds |
| --- | --- | --- |
| `0` | Main | ~850 URLs: ~390 `/blog`, ~340 `/political-terms`, ~76 `/frequently-asked-questions`, and ~40 one-off marketing pages (`/`, `/contact`, `/run-for-office`, ...) |
| `1`–`51` | Elections | One file per state, ~200–1,400 URLs each: `/elections/<st>/...` and their `/position/...` children |
| `52`–`115` | People | 64 files, ~7,500 URLs each: `/people/<name>-<id8>` profiles |

**Elections file id = the state's position in alphabetical order by state name,
plus one.** Alabama is 1, Alaska 2, Arizona 3, ... DC is 9 (it sorts under
"District of Columbia", after Delaware), ... Wyoming is 51. Note this is by
name, not by code, so `ak` is file 2 even though `ak` sorts before `al`.

**People file id = `52 + (the last 8 hex characters of the person id, read as
hex, mod 64)`.** This is readable straight off the URL, which is what makes a
bad shard debuggable. People used to be sharded by first letter of the slug, and
the `j` file blew past the protocol's 50,000-URL ceiling; hashing the id instead
keeps the files even by construction.

The practical consequence: **a URL tells you its file instantly, but a name does
not.** Going from "Joy Page" to a URL means sweeping all 64 people files; going
from `/people/joy-page-1424135b` to file 79 is arithmetic. Use `--shard-for`
whenever you already hold the URL.

## Traps that produce confidently wrong answers

**Sitemap presence proves less than it looks like.** It is the site's list of
what it would like crawled — not proof a page renders, not proof Google indexed
it. Municipal election pages are a live example: they are crawled but largely
not indexed, because they run ~550 words and are ~93% identical to each other.
So if someone asks why a page is not showing up in search, finding it in the
sitemap does not answer that, and adding it to the sitemap would not fix it.
Never present a sitemap result as an indexing result.

**Profile URLs need the id tail.** `/people/joy-page` is a 404;
`/people/joy-page-1424135b` is the page. Never truncate the 8-hex suffix, and
never construct a profile URL from a name alone.

**There is no working `/candidate/...` or `/candidates/<name>` profile URL.**
Those paths are absent from the sitemap by design, and today they return 404.
(A comment in `sitemap-entries.ts` describes them as permanent redirects to
`/people/*`; that is no longer how they respond, so trust the fetch over the
comment.) Profile pages are `/people/...` only. Separately, `/elections/.../candidates`
pages are being retired, so do not link to them either.

**Check whether a hit redirects.** `--verify` reports the final URL, and that
matters: some county-suffixed city URLs 308 to a path with the *wrong* county.
When that happens the sitemap URL is the one to report, flagged as buggy — do
not quietly hand over the redirect target as if it were canonical.

**Names are not unique, and near-misses are common.** There is one Joy Page but
dozens of people surnamed Page. When a search returns several plausible people,
verify the candidates and use the page title (it carries the office and place,
e.g. "Commissioner, ANC SMD 8C08") to pick, or show the person the options
rather than guessing which one they meant.

**Take a county from the slug, never from a place name.** Place and county names
collide — 20 Missouri cities are named after a county they are not in — so read
the county segment out of the URL you found instead of inferring it.

## Answering the person

The person asking is usually on the marketing team and wants a link they can
paste, so lead with the URL and keep the machinery out of it.

Give them: the URL, confirmation it loads, and the page title so they can tell
they have the right person or place. Add the sitemap file id only if they asked
about the sitemap itself, and mention how many other matches there were when
that guards against a mix-up ("one Joy Page, but dozens of people named Page").

If the page genuinely is not there, say what you searched and offer the likely
reason — a profile that has not been created, a spelling difference, or a page
type the sitemap deliberately omits — rather than just "not found". And when the
underlying problem is a person's profile data being wrong rather than missing,
that lives in other systems; see `docs/elections.md` and escalate instead of
attempting a code fix.
