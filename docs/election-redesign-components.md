# Election page redesign: building the new page sections

Context for the batch of page sections being built for the redesign of the election
**location** pages, election **position** pages, and the **For Voters / Voter Hub**
page. Marketing owns the component list; this doc is what a Claude Code session
needs to know before building one of them.

Read this together with the **`new-component`** skill, which owns the mechanics of
adding a block. This doc does not repeat those steps. It covers what the skill does
not: which blocks are already covered by something existing, the second wiring path
that data-backed blocks need, and the decisions that must stay consistent across the
whole batch.

Source of truth for the list is marketing's component spreadsheet. The inventory at
the bottom of this doc is a snapshot for orientation, not the authority. Where the
two disagree, the spreadsheet wins and this doc should be updated.

## Step 0: the reuse audit comes first (blocking)

**Do not build any component from the list until the audit is done and marketing has
approved the resulting build list.** This was decided up front (Emily, 2026-09-15)
for a reason: there are already 44 page-builder blocks, and a first pass suggests
roughly half the requested components may be satisfiable by an existing block, or by
adding one field or option to one.

That matters beyond saved effort. Every new block is another entry in the Studio
add-block menu that the marketing team has to recognise and choose correctly. Two
near-identical blocks are worse than one block with an option.

The audit should produce, for each item on the list, one of:

- **Already covered.** An existing block does this. Name it.
- **Extend.** An existing block does this with one added field or option. Name the
  block and the field. This is a much smaller change than a new block, and is
  covered by `docs/adding-a-component.md` rather than the `new-component` skill.
- **New block.** Nothing covers it. Say which of the two kinds it is (see below).

Unverified starting hypotheses, for the audit to confirm or reject rather than
trust:

| Requested | Existing block worth checking first |
| --- | --- |
| Featured cities carousel | `component_featuredCitiesBlock` |
| Animated map block | `component_voterDensityBlock` (the map itself is built) |
| Animated number block | `component_statsBlock`, plus the animation |
| 3-step How to run for [Position Name] | `component_stepperBlock` |
| Nearby offices | `component_listOfOfficesBlock` |
| "Who's currently in office" | `component_listOfOfficesBlock` |
| Candidates/Representatives rows | `component_candidatesBlock` |
| Featured candidates/Representatives | `component_candidatesBlock` |
| Header_* (all four position headers) | `component_electionsPositionHero` |
| Siderail | the sidebar inside `component_electionsPositionContentBlock` |
| About [Position Name] | `component_electionsPositionContentBlock` |
| 3-column icon block | `component_iconContentBlock` |
| Testimonial block with link | `component_testimonialBlock`, plus a link field |
| Branded CTA with icon | `component_ctaBlock`, `component_ctaBannerBlock` |
| 3-block CTA with icon | `component_ctaCardsBlock` |
| 3-column e-book support block | `component_ctaCardsBlock`, `component_twoUpCardBlock` |
| Find elections container | `component_electionsSearchHero`, `component_electionsIndexBlock` |
| Find more elections block | `component_electionsIndexBlock` |
| Local election rows block | `component_electionsIndexBlock` |
| Browse elections in Location Hero | `component_locationLandingPageHero` + the search hero |

`src/sanity/schema/lists/list_pageSections.ts` has the full list of existing blocks.

## The two kinds of block, and the wiring most sessions miss

This is the most important technical point in this doc, because getting it wrong
produces a block that passes typecheck, lint and the test suite and then renders
nothing on the live site.

**Content-only blocks** take everything they display from Sanity fields. The
`new-component` skill covers these completely. Examples on the list: the divider,
the icon blocks, the CTA blocks, the testimonial.

**Data-backed blocks** display live election data: candidate rows, nearby offices,
who currently holds a seat, filing dates, results, anything filtered by district.
That data cannot come from Sanity. It comes from `election-api` at render time and
reaches the block through `SectionOverrides`.

Neither the `new-component` skill nor `docs/adding-a-component.md` mentions
`SectionOverrides`. A block built by following only those will have editable Sanity
fields and no path for election data, and an empty render is not a type error. So
for a data-backed block there is a second wiring pass after the generator:

1. Add an entry for the new `component_*` type to the `SectionOverrides` type in
   `src/PageSections/index.tsx`, describing the data the block needs. Document what
   it is for, as the neighbouring entries do.
2. In the dispatch `switch` in the same file, pass that override into the section
   component as a prop.
3. Read it in the `*Section.tsx` wrapper and map it onto the UI component's props.
4. Populate it in the route's override builder in
   `src/lib/electionsTemplateHelpers.tsx`:
   - position pages → `buildPositionSectionOverrides`
   - location index pages → `buildElectionsIndexSectionOverrides`
   The data itself comes from `src/lib/electionsApi.ts`.

Working examples to copy rather than invent: `component_candidatesBlock` (a list of
people fed per page, including the `byKey` pattern for rendering the same block type
twice on one page with different data) and `component_voterDensityBlock` (a prebuilt
node handed in, with a `hidden` flag for when there is nothing to show).

**Decide the empty state deliberately.** A data-backed block can legitimately end up
with no data, and it can also be dropped by an editor onto a page whose route does
not populate its override. Either render something sensible or set `hidden`. Never
leave it rendering an empty shell, and say in the block's own comment which pages
actually feed it.

## Settled decisions

Apply these across the whole batch so the blocks stay consistent.

- **The reuse audit gates the build.** See Step 0.
- **These are permanent, reusable blocks**, not experiment components. They go in the
  normal locations the generator targets (`src/sanity/schema/components/`,
  `src/PageSections/`, `src/ui/`). Marketing's older "vibe code" guide says custom
  components live in an `experiments/` folder; that does not apply here, and
  `src/experiments/` today holds only experiment resolution machinery, no components.
- **Build one component per PR.** Twenty-eight blocks in one branch is unreviewable,
  and each one needs its own visual check.
- **Visual verification is not optional.** A block that is half-wired renders as
  nothing and an error boundary swallows render errors, so nothing fails. Confirm on
  `http://localhost:3009/all` before opening a PR. For pixel parity against Figma,
  use the `marketing-ui-clone` skill.
- **Page state comes from data, not from an editor's choice.** Where a component
  varies by where an election is in its cycle (pre-filing, mid-election,
  post-election), that is a fact derived from filing dates and certified results, not
  an editorial decision. Model it as one block that reads the state, not as separate
  blocks an editor picks between. Ten of thousands of position pages cannot be
  hand-switched as their elections progress, which is the whole point of templates.

## Open questions, to settle before building the blocks they affect

Several are marketing's own, from the spreadsheet. Do not guess at these; they change
how many blocks get built.

- **Featured candidates vs Featured representatives:** one block or two? The pledge
  block differs between them. Leaning two, for editor clarity (Emily).
- **Candidates/Representatives rows vs "Who's currently in office":** leaning
  separate blocks because the data differs (Emily).
- **Badge callout:** standalone block, or part of the Featured
  candidates/representatives block?
- **Find more elections vs the other search block:** is the only difference the
  social proof line at the bottom? If so this is one block with an option, not two.
- **The four position headers:** per the settled decision above, these should be one
  block with a data-derived state rather than four. Needs marketing's sign-off, as
  the spreadsheet currently lists four.

## How these blocks actually reach the live pages

Building a block does not put it on any page. Location and position pages are
template-driven, so after the code ships an editor adds the block to the relevant
global template in Sanity Studio (Location - State / County / City / District, or
Position). `docs/election-templates-manual.md` is the editor guide.

Two consequences worth stating to whoever is waiting on the work:

- Publishing a template edit affects **every page in that family at once**. There is
  no per-page rollout. Preview via the template's own preview pane first.
- There is one Sanity dataset behind dev and production, so content cannot be staged
  per branch. **Code must reach production before the template edit that uses it**,
  or the template references a block production does not have. See
  `docs/content-vs-code.md`.

## The build loop

Once the audit says an item is a new block:

1. Read this doc's relevant sections and the **`new-component`** skill.
2. Confirm with the requester, in plain language, what the block shows and how it
   should look. Get the Figma frame.
3. Decide: content-only or data-backed. If data-backed, plan the override wiring
   before scaffolding.
4. Follow the `new-component` skill. Do the extra wiring pass if data-backed.
5. Verify on `/all`, then `typecheck` / `lint` / `test`.
6. Ship with the **`ship-pr`** skill.

## Inventory snapshot

From marketing's spreadsheet as of 2026-09-15. "Kind" is a provisional read for the
audit to confirm; `data` means it needs the `SectionOverrides` pass.

| Component | Page | Kind |
| --- | --- | --- |
| 3-column icon block | Voter Hub, position, location | content |
| Testimonial block with link | Voter Hub, location | content |
| Browse elections in Location Hero | location | data |
| Local election rows block | location | data |
| Find elections container | location | data |
| Featured cities carousel | location | data |
| Featured candidates/Representatives | location | data |
| More about location container | location | content |
| Header_Pre-Filing | position | data |
| Header_Mid-Election | position | data |
| Header_Post-Election | position | data |
| Header_Post-Election_Multiple winners | position | data |
| Siderail | position | data (share opens a modal) |
| Badge callout | position | content |
| Filter by seat/district | position | data, interactive |
| Candidates/Representatives rows block | position | data |
| Branded CTA block with icon | position | content |
| "Who's currently in office" block | position | data |
| About [Position Name] | position | data (token-driven copy) |
| 3-step How to run for [Position Name] | position | content + post-election state |
| 3-column e-book support block | position | content |
| Nearby offices | position | data |
| Find more elections block | position | data |
| Video hero with search | Voter Hub | content + search, video modal |
| Animated number block | Voter Hub | content |
| Animated map block | Voter Hub | data |
| Divider | Voter Hub | content |
| 3-block CTA with icon | Voter Hub | content |

## Kickoff prompt

Paste this to start a session on one of these components:

```
We're building page sections for the election location and position page redesign.
Read docs/election-redesign-components.md first, then the new-component skill.

Component: [name from the spreadsheet]
Page: [location / position / Voter Hub]
Figma: [link or frame name]

Start with the reuse check that doc asks for and tell me what you find before
building anything.
```

For the audit itself, before any component is built:

```
Read docs/election-redesign-components.md. Do the Step 0 reuse audit for every
component in the inventory: for each, say whether an existing block already covers
it, whether it needs one field added to an existing block, or whether it's a genuinely
new block, and whether it's content-only or data-backed. Report the build list for
approval. Don't build anything yet.
```
