---
name: marketing-ui-clone
description: Make a gp-marketing page pixel-match its Figma frame. Reverse-engineers the design via the Figma MCP, checks the live render with element-geometry (not blurred pixels), and drives the code to parity. Use when a page (especially the /people profile states A–L) "doesn't match Figma", "looks off", has a spacing/whitespace problem, or needs pixel-perfect parity. Self-contained: no committed harness scripts. Do NOT use harness/run.mjs — it misleads (see below).
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, mcp__claude_ai_Figma__get_design_context, mcp__claude_ai_Figma__get_variable_defs, mcp__claude_ai_Figma__get_metadata, mcp__claude_ai_Figma__get_screenshot
---

# Marketing UI clone (Figma parity)

Get a gp-marketing page to match its Figma frame exactly, and prove it with
numbers. This is the gp-marketing counterpart of the gp-webapp `ui-clone` skill:
same Figma-extraction technique, adapted to this repo's conventions, plus a live
geometry check because these pages already exist and are data-driven.

## Read first: do NOT trust the raster harness

`harness/run.mjs` compares blurred, downscaled pixels against a 3% gate. It
misled the original build and you should not use it. Three reasons:

- It measures a lossy proxy (blurred density), not element position.
- Its score is dominated by seeded-copy-vs-placeholder text noise, so it barely
  moves when real layout changes.
- It averages a ~3600px region, so a 266px layout gap is a rounding error. It is
  blind exactly where the bugs live.

If someone reports a page looks wrong but the harness is "green", believe the
page. Use geometry below.

## The method

Figma and the DOM are both coordinate systems. At 1440px (the Figma frame width)
compare each element's box to its Figma node's box. The signal is a ranked list
of pixel deltas, nothing averaged away. Three disciplines keep it honest:

1. **Compare positions, not text-driven heights.** Real data differs from Figma's
   placeholder copy, so a copy-filled box's height legitimately differs and that
   is not a defect. Anchor on top/left, and on width/height only for fixed-size
   things (avatars, icons).
2. **Measure relative to a stable anchor** (the hero). Comparing vertical position
   relative to the anchor cancels the nav/breadcrumb chrome offset, so a delta is
   real layout, not page offset.
3. **The tool ranks; you confirm.** A large delta on shared chrome (nav,
   breadcrumb, footer) or on a data-volume block (the elections county list) is
   usually not a bug. Never declare parity from a number alone. Full parity =
   geometry + tokens (color/type) + a human visual pass.

## gp-marketing codebase context

Different repo from gp-webapp, so the conventions differ. Do NOT map to shadcn or
`@styleguide` here.

- **Stack:** Next 15 App Router, Sanity CMS, Tailwind v4, `tailwind-variants`
  (`tv` from `src/ui/_lib/utils`), some styled-components. Run with Bun.
- **Presentational components:** `src/ui/*.tsx`, styled with `tv({ slots, variants })`.
  Profile pieces: `ProfileHero`, `ProfileContentBlock`, `ProfileContentCard`,
  `ElectionsSidebar`.
- **Section wrappers:** `src/PageSections/*Section.tsx` inject Sanity/profile data
  into the ui components.
- **Pages are template-driven:** `/people/[slug]` resolves a Sanity `personProfile`
  template and renders ordered sections via `renderElectionTemplatePage`. So the
  hero and the content block are SEPARATE stacked sections, not one grid — keep
  that in mind for cross-section layout (e.g. the hero/content overlap).
- **Measurement hooks:** components carry `data-component="..."` attributes
  (`ProfileHero`, `ProfileContentBlock`, `BreadcrumbBlock`, `Header`, `Footer`,
  `CTABannerBlock`, `GoodPartyOrgPledge`, `ElectionsIndexBlock`). Use these as
  live selectors.
- **Shared components:** `ProfileContentBlock` is also used by `/candidate`. Scope
  any layout change meant only for people profiles (e.g. via a className on the
  people section wrapper), never bake it into the shared component.
- **Code style:** tabs, single quotes, semicolons, no comments by default, match
  the surrounding file. Verify with `bun run typecheck` and `bun run lint` before
  a PR (see `CLAUDE.md`; the app hides type errors, so typecheck is the only way).

## The 12 profile states

`harness/config.mjs` maps each state (id A–L, slug, figma letter). Its `STATES`
array is the source of truth for slugs. Example: A = claimed-candidate =
`allen-slagle-74eee01a`.

## Workflow

### 1. Start the page
```
PEOPLE_DEV_FIXTURES=true bun run dev    # port 3009; the flag seeds mock-volume data
```
The Sanity token is NOT required locally (the production dataset is public-read).
If Playwright complains about a missing browser: `bunx playwright install chromium`.

### 2. Pull the Figma reference (the authoritative target)
Get the frame node id for the state from the Figma file. Then, via the Figma MCP:

- `get_screenshot` on the frame — read it carefully, this is ground truth for
  what the page should look like.
- `get_design_context` on the frame or a section — returns the real text and
  reference code with exact spacing/sizes. Adapt values to this repo's Tailwind
  classes; do not paste the reference code verbatim.
- `get_variable_defs` — exact hex for every color token. Map each to this repo's
  Tailwind class by grepping `src/ui/_styles/globals.css` and the Tailwind config
  for the brand class names (e.g. `midnight-900`, `goodparty-cream`,
  `halo-green-100`). Never guess a hex.

**Verify labels before trusting positions.** `get_metadata` gives coordinates but
the layer NAMES in this file are reused template junk ("About Me Header" appears
for several different sections; some frames are wholly wrong, e.g. state H is a
cloned claimed-candidate frame — see `harness/FOLLOWUPS.md`). Confirm which
coordinate belongs to which section against the screenshot before believing a
delta. This verification is the difference between this skill and the harness that
failed.

### 2b. Map Figma tokens to gp-marketing BY VALUE, never by class name

CRITICAL: gp-marketing's Tailwind token scale does NOT match the Figma design
system (which is shadcn-based, like gp-webapp). The SAME class name means a
DIFFERENT value — Figma `rounded-md` is 6px, gp-marketing `rounded-md` is 12px;
`shadow-sm` in v4 is stronger than Figma's `shadow/xs`. Copying a Figma or
`get_design_context` class name into gp-marketing silently renders the wrong
result (this cost us two wrong passes on one pill). Resolve by VALUE:

1. Read gp-marketing's token definitions — `src/ui/_styles/globals.css` (radii,
   spacing, shadows) and `src/ui/_styles/colors.css` (colors). Build a
   value → class lookup, e.g. `--radius-md: 12px` ⇒ `12px → rounded-md`.
2. Take the RAW value from Figma `get_design_context` — `6px` (not "rounded-md"),
   `#d4d4d4`, the shadow's `0 1px 2px rgba(0,0,0,.05)`.
3. Resolve: exact value → use that class. No match → use the arbitrary value
   (`rounded-[6px]`) AND flag it in `harness/FOLLOWUPS.md` ("Figma <value> has no
   gp-marketing token"). Never silently snap to the nearest wrong token — the
   flags are the evidence base for a future token-alignment decision.

Known divergences (see `harness/FOLLOWUPS.md`): radius scale is shifted ~one step
up (gp-marketing sm8/md12/lg16 vs shadcn sm4/md6/lg8 — no 6px token); v4
`shadow-sm` ≠ Figma `shadow/xs` (use `shadow-xs`). Verify shadow/border/color by
value too, not by name.

### 3. Measure the live render (self-contained, no committed scripts)
Write this throwaway script to the REPO ROOT (so it resolves the repo's
`playwright`), run it, then delete it. Pass any selectors/headings you care about.

```js
// .uiclone-measure.mjs — throwaway; delete after running.
import { chromium } from 'playwright';
const url = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 }));
await page.waitForTimeout(2000);
const data = await page.evaluate(() => {
	const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }; };
	const out = { components: {}, headings: [] };
	for (const el of document.querySelectorAll('[data-component]')) {
		const name = el.getAttribute('data-component');
		if (!out.components[name]) out.components[name] = box(el); // first instance
	}
	for (const h of document.querySelectorAll('h1,h2,h3,h4')) {
		const b = box(h); if (b) out.headings.push({ text: h.textContent.trim().slice(0, 60), ...b });
	}
	return out;
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
```
```
node .uiclone-measure.mjs "http://localhost:3009/people/<slug>" > /tmp/uiclone.json
```
Read `/tmp/uiclone.json`, then `rm .uiclone-measure.mjs`.

### 4. Diff, relative to the anchor
For each element: `liveRelTop = live.top - live[ProfileHero].top`, and
`figmaRelTop = figma.top - figmaBandTop` (band top is the hero's dark band). The
delta is `liveRelTop - figmaRelTop`. Rank by absolute delta, worst first. Compare
width/height only for fixed-size elements.

Present the ranked deltas. Call out which are real layout (fixable), which are
shared chrome (report-only), and which are data-volume noise.

### 5. Confirm, fix, re-measure
For the top real offender:
- Confirm against the Figma screenshot side by side.
- Find the component (`src/ui/Profile*.tsx`, composed by
  `src/PageSections/Profile*Section.tsx`). Make the smallest faithful change,
  scoped to people profiles if it touches a shared component.
- Re-run step 3 and watch the delta collapse to ~0.
Repeat down the list. A propagating offset (e.g. the content well displaced, so
every section below inherits it) means fix the ROOT first, then re-measure the rest.

### 6. Across states
Repeat per state. Verify each state's Figma frame is correct first (some are
wrong). A fix to a shared component must be re-checked on every state, not just
the one you were on.

## Definition of done

A state is at parity when every measured element is within a few px AND you have
signed off visually on color, type, and the details geometry cannot see (shadows,
radius, icons). Never declare parity from the number alone.

## Section ORDER is per-state data, not a shared guess

Geometry parity is only half the job — the frames also disagree about the ORDER
and GROUPING of the content sections, and that is where this page kept
regressing (the designer raised the same ordering bug four review rounds in a
row). The cause each time was the same: one shared section list in code, tuned
to whichever frame was open, silently wrong for the others.

Before changing section order, read the order off EVERY affected frame and
write it down. The four claimed frames genuinely differ:

| | A candidate | B officeholder | C both | G past |
|---|---|---|---|---|
| opens with | Why + Campaign Issues | Top Priorities + Accomplishments | Why + Campaign Issues | About Me + Recent Experience |
| Other Candidates | before About Position | absent | before Top Priorities | LAST |
| About Position vs District | Position → District | **District → Position** | Position → District | **District → Position** |
| Nearby Officials | absent | last | last | before Other Candidates |

Rules that fall out of this, and that the code now encodes:

- **Order is per persona.** `SECTION_ORDER` in `personSectionOverrides.tsx` maps
  each persona to its section list, cites the frame node ids, and is the ONLY
  thing that decides which sections a persona shows. Do not re-add a
  `holdsOffice(...)`-style gate next to the content — two places to express
  "candidates have no accomplishments" is how they drift apart.
- **Lock it with a test.** `personSectionOverrides.test.ts` asserts the exact
  heading sequence per state against the frame node ids. Ordering had NO test
  before, which is why every regression reached the designer instead of CI. If
  a frame changes, change the expectation and cite the new node id.
- **Two sections can come from one field.** Figma C/G show "Campaign Issues"
  (no status tags) and "Top Priorities While in Office" (status tags) as
  separate sections; both are `view.issues`. Partition by the data that
  distinguishes them (`issue.status`) rather than by persona. Seed fixtures for
  BOTH kinds or a state silently collapses to one section — which is exactly
  how C shipped "smooshed".
- **Heading level follows position in the card, not the section.** The frames
  give a card's FIRST section a 32/44 heading (Figma `typography/3xl`) and every
  section stacked under it a 24/32 one (`typography/2xl`), both Outfit SemiBold
  — so "Campaign Issues" is 32px when it leads a card and 24px when it sits
  under "Why I'm Running for Office". `ProfileContentBlock` derives this from
  the card's index within its chunk; never hardcode a level on a section.
  Note these two sizes are FLAT: the frames use them on the mobile artboard
  too, which is why `--text-section-heading` / `--text-section-subheading` are
  omitted from the stepped `@media` blocks that scale the `heading-*` ramp.
- **Grouping is expressed by `group`, and adjacency matters.** Consecutive
  cards sharing a `group` merge into one white card (`chunkCardGroups`). Two
  sections that are adjacent in one state's order but must stay separate cards
  (Nearby Officials and Other Candidates in G) need DIFFERENT group keys —
  reusing one `people` group merges them the moment a frame puts them together.

## Layer names lie; use structure + one `get_design_context` to confirm

`get_metadata` is the cheap way to recover a frame's section order (sort the
content column's children by `y`), but the layer names in this file are cloned
junk — "Why Running", "About Me Header" and "Mailing Address Section" each name
several unrelated sections. Identify sections by their STRUCTURE and by text
width, then confirm with one `get_design_context` (or the frame screenshot) that
returns real copy. Useful tells in this file: a 409px-wide "Top Issues Header"
is "Top Priorities While in Office" while a 182px one is "Campaign Issues"; a
"Mailing Address Section" carrying a tagline pill + button is a Recent
Experience row; avatar + "Pro Blocks / Tagline" cards are a people section.

## Troubleshooting (lessons from real runs)

- **Live doesn't match the source you expect? Verify the CURRENT source FIRST.**
  Before blaming a stale dev server, grep the file for the actual class/value the
  page is rendering (e.g. `grep "lg:w-" src/ui/ProfileHero.tsx`). A git
  stash/pop/checkout, or a teammate, may have changed or reverted the file since
  you last edited it. Dump the element's live `className` and computed style in the
  measurement script to see exactly what is applied. Only restart the dev server
  after you have confirmed the source really does contain your change. (Turbopack
  does hot-reload edits; a git operation that rewrites the file may not trip the
  watcher, but that is the rare case, not the first thing to suspect.)
- **Coordinate deltas say WHERE, not WHY, and can mislead on spacing.** A uniform
  header drift looks like "the gap is too small", but the cause may be structural.
  Before changing a gap/padding value, pull `get_design_context` for that
  container and read the real structure. Real example: the content column looked
  compressed by ~24px per section; `get_design_context` showed the design groups
  sections into SEPARATE rounded cards (`gap-24`, ~40px card padding) where the
  build uses ONE card (`gap-32`) — the live gap was actually looser. The fix was a
  card-grouping restructure, not a gap value. Never tune a spacing number to make a
  delta go to zero without confirming the structure matches first (that is the
  harness's optimize-the-number failure in a new disguise).
- **Font size silently vanishes when combined with a text color.** gp-marketing's
  tailwind-merge (used by the `Text` component, `cn`, and `tv` slots) does NOT know
  the repo's custom text COLORS (`text-midnight-900`) or SIZES (`text-caption`,
  `text-[0.875rem]`), so it lumps them into one `text-*` group and keeps only the
  last — usually the color — and DROPS the size. Symptom: an element renders at the
  inherited 16px despite a size class, and two "identical" pills differ because one
  has the color on a separate element. Even type hints (`text-[length:…]` /
  `text-[color:…]`) don't save it. Fix: put size and color on SEPARATE elements
  (container = color + shape; inner span = size + weight, no color). Always confirm
  with a computed-style read (`getComputedStyle(el).fontSize`), never the source
  class — the class you wrote may not be the class that landed. (Root cause + the
  proper config fix are logged in `harness/FOLLOWUPS.md`.)
- **Coupled magic numbers.** A fixed-size element can also feed a layout offset:
  e.g. the hero avatar size drives the straddle negative-margin in `ProfileHero`
  (`-mb = avatarSize - 200`) AND the sidebar clearance in `ProfileContentBlock`.
  Changing the size means updating every derived offset in lockstep, or the layout
  breaks. Grep for numbers derived from the old size before and after the change,
  and re-measure the dependent elements, not just the one you touched.

## What NOT to do

- Do not use or resurrect `harness/run.mjs` or its 3% score.
- Do not commit the throwaway measurement script; delete it each run.
- Do not trust `figma-metadata.txt` layer names — coordinates only, and verify.
- Do not map to shadcn / `@styleguide` (that is gp-webapp; wrong here).
- Do not chase deltas on shared chrome or data-volume blocks.
- Do not bake a people-profile layout change into a component `/candidate` shares.
- Do not declare done without a human visual pass at 1440px.
