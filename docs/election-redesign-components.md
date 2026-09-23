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
| Testimonial block with link | ~~`component_testimonialBlock`, plus a link field~~ — audited, rejected. Built as `component_testimonialBlockWithLink`; see below |
| More about location container | ~~`component_locationFactsBlock`~~ — audited, rejected. Built as `component_locationEditorialBlock`; see below |
| Branded CTA with icon | `component_ctaBlock`, `component_ctaBannerBlock` |
| 3-block CTA with icon | `component_ctaCardsBlock` |
| 3-column e-book support block | `component_ctaCardsBlock`, `component_twoUpCardBlock` |
| Find elections container | `component_electionsSearchHero`, `component_electionsIndexBlock` |
| Find more elections block | `component_electionsIndexBlock` |
| Local election rows block | `component_electionsIndexBlock` |
| Browse elections in Location Hero | `component_locationLandingPageHero` + the search hero |

`src/sanity/schema/lists/list_pageSections.ts` has the full list of existing blocks.

### Audit results so far

**Testimonial block with link** (location pages, Voter Hub) — built as
`component_testimonialBlockWithLink`, content-only.

The starting hypothesis above was wrong. `component_testimonialBlock` is a static three-across
grid of tall cards; the design is a side-scrolling carousel of wide two-column cards. The real
near-match was `component_carouselBlock`, which already has the header, the prev/next arrows and
the pagination pills at the exact Figma sizes — the Figma frame is even named "Carousel Block".
Marketing chose a separate block anyway (Emily, 2026-09-15) rather than adding a card-style
option to the carousel, so the two now sit next to each other in the Quote menu group.

Two things that came out of it and affect other components in the batch:

- **Per-quote data lives on the `quote` object**, not on the block. The block reads quote
  documents through the shared `quotesContentCollection`, so a field only a single block needs
  still has to be added to `src/sanity/schema/groups/quote.ts` and it then appears on every quote
  in Studio. This added `field_quoteResult` (the short outcome line) and `button` (the
  "Read the story" link). Both are optional, and the other quote blocks ignore them.
- **A nested object on a quote needs a GROQ projection.** `quoteGroq` spreads `...`, so a plain
  text field flows through on its own, but the link had to be projected explicitly
  (`button{${buttonGroq}}`) or it would have arrived as unusable raw data with no type error.

Note for whoever wires up the links: a case study that lives as an `article` can be picked with
the internal link picker, but `/people/*` profiles are rendered from election-api and have no
Sanity document, so a profile link has to be the External option with a pasted path.

**More about location container / Location editorial block** (location pages) — built as
`component_locationEditorialBlock`. The inventory below calls it content-only; it is not. Treat
that row as corrected.

Nothing existing covered it. `component_locationFactsBlock` was the starting hypothesis and is
the wrong base: it is built around its fact cards, returns `null` without them, and reads in the
Studio menu as the stats block. `component_electionsPositionContentBlock` is the two-column
sidebar layout, `component_bannerBlock` is a one-line banner with avatars, and
`component_imageContentBlock` needs an image. There is no plain prose block on the site.

The reason it cannot be content-only is the one that applies to every block in this batch that
wants per-page words rather than per-page numbers:

- **One block instance serves the whole family.** Location pages render from the global Location
  templates, so a paragraph typed into the block's Sanity field is the same paragraph on every
  state, or every city, in that family. Per-location prose therefore has to arrive through
  `SectionOverrides`, exactly like the facts and the office list, even though it is editorial
  copy rather than election data. This is the first block in the batch whose override carries
  *words* instead of figures, and the same will be true of "About [Position Name]".
- **The seam is `locationEditorial` on `ElectionsIndexPageContext`**, mapped in
  `buildElectionsIndexSectionOverrides`. No route populates it yet. Where the AI-written copy
  will be read from is not decided (Emily, 2026-09-21: parked). Until it is, the block is
  hidden on location pages, which is deliberate — see the empty state below.
- **The Sanity body field stayed, as a fallback only**, for pages that are not template-driven.
  Its Studio description says not to fill it on the location templates. The override wins over
  it, so the field is what gets replaced when the copy starts flowing.
- **The empty state is "render nothing at all".** The block returns `null` when neither source
  has copy, rather than publishing a heading over an empty white card. That card would be the
  silent-failure shape this doc warns about: nothing throws, so no boundary catches it.
  `src/ui/locationEditorialBlock.test.tsx` pins it.

One thing that came out of it and affects other blocks in the batch:

- **`[location]` was a known token that no location page supplied.** `KNOWN_ELECTION_TOKENS` has
  always listed it, but `buildElectionsIndexTokens` only built `[State]`, `[County]`, `[City]`
  and `[District]`, and an unsupplied known token is stripped to empty. So the Figma heading
  "More about [Location]" would have published as "More about" with the name silently gone. It
  now resolves to the most specific place the page represents (city, else county, else state).
  Any other block in this batch with a location-named editable heading can now use it.

**Header_Pre-Filing / Mid-Election / Post-Election / Post-Election multiple winners**
(position pages) — one block, not four: `component_electionsPositionHero`, updated in place.
Settled with Emily on 2026-09-23; the spreadsheet's four rows are the four states of this block.

The starting hypothesis held. The existing hero already carried the office, the location and the
two dates and was already fed per page through `SectionOverrides`, so this was an "Extend", which
means the PR is a draft that waits for the rest of the position page set (see "Updating an existing
block" below). Things that came out of it:

- **The state is derived, never chosen.** `resolvePositionHeroState` in
  `src/lib/positionHeroState.ts` reads the filing window, the general election date and the
  winners, and returns `filing`, `midElection` or `decided`. The rules, as marketing set them:
  `filing` runs from six months before the filing window opens until the deadline (before the
  window opens the copy switches to "Filing opens" and "Days until filing opens"); `midElection`
  runs from the deadline until results are in; `decided` needs at least one winner, and splits on
  one versus several. After election day with no result, the mid-election layout stays, the
  countdown goes and the ballot card hides. More than six months before the next window, the
  previous cycle's result holds the page in `decided`. Any other position block that varies with
  the cycle should read this resolver rather than invent its own thresholds.
- **"Election date" means the general.** `getRaceBySlug` already prefers the general race for a
  slug (election-api orders general → primary → runoff), so a page is mid-election after its
  primary and before the general without extra work here.
- **The ballot card follows the zero-versus-unknown rule.** `candidates` is `undefined` when the
  route could not read the race's candidacies and the card is not rendered; an empty list is a
  real zero and renders "0 candidates filed so far". The candidate rows are fetched per page by
  `loadPositionHeroCandidates`, which joins `/v1/persons` so the pledge mark follows
  `pledgedFromSpine`, the same rule the candidate cards use.
- **Winners are a seam, not a feature yet.** election-api records no result on a candidacy (the
  `ElectionResult` enum exists in its Prisma schema but no column uses it), so `winners` and
  `priorWinners` on the hero override are never populated and no live page reaches the decided
  state. The seat count for the multiple-winner button is `Race.numberOfSeats` (BallotReady's
  `number_of_seats`), which the API already returns and `RaceDetail` now types. Ask the election
  data team for per-candidacy results and current terms before expecting states 3 and 4 live.
- **The hero's own button is gone.** The frames hide the left-hand CTA; the links live in the
  cards and come from the route (`candidatesHref`, later `resultsHref`). The Sanity `ctaAction`
  field is kept but hidden and marked deprecated so the live template documents that still carry a
  value raise no "unknown field" warning in Studio. The three intro sentences are editable per
  state (`field_filingIntro`, `field_midElectionIntro`, `field_decidedIntro`) with the Figma copy
  as the default, and accept the office and location tokens.
- **Where the frames and the live scale disagreed.** The body sizes ramp, as the width note below
  says, and two places needed a token other than the obvious one: the location line uses
  `text-3xl` (24 on mobile, 32 at 1440, exactly the frames) rather than a heading token, and the
  countdown labels use `text-md`, because `body-2` grows to 18px at 1440 and the two countdowns no
  longer fit side by side in a 308px card. The timeline's three anchors sit at fixed thirds rather
  than at their real dates, because a filing window that closes a month before election day put
  "Filing deadline" on top of "Election day".

## The shared election counts, as marketing defined them

Settled with Emily on 2026-09-17 while building the location hero's four stat cards.
Several other blocks in the batch want the same counts, so treat these as the batch's
definitions rather than one block's, and state them verbatim in any request to the
election data team.

- **Year scope.** Every figure follows the year the offices list opens on: the current
  year when it has elections, else the soonest year ahead
  (`resolveDefaultElectionYear` in `src/lib/electionsHelpers.ts`).
- **Geographic scope.** The whole location including its sub-locations, so a state
  figure counts county and city races too. This makes a hero figure larger than the
  list of offices below it, which is accepted because that list carries its own
  heading.
- **Independent** means the person has taken the GoodParty.org Pledge, by the same
  rule the candidate cards and profiles use (`pledgedFromSpine`: the spine's
  `isPledged`, and no major-party evidence). It does not mean party affiliation, so
  `classifyParty` is the wrong tool for this count.
- **Uncontested** means exactly one candidate on the ballot per seat, counted for any
  race where we hold candidate data, including races whose filing window is still
  open.
- **Zero versus unknown.** Show 0 when the data genuinely says zero; hide the element
  when there is no data. These differ: `Person.isPledged` is unpopulated across
  production today (see `docs/person-spine-pledge-and-claim-linkage-handoff.md`), so a
  zero pledge count is a no-data zero and must not be published as "0 independents".
- **Editor versus data.** The label is editable in Sanity, with location tokens; the
  number always comes from the data. These blocks live on global templates, so a
  number typed in Studio would otherwise freeze the same figure across thousands of
  pages.

None of these counts is available from a location page today. `/v1/candidacies` has no
place filter, so they need either per-race calls or a whole-state sweep joined on
`raceId`. The right fix is one aggregate from election-api, keyed by place and year,
which the candidates rows, "who's currently in office" and nearby offices blocks will
all want too.

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
- **Updating an existing block? Hold the PR as a draft and batch it.** (Emily,
  2026-09-17.) Still one component per PR, but the merges are not all alike:
  - A **new** block shows nothing on the live site until an editor drops it onto a
    page, so its PR can merge as soon as it is green. Content controls go-live.
  - A PR that **updates a block already on the live templates** has no such safety.
    The moment that code reaches production, every page carrying that block changes,
    with no content step and nothing to stage behind. Location and position pages are
    template-driven, so that is thousands of pages at once, mid-redesign, with the
    other components not built yet.

  So for an update: get it green, then convert the PR to a draft rather than leaving
  it in the merge queue (`gh pr ready <n> --undo`), and say in the body which batch it
  is waiting on. Release those together once the set that makes up a page is ready,
  instead of letting the page change in pieces. The reuse audit in Step 0 already
  tells you which kind you have: "Extend" and "Already covered" mean draft and batch,
  "New block" can ship on its own.
- **Build for the finished system, not for today's data.** (Emily, 2026-09-17.) These
  components are being built one at a time, but they are designed as one page. Build
  each one so it works the way the design intends once the whole batch and its data
  wiring exist. Do not shrink a component to what today's data can fill, do not drop
  a part of a design because its data source is missing, and do not fold another
  component's job into yours because that one is not built yet.

  In practice that means: model the full shape of the thing now, leave an obvious
  seam where the live data will attach, and decide an honest interim state for the
  part that has none. Prefer hiding an element over publishing a wrong or invented
  figure on a public voter page, and say in the PR exactly what is waiting on which
  data. A Sanity field is a reasonable placeholder for a figure that will later be
  live, but only when the label stays editable and the number is what gets replaced.

  What this rules out is a component that "works" today and has to be redesigned to
  accept its data later.
- **Visual verification is not optional.** A block that is half-wired renders as
  nothing and an error boundary swallows render errors, so nothing fails. Confirm on
  `http://localhost:3009/all` before opening a PR. For pixel parity against Figma,
  use the `marketing-ui-clone` skill.

  Note that `/all` carries none of the election blocks, so a block in this batch
  cannot be seen there until an editor adds it — and that means editing shared
  production content. Rendering the block's own Storybook story and measuring its
  geometry against the frame is the practical substitute; pair it with a test that
  runs the section wrapper through the real props so a schema-vs-GROQ name mismatch
  still gets caught.
- **Where this Figma file and the live scale disagree, the live scale wins.**
  (Measured while building the location editorial block, 2026-09-21.) Two systemic
  gaps, neither of them a bug to fix in a single block:
  - **Width.** The frames draw page content 1280 wide on a 1440 artboard (80px
    gutters). The site's widest container, `Container size='xl'`, is 85rem centred,
    which is 1200 of content at 1440. Use the container. A section 40px wider than
    the facts cards above it reads as broken, and there is no 1280 container in the
    scale.
  - **Body text size.** The frames use a fixed 18px. The site's type tokens step up
    with the viewport (`body-large` is 18/28 at phone width and 20/31 at 1440). Use
    the token; the frames simply do not model the ramp.

  Headings are worth checking per block, because the ramp does not always match
  either: the editorial block's frames are 32px on mobile and 48px on desktop, which
  no single token gives, so it pairs `heading-lg` with a `max-md:text-heading-md`
  override. Both are registered in the tailwind-merge font-size list; a size that is
  not in that list is silently dropped (see `.cursor/BUGBOT.md`).
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
- ~~**The four position headers:** one block or four?~~ Settled 2026-09-23: one block,
  `component_electionsPositionHero`, with a data-derived state. See the audit results above.

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
| More about location container | location | data (audited — built, see above) |
| Header_Pre-Filing | position | data (audited — one state of the existing hero, see above) |
| Header_Mid-Election | position | data (audited — one state of the existing hero, see above) |
| Header_Post-Election | position | data (audited — one state of the existing hero, see above) |
| Header_Post-Election_Multiple winners | position | data (audited — one state of the existing hero, see above) |
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
