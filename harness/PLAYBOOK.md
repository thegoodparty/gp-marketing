# Person Public Profiles — Figma parity harness

A closed loop that drives the live `/people/<slug>` pages to within **3% layout
diff** of the 12 Figma states (A–L). The harness scores each pass and refuses to
declare victory until every active state is green.

## What it compares

- **Truth:** cached Figma frame exports `/tmp/figma-shots/figma-{A..L}.png`. Each
  is a downscale of a **1440-wide** `Desktop_Profile` frame (verified via Figma
  metadata) — the same width as our capture, so vertical positions are directly
  comparable.
- **Live:** full-page Playwright screenshots of `localhost:3009/people/<slug>` at
  a 1440px desktop viewport.

## Why section-based, not full-page

Figma mocks use placeholder names/photos; the live pages use real seeded data, so
a raw pixel diff never converges. Worse, a single full-page top-aligned diff
**saturates**: the moment total page height drifts (and our page is ~30% shorter
than the design today), everything below the first mismatch shifts and the whole
image reads as different — a useless gradient for a fix loop.

So the harness slices each page into **bands** and scores each band on its own,
re-aligned at the band's top:

```
nav · breadcrumb · body(hero+content) · cta · pledge · elections · footer
```

Figma band boundaries are auto-extracted from `figma-metadata.txt` into
`figma-sections.json` (see `extract-figma-sections.mjs`) using the frame's named,
full-width child blocks. Live band boxes come from stable `data-component`
selectors (`config.mjs` → `BAND_SELECTORS`), so the harness never edits render
code to find a section. `body` is the union from the top of `ProfileHero` to the
bottom of `ProfileContentBlock`.

For each band: crop both sides, normalize to a common width+height, **blur then
downscale**, and compute the mean normalized RGB distance (0 = identical). Blur +
downscale collapses glyph- and photo-level content differences into similar
gray while preserving section order, spacing, sizing, color blocks, and
alignment. A band present on one side only scores 1.0 (structural miss).

## The gate

Each band is classified in `config.mjs` (`BAND_CLASS`):

- **feature** (`body`, `cta`, `pledge`) — sections this project builds. **GATED.**
- **chrome** (`nav`, `breadcrumb`, `footer`) — shared, already-shipped site
  chrome. Reported, **not gated** (and their live box bounds don't map cleanly to
  the thin Figma bands anyway).
- **data** (`elections`) — a shared block whose diff is dominated by seeded-data
  **volume** (how many counties are listed), not layout. Reported, **not gated**.

The **gate** = design-height-weighted mean of the **feature** bands. A state is
GREEN when that gated score ≤ `TOLERANCE` (3%). `report.json` also carries
`overallAll` (every band) for reference. **The loop does not stop until every
`status: active` state is GREEN.**

## Commands

```bash
node harness/run.mjs                 # capture + diff ALL states -> report + gallery
node harness/run.mjs A,C,G           # only those states while iterating
node harness/run.mjs --no-capture    # re-diff last capture (fast; e.g. after mask/config edits)
node harness/run.mjs --run before    # name the run dir for before/after compares
node harness/extract-figma-sections.mjs > harness/figma-sections.json   # regen figma bands
```

Artifacts land in `/tmp/people-harness/<run>/` (plus a `latest` symlink):

- `actual/<ID>.png` — live full-page screenshot
- `side-by-side/<ID>.png` — **vertical stack of `[Figma | Live | Diff]` per band**
  (reads top-to-bottom like the page; **this is the main thing to look at**)
- `diff/<ID>.png` — the worst feature band's red-highlight overlay
- `gallery.html` — every state's strip + per-band scores on one page
- `report.json` / `report.md` — gated + per-band scores, ranked worst-first
- `capture.json` — live band boxes (for debugging alignment)

## The loop (run this until parity)

1. **Run** `node harness/run.mjs`. Read `report.json` / the printed table.
2. If every active state is GREEN → **STOP. Parity reached.**
3. Take the **worst-scoring active state**. Open its `side-by-side/<ID>.png` and
   the Figma ref `/tmp/figma-shots/figma-<letter>.png`. Find the band with the
   highest feature score and look at where its diff panel is red.
4. **Diagnose** the specific divergence (start from the known-divergence
   checklist below). One concrete hypothesis at a time.
5. **Fix in code:**
   - `src/lib/peopleProfile.ts` — view model
   - `src/components/people/personSectionOverrides.tsx` — section content
   - `src/components/people/personProfileSections.ts` — section order/template
   - Shared UI (`src/ui/ProfileHero.tsx`, `ElectionsSidebar.tsx`,
     `ProfileContentBlock.tsx`, `ProfileContentCard.tsx`) is **also used by live
     `/candidate` — change carefully** and re-verify nothing else broke.
6. **Re-run that state** (`node harness/run.mjs <ID>`); confirm the band score
   dropped.
7. Every few fixes, run the **full** pass — shared components mean a hero fix can
   move B, C, and G too.
8. Back to 1. Do not stop early, do not lower `TOLERANCE`, do not declare done on
   vibes — the gated number has to be GREEN.

### Guardrails

- After any code edit, before trusting a green: `bun run typecheck` must pass
  (this repo hides type errors at runtime — see `AGENTS.md`).
- Never edit the Figma PNGs, `figma-sections.json`, or the diff output to force a
  pass. The only legitimate way to move the number is changing the page.
- Smallest change that fixes the red region. Re-check `/candidate` after touching
  shared UI.

## Exceptions (the ONLY reasons a state may stay non-green)

For a region that can't match because the data doesn't exist yet (not because the
layout is wrong):

1. **Mask it:** add `{ band, kind, rect:[x,y,w,h] }` to that state's `masks` in
   `config.mjs` (rect in band-local fractions). The region is painted flat gray in
   both images before scoring. Or flip the whole state to `status: 'blocked'` if
   it's unmatchable end-to-end.
2. **Log it in `FOLLOWUPS.md`** — state, region, why, and who owns the real fix.

Known exception classes: **heatmap / voter-density map** (data not wired up),
**true data gaps** (design shows a field our systems don't provide for the seeded
person). Masks are a last resort with a written justification — never a cover for
a real layout bug.

## Known divergences to check first (from the pre-audit)

1. **Hero subtitle** → `"{role} for {position}, {location}"`, not bare `"Candidate"`.
2. **"Join the movement" CTA** missing its **"Learn more"** button.
3. **Sidebar**: missing Current Term / Election Date; `"Party"` → `"Political
   Affiliation"`; contacts as an **icon row**; officeholder needs **Office
   Contact + Mailing Address**.
4. **Content column starts too low** (whitespace); hero photo should overhang into
   the **left column only**.
5. **Officeholder issues** split into **"Top Priorities While in Office"** +
   **"Accomplishments During This Term"** (status-bearing).
6. **Recent Experience** shows current office (Incumbent/present) + **"View
   Position"** links.
7. **Officeholder section order** differs from Figma.

Trust the diff, not the list — some of these may already be done. Also note the
**unclaimed states (D/E/F/H)** show a Figma `CTA Block` band that our code renders
as an in-column claim card, so the harness flags `cta (missing:live)`. Resolve by
matching the Figma structure, not by hiding the band.

## Refreshing inputs

- **New/updated Figma:** re-export frame(s) to `/tmp/figma-shots/figma-<L>.png` at
  desktop scale, refresh metadata (`get_metadata` → `harness/figma-metadata.txt`),
  and regenerate `figma-sections.json`.
- **Seeded data changed:** update slugs in `config.mjs`.
- **Dev server:** must be on `:3009` (`bun run dev`).
