# Election page redesign: building the new page sections

Context for the batch of page sections being built for the redesign of the election
**location** pages, election **position** pages, the **For Voters / Voter Hub** page,
and the **person profile** pages (`/people`), which marketing treats as part of the
voter guide (Emily, 2026-10-06). Marketing owns the component list; this doc is what
a Claude Code session needs to know before building one of them.

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
  covered by the `update-component` skill rather than the `new-component` skill.
- **New block.** Nothing covers it. Say which of the two kinds it is (see below).

Unverified starting hypotheses, for the audit to confirm or reject rather than
trust:

| Requested | Existing block worth checking first |
| --- | --- |
| Featured cities carousel | ~~`component_featuredCitiesBlock`~~ — audited, confirmed. Extended in place; see below |
| Animated map block | `component_voterDensityBlock` (the map itself is built) |
| Animated number block | `component_statsBlock`, plus the animation |
| 3-step How to run for [Position Name] | `component_stepperBlock` |
| Nearby offices | ~~`component_listOfOfficesBlock`~~ — audited, rejected. Built as `component_nearbyOffices`; see below |
| "Who's currently in office" | `component_listOfOfficesBlock` |
| Candidates/Representatives rows | `component_candidatesBlock` |
| Featured candidates/Representatives | ~~`component_candidatesBlock`~~ — audited, rejected. Built as `component_featuredCandidatesBlock`; see below |
| Header_* (all four position headers) | `component_electionsPositionHero` |
| Siderail | ~~the sidebar inside `component_electionsPositionContentBlock`~~ — audited; that block's left card was the About card, not a rail. Now one part of the rebuilt `component_electionsPositionContentBlock`; see below |
| About [Position Name] | `component_electionsPositionContentBlock` — audited, confirmed; see below |
| 3-column icon block | ~~`component_iconContentBlock`~~ — audited, rejected. Built as `component_illustratedColumnsBlock`; see below |
| Testimonial block with link | ~~`component_testimonialBlock`, plus a link field~~ — audited, rejected. Built as `component_testimonialBlockWithLink`; see below |
| More about location container | ~~`component_locationFactsBlock`~~ — audited, rejected. Built as `component_locationEditorialBlock`; see below |
| Branded CTA with icon | `component_ctaBlock`, `component_ctaBannerBlock` |
| 3-block CTA with icon | `component_ctaCardsBlock` |
| 3-column e-book support block | ~~`component_ctaCardsBlock`, `component_twoUpCardBlock`~~ — audited, rejected. Built as `component_electionPositionResourcesBlock`; see below |
| Find elections container | ~~`component_electionsSearchHero`, `component_electionsIndexBlock`~~ — audited: the hero is `component_electionsSearchHero`, extended; see below |
| Find more elections block | `component_electionsIndexBlock` |
| Local election rows block | `component_electionsIndexBlock` |
| Browse elections in Location Hero | ~~`component_locationLandingPageHero` + the search hero~~ — audited, extended the hero alone; see below |

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

**Browse elections in Location Hero** (location pages) — extended the existing
`component_locationLandingPageHero`; no new block.

The hypothesis above was right, with one correction: the design is not the hero plus the search
hero. The Figma frame has no search input at all (marketing confirmed the search moves to its own
component, Emily 2026-09-17), so the hero's input was removed. The rest of the redesign is a
two-column layout: headline, copy and up to two jump buttons on the left, up to three stat cards on
the right. The cards are the existing `Stat` component from the Stats Block — same design-system
colors the Figma uses, same count-up behaviour. `Stat` gained a `compact` size (16/20px padding,
`heading-lg` value) to match the Figma card; the default size is untouched, so the Stats Block
renders as before.

The design was revised on 2026-09-24 (Figma 2032-21473 desktop, 2032-21815 mobile): four cards in a
2x2 grid became three across, the figures changed (see below), and the two buttons were added. The
buttons are ordinary Sanity buttons using the Anchor action, and the templates carry matching anchor
ids so they have somewhere to jump to.

Revised again on 2026-10-05 (Figma 2188-38655 desktop, 2188-38397 mobile) after design feedback.
The three cards were already right. The second button changed from "Search all elections" (the
elections index) to "See who's an independent", an anchor to the featured candidates block, on all
four location levels. Decisions settled with Emily, 2026-10-05:

- **Two figures are live data, zero included, and hide when they cannot be trusted.** Both describe
  the ballot the offices list below shows, in the year it opens on, so the hero and the list can
  never disagree (Emily, 2026-10-05: "the counts in this hero block match the counts in the list of
  offices"). The cards are told apart by colour, since the design gives each colour to one card:
  - **Halo green, races on the ballot**: the count of the list's own rows (`ctx.offices`) whose date
    falls in `ctx.defaultYear`, handed in as `raceCount`. It needs no extra fetch, and it follows
    whatever the list shows, so when the list gains the parent levels (draft PR #304) the count does
    too, without a code change here. Unknown (no offices data) hides the card; an empty list is 0.
  - **Lavender, independent candidates**: the pledged candidates on that ballot in that year,
    summarised by `summarizeIndependents` in `src/lib/featuredPeople.ts` from the same people the
    featured block gets (`featuredPeople` on `ElectionsIndexPageContext`), handed in as
    `independents`. The card is left out when `candidatesComplete` is false, which is when the
    ballot had more upcoming races than `FEATURED_RACE_BUDGET` covers or the place could not be found.

  The editor's labels and the election-day placeholder are untouched. Off the location pages the
  overrides are absent and the cards render as written.
- **The ballot is own level and up, never down.** `getFeaturedPeople` now reads the parent county
  and state places as well as the page's own (the same tiers `nearbyOfficesTiers` returns), filters
  each tier by level the way the offices list does, and asks every upcoming race on that ballot for
  its candidates, soonest first. This is the offices list's own rule from PR #304 ("a voter in
  Houston also votes in Harris County and Texas races; someone on the Texas page does not vote in
  every municipal race in the state"). It widens the featured candidates carousel the same way, on
  purpose: the "See who's an independent" button lands on that carousel, and a count that included
  state candidates over a carousel that excluded them would disagree with itself. Representatives
  stay the page's own officeholders. The race budget rose from 16 to 48 to fit real city ballots
  (Houston's offices list carries 38 races across all years; the hero only asks upcoming ones).
  This replaces the counts section's earlier "whole location including sub-locations" scope.
- **The template's body copy wins over the route's default** (Emily, 2026-10-07). Each location route
  still hands the hero a default sentence, but it only fills in when the template field is empty.
  Before this the route's line overrode the redesign copy marketing wrote in Studio, on every page.
- **The button hides only when nobody is pledged.** A button anchored to `#independents` is left out
  unless a pledged candidate or officeholder was found in any upcoming election; one found is proof
  even from a partial list, so the button can show while the card hides. The anchor ids live in
  `src/constants/electionAnchors.ts`, and the featured candidates block answers to `#independents`
  when an editor sets no anchor id, so the seeded button lands without matching ids being typed.
- **District pages do not exist** (Emily, 2026-10-05), so nothing here handles a district tier
  specially; the district template and routes keep whatever they did before.

Three things worth carrying to the rest of the batch:

- **A midnight block must not put `text-white` on its section wrapper** if it contains pastel
  cards. The cards inherit it and their text disappears. Put the text color on the copy column
  instead, which is what the Stats Block already does.
- **The election date is still a Sanity field.** The race count and the independent count are live
  (see above). The date is computable from what a location page already fetches and is the next to
  wire; the counts section below has the definitions.
- **A value that is not a count must not animate.** `Stat` counts a numeric value up from zero, so
  the election date rendered as "Nov. 0, 2026" on the way to "Nov. 4, 2026" until the parser learned
  to skip values with digits after the first run.
- **This block is going onto the existing location templates**, not freshly seeded ones, so the
  cards are empty until an editor fills them. The hero renders as a single column when it has no
  stats, which is the pre-redesign layout minus the search input.

Note for whoever wires up the links: a case study that lives as an `article` can be picked with
the internal link picker, but `/people/*` profiles are rendered from election-api and have no
Sanity document, so a profile link has to be the External option with a pasted path.

**Revision, 2026-10-06 (Emily): quotes picked by the page's state.** Marketing keeps a sheet of
quotes organised by state and wants each location and position page to show its own state's
quotes. The block stays content-only in the sense that every quote still comes from the editor's
chosen collection, but it now also reads the page's state through `SectionOverrides`
(`component_testimonialBlockWithLink.stateName`, set by both override builders), so it is the first
quote block with a data seam. How it works, and the decisions behind it:

- **The state lives on the quote** (`field_quoteState`, a dropdown of the 50 states and DC, storing
  the full name so it compares directly with the page's `stateName`). Same reasoning as the result
  and link fields above: per-quote data goes on the `quote` object, so it shows on every quote in
  Studio and is optional everywhere. One tagged collection beats a collection per state (33 to
  maintain by hand); the alternative, a list on the block pairing states with collections, was
  considered and set aside unless per-state ordering ever needs it.
- **The behaviour is behind a toggle** on the block's design settings
  (`field_filterQuotesByPageState`, off by default), so the block on any page today is unchanged.
- **Fill order** (`src/lib/nearestStates.ts`): the page's state's quotes, then the nearest states'
  quotes closest first, then quotes with no state. Nearness is distance between state centres, not
  shared borders: borders leave Alaska and Hawaii with nothing, and a state whose neighbours are all
  empty (Wyoming today) would need a second rule. Within a group the collection's order is kept.
- **How many**: "Max Number to Display", or 3 when it is blank, so a state with one quote does not
  drag in the whole country. Pages with no state (the Voter Hub, landing pages) show the collection
  as is, and a collection with no tagged quotes is shown untouched, so the block never goes empty
  because of the toggle. `src/lib/nearestStates.test.ts` and
  `src/PageSections/testimonialBlockWithLinkSection.test.tsx` pin all of this.
- **The content step is separate**: the sheet's quotes have to exist as tagged `quotes` documents in
  one collection, loaded after the Studio deploys (see `docs/sanity-api-writes.md`). Where a person
  already has a quote with different wording, the sheet's wording goes in as a new quote so the
  pages using the old one do not change.
**Featured cities carousel** (location pages) — extended `component_featuredCitiesBlock`,
data-backed. The hypothesis held: the block existed and its `LocationCard` was already the Figma
card. Two things were missing, and only the second was real work.

- **The layout.** It was a static three-across grid; the design is a carousel. The chrome came
  free from `Carousel.tsx` (`PrevButton`/`NextButton`/`useDotButton`/`usePrevNextButtons` and
  `CarouselIndicator`) exactly as `component_testimonialBlockWithLink` borrows it. Pagination
  pills are mobile-only per the design; desktop navigates with the arrows.
- **The scope.** The block showed the top three cities *nationally* on every page it appeared on,
  because it self-fetched `/v1/places/most-elections`. It now takes its cities from
  `SectionOverrides`, populated per page by `getFeaturedCities` (five cards, fewer when a place
  has fewer cities): the cities of a county on a county page, the surrounding county's other
  cities on a city page, every city in the state on a state page, and nothing on a district page.
  Pages that set no override — /elections, landing pages — keep the national list, which is why
  `buildElectionsIndexSectionOverrides` always sets `cities`, to `[]` if it has none. An unset
  value would silently put national cities back on a state page.

- **"[Cities]" is a block-supplied token.** Michigan's carousel is all townships, where "Cities in
  Michigan" reads wrong (Emily, 2026-10-07). Each card now carries the place's Census class (`kind`:
  city or town) and the block resolves `[Cities]` to "Municipalities" when any featured place is a
  town, "Cities" otherwise; `[cities]` is the lower-case form. The State and County templates write
  "[Cities] in [State]" / "[Cities] in [County]" and "Pick a location to see its upcoming races".
- **The header resolves location tokens** like every other template block. "Cities in [County]"
  published literally on the county pages until the section passed `tokens` through
  (Emily, 2026-10-07).

Three things that came out of it and affect other components in the batch:

- **`/v1/places/most-elections` cannot be scoped.** It takes `count` and nothing else, ranks by
  all-time race count, and excludes only states (`mtfcc <> 'G4000'`), so counties can come back
  as "cities". That is why the scoped counts are computed here instead: a county read with
  `includeChildRaces=true` returns its cities with their races in one call, but a state has no
  such read (cities are its grandchildren), so a state page sweeps every city and town in the
  state. The sweep is cached per state and shared by every page in it, but it is still the
  expensive half of this block, and it is the same aggregate-by-place-and-year that the hero
  stat cards, the candidates rows and nearby offices all want from election-api.
- **`/v1/places` supports `includeChildRaces`**, which is not obvious and is not what
  `includeRaces` does: `includeRaces` returns the parent's races, `includeChildRaces` returns
  each child's. Both need `includeChildren` for the children to appear at all.
- **"Open Elections" on a card means that city's next election cycle** — races this year when
  it has any, else the soonest year ahead — not the page's year and not an all-time total.
  Counting every city against the page's `defaultYear` would report 0 for a city whose own cycle
  falls a year later, and most cities would tie at zero. Cities with nothing upcoming are dropped
  rather than shown as "0 Open Elections". The exception is /elections, still on the national
  endpoint's all-time `race_count`; settle that when the aggregate lands.

Two things left alone deliberately: the state silhouettes in `public/icons/states/` are wrong for
some states (`tn.svg`, `ca.svg` and `fl.svg` are square-ish rather than the real outline), which
predates this work and needs the assets redrawn, not code; and the manual city list in Studio was
kept as the no-data fallback rather than deleted, because deleting the field would delete the
content already in it.
**List of Offices Block** (location pages) — **Extend**, not a new block. The existing
`component_listOfOfficesBlock` already had the bones of the design: cream section, white bordered
rows, the level tag, Type / Position / date columns, the arrow, the year dropdown and the mobile
card stack. The redesign adds the Level dropdown, the pill-shaped selects, an editable heading, and
tightens type and colour to the Figma frame (which is named "Candidates block" — it is the offices
table).

Four things from it that affect other components in the batch:

- **The Level filter goes up, never down, and opens on All.** A city page shows its own races together
  with its county's and its state's, and can narrow to Local, County or State; a county page shows County
  and State; a state page has only its own level and so shows no dropdown at all rather than one with a
  single choice (Emily, 2026-09-18; the All default replaced opening on the page's own level on 2026-10-05). Upward
  is a real ballot relationship — a city voter also votes in their county's and state's races. The
  reverse is not, and a state's every municipal race would be hundreds of rows. Downward navigation
  stays with the counties-and-cities list (`component_electionsIndexBlock`).
- **Towns, townships and villages are shown in display form** (Emily, 2026-10-09). Election data names
  them the way the Census does, proper name then a lowercase legal descriptor ("Bethlehem town",
  "Evesham township"), and the page showed them as delivered. `displayPlaceName` in
  `src/lib/placeDisplayName.ts` turns "X town" into "Town of X" and capitalizes the other descriptors
  ("Evesham Township", "Colonie Village"). It touches only a lowercase descriptor at the very end and
  never lowercases anything, so names with lowercase words inside them (Coeur d'Alene, Fond du Lac,
  Isle of Palms) and internal capitals (DeKalb, Bend-La Pine) are untouched, which is why there is no
  exceptions list. The raw name stays on the data: slugs, the office-name trim in `officeDisplayName`
  and the dedupe rules compare raw names, so the display form is applied where names are composed into
  headings, titles, breadcrumbs, cards, lists and the "City, ST" line, not in the fetchers.
- **An empty place list hides the index block; it never falls back to the states.** The block lists
  every state only when no page list is given at all (the /elections landing page). A county page
  whose place has nothing below it, such as a Virginia independent city like Virginia Beach, hands over
  an empty list, and the block renders nothing. The page also drops "cities" from its description.
  Before 2026-10-09 those pages showed all 51 states under "Cities in Virginia Beach".
- **The page level reaches the block as data, not as an editor's choice.** `locationLevel` was
  already in the index override context for the hero; the offices block now takes it too as
  `pageLevel`. One block serves all four location templates. Apply the same approach to the position
  headers rather than shipping four blocks.
- **The overlapping levels need no new API.** Each place arrives with its own races attached, so
  `buildOverlappingOfficeItems` in `src/lib/electionsHelpers.ts` reads the parent county and state
  places and takes theirs. That is one or two extra place reads per page, at ISR build time, inside
  the tagged 1h cache. The aggregate endpoint this doc asks for above is still wanted for the hero
  *counts*; it is not a blocker for listing overlapping races.
- **The opening year prefers the own level only while it has something upcoming.** Encinitas, CA's
  city races stop at 2024 while San Diego County and California vote in 2026, and the page opened
  on 2024 under an "Upcoming elections" headline (Emily, 2026-10-07). `resolveLocationDefaultYear`
  takes the own level's years when they hold this year or a year ahead, otherwise the union the
  dropdown offers, so only a place with nothing upcoming anywhere opens on a past year.
- **A client-side filter silently strips links from the HTML.** These blocks are `'use client'` but
  still server-render, so a `useMemo` that filters the array leaves the non-matching rows in no
  `<a>` at all — only in the RSC payload, as data. `/elections/tx` linked 3 of its 15 positions and
  `/elections/tx/harris-county` 5 of 20. Render every row and hide the ones outside the current view
  (`hidden` on a classless wrapper — it loses to a display class such as `flex` or `grid` on the row
  itself). Do this in any block in this batch that filters or paginates links. Do **not** solve it by
  putting the filter in the URL: these routes are statically generated with hourly revalidation, and
  reading `searchParams` would opt thousands of prebuilt pages into per-request rendering.

The heading is now the editor's `field_heading` with its location tokens resolved, falling back to
the heading the route computes. The templates already carried one ("State Elections in [State]",
"City Elections in [City]"); the block simply never rendered it, and published the bare level label
instead. That fix shipped separately, ahead of the redesign, as it was a live bug.

Revised after design feedback (Emily, 2026-10-05), in the same draft PR:

- **A "# of independents running" column** sits between Position and Election date, showing the
  row's pledged candidate count beside the Heart & Star badge; the phone card says "2 independents
  running" under the position. The count is the number of candidates in the row's race who have
  taken the Pledge, by the same rule as every other badge (`pledgedFromSpine`), summed across the
  race's districts because a position row stands for the whole race. Only a count above zero is
  drawn: zero and unknown look the same, so a row never publishes "0 independents" off a pledge
  flag that may be unwritten. `src/ui/listOfOfficesCrawlableRows.test.tsx` pins it.
- **The counts ride on the featured people fetch, not a second one.** `OfficeItem` now carries
  `raceSlug`, `FeaturedPersonCard` carries it too, and `withPledgedCounts` in
  `src/lib/electionsTemplateHelpers.tsx` groups the pledged candidates by race onto the rows. That
  makes this PR depend on the location hero's draft (#300), which widened the fetch to the parent
  county and state and raised `FEATURED_RACE_BUDGET` to 48; the two ship together with the location
  batch. Races past the budget have no count, which shows as nothing.
- **An editable description** (`listOfOfficesBlockDescription`: a show toggle and a rich text
  field) explains the badge under the heading. Documents saved before the field existed render the
  default copy. The editor types `[symbol]` where the badge belongs in the sentence and
  `insertPledgeSymbols` (`src/lib/pledgeSymbolToken.ts`) turns it into an inline badge; any block
  with a sentence that needs the badge can reuse it through `RichData`. The default copy has no
  "Read the full pledge" link because there is no pledge page on the live site, as the featured
  candidates callout found; add the link in Studio when the page exists.
- **Figma's 20px body is rendered at the live 18px `body-1`**, per the batch's settled scale.

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
  value raise no "unknown field" warning in Studio. The intro sentence is editable
  (`field_intro`) and accepts the office and location tokens.
- **Where the frames and the live scale disagreed.** The body sizes ramp, as the width note below
  says, and one place needed a token other than the obvious one: the countdown labels use
  `text-md`, because `body-2` grows to 18px at 1440 and the two countdowns no longer fit side by
  side in a 308px card. The timeline's three anchors sit at fixed thirds rather than at their real
  dates, because a filing window that closes a month before election day put "Filing deadline" on
  top of "Election day".
- **One H1 again, "[office] in [place]"** (Emily, 2026-10-06, from the revised frames 2156-29711
  and 2139-21610). The first round split the heading into the office as the H1 and the location as
  a `text-3xl` line under it; design went back to the single heading the live site has, but with a
  shorter place: the most specific tier plus the state code ("City Council in Bay City, MI",
  "County Attorney in Bay County, MI"), or the bare state name on a state page. A city page no
  longer names its county in the H1 (the breadcrumb still does), so two same-named townships in
  different counties now share an H1, as they already share a `<title>`. `heroLocation` in
  `src/ui/ElectionsPositionHero.tsx` is the rule, and the code comes from `normalizeStateCode`, so
  the route contract (city, county, state name) did not change. The same round collapsed the three
  per-state intro sentences into one `field_intro`, the same copy in every state, defaulting to the
  frame's "A nonpartisan guide to [office name] in [County or City]. Find candidates and elected
  officials who have turned down partisan and big-money influence." The three per-state fields had
  never reached Studio, so nothing carries them. The position pages' `[location]` token now
  resolves through the same `heroLocation` rule (Emily, 2026-10-06), so editor copy on the
  position and candidates templates reads "Brooklyn, NY" rather than "Brooklyn, Kings, New York";
  the location pages' `[location]` (most specific place, no state) is unchanged.

Revised from QA on the integration preview (Emily, 2026-10-06): **candidates are listed pledged first,
then the unpledged with no major party, then Republicans and Democrats**, stable inside each group (the
featured candidates block's rule). `rankPositionCandidates` in `src/lib/positionHeroCandidates.ts` orders
the one list the hero's "On the ballot" card (first four) and the position content block (all of it) both
read, so the two can never disagree. Before this, a pledged candidate could sit seventh in a nonpartisan
field and never reach the hero's card.

**Nearby offices** (position pages) — built as `component_nearbyOffices`, data-backed.

The starting hypothesis was `component_listOfOfficesBlock`, and marketing rejected extending it
(Emily, 2026-09-24): that block serves a separate purpose. It is the location pages' full offices
list, built around a year dropdown, a search filter and Show More inside a cream card, and it is
live on three global templates, so any change to it reaches thousands of pages with nothing to
stage behind. The design here is a plain heading over flat rows with no controls. The two blocks
share the row shape (`OfficeItem`) and nothing else.

Decisions that came out of it:

- **"Nearby" means the same place, then one level up.** Same city on a city position page, same
  county on a county page, same state on a state page. When the page's own place has no *other*
  upcoming position, the search moves one level up (city → county → state) and stops at the first
  tier that has any. The tiers come from the route segments, never from the place name, because
  some cities are named after a county they are not in. `nearbyOfficesTiers` in
  `src/lib/nearbyOffices.ts` is the rule; `getNearbyOffices` runs it.
- **Cap of eight rows** (Emily, 2026-09-24), applied in the data helper and again in the component.
- **Upcoming only, soonest first.** A row whose election has already happened is a dead end for a
  voter, so past races are dropped, and a place with only past races counts as empty for the
  level-up rule. Stale dates are refreshed the same way the location pages do it (any past date,
  not only primaries, since 2026-10-07).
- **The level tag is per row, from the race's own `positionLevel`** (Federal / State / County /
  Local), matching the mixed list in the Figma frame rather than the one-label-per-page tag the
  location list uses. The Figma tag colour is `blue/900`, which had no token; it is now
  `--blue-900` in `colors.css`.
- **The seam is `nearbyOffices` on `PositionPageContext`.** `renderElectionsPositionPage` fetches
  it, so all three position routes get it without touching their `page.tsx`. The candidates
  template does not populate it, and the block hides itself wherever the override is empty.
- **The empty state is "render nothing"**, pinned by `src/ui/nearbyOffices.test.tsx`.
- **Each row shows its "# of independents running"** (design feedback round, Emily, 2026-10-06;
  frames [desktop](https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2156-30518),
  [mobile](https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2139-21952)):
  the number beside the Heart & Star badge in a middle column on desktop, the badge and
  "2 independents running" under the position on the phone card. It is the same figure the
  offices list draft (PR #304) shows for a row: the candidates in the row's race who have taken
  the Pledge by `pledgedFromSpine`, counted once per person. Position pages had no candidate
  fetch, so `withPledgedCounts` in `src/lib/nearbyOffices.ts` asks `/v1/candidacies?raceSlug=`
  once per row (at most eight) plus one person lookup. Only a count above zero is drawn: a zero
  and an unknown look the same (see the counts section below), so a row never publishes
  "0 independents" off a flag that may be unwritten, and a race whose request fails shows
  nothing. The row grid was realigned to the new frame, which shares the offices list's
  geometry (123px type column, 16px gaps, 14px inset, 60px row floor). `OfficeItem` gained
  `raceSlug` and `pledgedCount` with the same names and wording as #304, so that draft's next
  merge of `develop` resolves trivially.
- **The sentence under the heading is an editable string field**, `field_description`, and
  the frame copy ("Explore offices coming up for election near you:") is the component's
  fallback, so documents saved before the field existed render it too (Emily, 2026-10-06).
- **The heading defaults to the page's own place** (Emily, 2026-10-06): "More offices in Bay
  City, Michigan", or just "More offices in Michigan" on a state position page, where
  `[County or City]` and `[State]` are the same name and the token form would double it. The
  route computes it (`heading` on the override) and an editor's Heading field, with tokens,
  wins over it. There is no two-letter state token, so the frame's "MI" is "Michigan".
- **Noted and not acted on** (2026-10-06): "Election Date" stays sentence case; the mobile
  frame places the count both above and below the date on different cards, and the block
  follows the above-the-date cards, as the offices list does.

Waiting on data: races are attached to places, and federal races are not attached to any place,
so a Federal tag can appear only once election-api exposes them per place. True proximity
(neighbouring cities, not just the parent county) needs the place-and-year aggregate the counts
section below already asks for.

**3-column e-book support block / Election position resources block** (position pages) — built
as `component_electionPositionResourcesBlock`. The inventory below calls it content-only; it is not.
Treat that row as corrected. The Figma frame is named "CTA Card Block": three equal cards (guide,
e-book, free support), each a white circle icon with a short label, a heading, a paragraph and a
dark pill button.

Nothing existing covered it. `component_ctaCardsBlock` was the starting hypothesis and is the wrong
base: it is fixed to two cards, each only a label and one large heading with the whole card as the
click target, and it is live on existing pages, so any change to it ships immediately (see the
draft-and-batch rule below). `component_twoUpCardBlock` has the closest card anatomy but is a
two-column list layout; `component_iconContentBlock` is the inverse of the design (a coloured icon
on a plain background). Marketing chose a purpose-built block over a generic one-to-three card
block (Emily, 2026-09-24) because of the data wiring the first card needs.

Why it is data-backed: the guide card's link is chosen per page. Marketing's blog article matrix
(in the position page design brief) maps office types to thirteen "how to run" articles, and the
office is only known at render time, so the link cannot be an editor field on a template that
serves every position page. `src/lib/howToRunGuide.ts` holds the matrix and the classifier that
applies it to a race's normalized name, full name, position names and level, falling back to the
general campaign guide. Special-purpose county boards (a county health commission, a planning
commission) go to the special-district article, not the county-commissioner one, which is for the
county's governing body (Emily, 2026-09-24). `buildPositionSectionOverrides` hands the result in as `guideHref`, which
wins over the guide card's editor-set link. The editor link only matters on pages that are not
position pages; with neither, the guide card is left out and the other two render. The other two
cards are plain editorial content ("Connect with us" goes to community.goodparty.org, Emily,
2026-09-24). Every card's heading and description accept `[office name]`.

Revised from QA on the integration preview (Emily, 2026-10-06):

- **The guide card shows its article's own title.** The editor heading's `[office name]` token
  printed the raw office name ("How to Run for County Recorder-Register of Deeds-Register of Mesne
  Conveyance"); the article the matrix picks is written for the office type, so its title reads
  properly. `renderElectionsPositionPage` reads the title from Sanity by the article's slug
  (`articleTitleBySlugQuery`) and hands it in as `guideTitle`; a miss falls back to the editor copy.
  The description still comes from Studio.
- **The e-book and support cards have default buttons** so a template saved before the block had
  buttons still renders them: "Read the guide" to `/e-book` and "Join the community" to
  community.goodparty.org (`DEFAULT_EBOOK_BUTTON` / `DEFAULT_SUPPORT_BUTTON`). An editor-set button
  wins. The Studio presets carry the same links and label, so a new document starts there too.

Two things from it that affect other blocks in the batch:

- **Reuse the `button` object for editor-set links.** It is the same object the quote's story
  link uses, projects through `buttonGroq`, and `normalizeRawCtaToButton` + `transformButton`
  turn it into button props. No new link fields were needed.
- **A figure-versus-words override can also be a link.** This is the first block whose override
  carries an `href` rather than data to display. The same "editor field is the fallback, the
  override wins" shape applies, and the Studio description on the field says so.

**Find more elections block / Elections Near You Block** (location pages, position pages, Voter
Hub) — extended, not rebuilt. `component_electionsNearYouBlock` already existed; it gained a
Layout field (Contained / Full Width) and the social proof row its Figma frame draws.

Two things from it that affect other blocks in the batch:

- **An added option must default to what already ships.** Documents saved before the field
  existed have no value for it, so `initialValue` in the schema does not reach them and the
  *component's* fallback is what they render as. The layout prop defaults to `contained` for
  exactly that reason, and `src/PageSections/electionsNearYouBlockSection.test.tsx` pins the
  absent case. Any other "Extend" item in Step 0 has the same trap.
- **Figma coupling is not the same as editor coupling.** The full-width frame (3093:3901) draws
  the social proof row and the contained frame (3096:3858) does not, so the obvious build ties
  the row to the layout. Marketing chose to keep them separate controls (Emily, 2026-09-25): the
  existing `field_showSocialProof` toggle now works, and either layout can carry the row.

When this shipped (2026-09-25) the block sat only on `goodpartyOrg_allComponents` (the `/all`
page), so it was the batch's one exception to the draft-and-batch rule: nothing a voter sees
changed. That no longer holds. By 2026-10-05 editors had placed it on three live landing pages
(`check-voter-registration`, `find-polling-place`, `request-mail-in-ballot`), so a change to it
now reaches those pages on deploy. Run the placement query in the `update-component` skill
before assuming anything about where a block is placed.

Noted and not acted on: both full-width frames label the search box "Enter your street address",
and the body copy says "Enter your address". The search resolves cities and counties only, so the
live copy was kept (Emily, 2026-09-25). Design owns whether the block should accept a street
address; that would be a change to `electionsNearYouSearch`, not to the block.

**3-column icon block / Illustrated columns block** (location pages; the spreadsheet also lists it for
position pages and the Voter Hub) — built as `component_illustratedColumnsBlock`, content-only. The Figma
frame is named "Icon Conent Block" [sic]: a centred heading and intro over three equal columns divided by
hairlines, each an uploaded 3D illustration, a heading, a grey sentence and a small blue text link with an
arrow. The heading is "Are you ready for [Location]'s next election?", so it leans on the `[location]` token
fix above.

`component_iconContentBlock` was the starting hypothesis and is the wrong base, for five reasons at once: its
icons come from the icon set inside a 48px coloured circle rather than an uploaded picture, its text is
centred rather than left-aligned, it has no dividers, its link is a filled pill rather than a text link, and
it is live on 28 landing pages, so every one of those options would have shipped as a draft-and-batch change
to live pages. The closest visual match is the voter readiness section inside the draft
`component_electionsPositionContentBlock` (PR #327), which is where the design came from, but that is one
section inside a single block that only position pages populate. `component_featuresBlock` has the card
anatomy but its items are references to product feature documents. Marketing confirmed a new block
(Emily, 2026-09-29).

Decisions that came out of it:

- **Column count is a Studio setting, not derived from the items.** (Emily, 2026-09-29.) The Design
  Settings tab reuses the existing Column Layout dropdown (2 / 3 / 4), defaulting to three. Items beyond
  the row wrap onto a second row and the vertical hairline is drawn per column with an `nth-child` rule
  rather than `divide-x`, so a wrapped row still divides correctly. Two columns go side by side from `md`,
  three and four from `lg`; below that the columns stack, centred, with a horizontal hairline between them
  (the mobile frame).
- **The block renders on the server, so its image passes no function props.** The first time the
  block met real content (the location template drafts, Emily, 2026-10-07) every location page showed
  "Something went wrong in Illustrated Columns Block", and the QA preview branch stopped building: the
  shared `ResponsiveImage` always attached an `onLoad` handler, and React refuses to pass a function from
  a server component into `next/image`. The handler is now attached only when a caller passes
  `setImageLoaded`. A plain `renderToStaticMarkup` test cannot catch this class of bug; the regression test
  inspects the element's props instead (`src/ui/responsiveImage.serverProps.test.tsx`).
- **Pictures, not icons.** Each column has an image field. The Figma illustrations are placeholder renders
  and are not baked into code; marketing uploads the final artwork in Studio.
- **The link reuses the `button` object** (same as the resources block and the quote's story link) and is
  always drawn as the blue text link from the frame, whatever hierarchy the editor picks. The colour is
  `info-500`, which is the frame's `theme/info` exactly.
- **Sizes follow the live scale.** The heading pairs `heading-lg` with `max-md:text-heading-md` (48 → 32,
  as the editorial block does); the column heading is `subtitle-1` (24 → 20, matching both frames) and the
  sentence is `body-2`. Measured at 1440 and 390 before the PR.
- **The empty state is "render nothing"**, pinned by `src/PageSections/illustratedColumnsBlockSection.test.tsx`.
- **Links share a baseline across a row** (Emily, 2026-10-05, from the revised frames 2188-38792 and
  2188-38505). The link is pinned to the foot of its column with `mt-auto`, so a one-line sentence next to a
  two-line one no longer leaves the links at different heights. The same round tightened the phone layout to
  the mobile frame: 24px between the intro and the first column, 8px between picture, heading, sentence and
  link inside a stacked column, and 48px clear on each side of the hairline between stacked columns. Desktop
  spacing was already on the frame and did not move.

The block reads `tokens` like the other content blocks, so the location templates fill `[Location]` in the
heading, intro, column text and link labels.

**Elections Search Hero** (Elections page) — extended, not rebuilt. `component_electionsSearchHero`
already existed and is live on exactly one page, the Elections landing page, as a centred dark hero with
a logo, a state dropdown and a button to that state's page. The redesign (Figma 2035:1471 desktop,
2035:2402 mobile) is a light two-column hero: left-aligned headline and body over a city or county
search, and a photo carousel with a floating quote card beside them. Marketing chose to redesign the
block in place rather than add a second hero (Emily, 2026-09-29), so this PR is held as a draft and
batched with the rest of the Elections page redesign.

Decisions that came out of it and affect other blocks in the batch:

- **The carousel viewport is padded for the shadows, not clip-margined.** `overflow-hidden` on the
  viewport cut the photo's and quote card's shadows off in a straight line (Emily, 2026-10-07, on
  the live page). Two attempts used `overflow: clip` with `overflow-clip-margin`; both still looked
  wrong because Chrome paints the margin area as a pale box over the page background (confirmed by
  toggling the clip off in devtools: the box vanished and the shadows matched Figma). The viewport
  now keeps `overflow: hidden` and is widened with padding on the left, right and bottom, cancelled
  by negative margins so the layout does not move. Each slide carries 5.75rem of empty left padding
  (the track pulls the first one back by that amount): the 4.5rem the viewport reveals plus the 20px
  the previous photo's shadow reaches into the gap, so the padding only ever shows empty gap, never a
  slide or its shadow; the right side only takes the page gutter (1rem, 1.25rem from `lg`).
- **A submit waits for the suggestions.** The Google Places script only starts loading on the box's
  first focus, so a quick "marion" + Enter used to submit the bare word; the resolve route cannot
  pick a state for it and the search failed until the second try (Emily, 2026-10-07, on both the
  hero and the Elections Near You block). `placeForSubmit` in `src/lib/electionsNearYouSearch.ts` now
  takes the picked suggestion, else the first one on screen, else fetches them for the typed text
  before resolving, and only then falls back to free text.

- **The search is one component now.** The city-or-county search that lived inside
  `ElectionsNearYouBlock` (Google Places suggestions, the resolve-place lookup, the analytics events,
  the navigation) was pulled out into `src/ui/ElectionsNearYouSearch.tsx`, and both blocks render it.
  Any other block in the batch that wants "the same search bar" (the Voter Hub video hero, for one)
  should render that component, not copy the form. It takes a `placement` string so the Viewed,
  Completed and Errored events can tell the blocks apart, and `layout` / `appearance` variants for the
  two looks the designs draw (the Near You pill with a map pin, the hero's squared field with a search
  icon). The placeholder stays "Enter your city or county" on both, for the reason recorded above.
- **The carousel content is block-local, not the quote library.** Slides live on the hero as a
  repeatable list (photo, quote, and a `ref_quoteBy` person for the name, title and avatar), so an
  editor adds as many as they want and picks a large photo per slide. The quote library was rejected
  because a person's profile picture is a small headshot and would be the only source for the 524px
  square (Emily, 2026-09-29). A person with no profile picture gets a quote card with no avatar.
- **Old fields were removed, not hidden.** The logo settings and background image had no home in the
  new design, so the schema no longer declares them. Studio shows the leftover values on the live
  document as unknown fields with a remove button; that is the one content cleanup the batch needs.
  The background colour field stayed and the component still defaults to midnight, because the live
  document was saved with that value and the redesign is cream; the editor switches it when the
  batch goes live.
- **Empty state is "text and search only".** With no slides the carousel column is left out and the
  hero collapses to one column, which is exactly what the live document renders until slides are
  added. `src/PageSections/electionsSearchHeroSection.test.tsx` pins it.
- **Default text sizes do not exist here.** `typography.css` clears Tailwind's `--text-*` scale, so
  `text-sm` and `text-base` are silently no-ops; a 14px label has to be `text-[0.875rem]`. The Near
  You block's listbox already did this, which is how it was noticed.
**Featured candidates/Representatives** (location pages) — built as
`component_featuredCandidatesBlock`, data-backed. The Figma frame is named "Blog Block" on desktop and
"Carousel Block" on mobile: a heading with prev/next arrows opposite it, a blue callout explaining the
Heart & Star badge, and a side-scrolling row of white portrait cards (200px round photo with the badge
over its corner, name, office, "City, ST", a dark "View profile" pill), pagination pills on the phone.

`component_candidatesBlock` was the starting hypothesis and is the wrong base: it is a two-column grid
of wide horizontal cards with a party line and a Show More button, it is live on the position
candidates template and rendered twice on every `/people` profile, and it has nowhere to put the
callout. The carousel chrome (`PrevButton`, `NextButton`, `CarouselIndicator`) and the badge (`Logo`)
were reused; the card is new (`FeaturedCandidateCard`).

Decisions that came out of it (Emily, 2026-09-29):

- **One block for candidates and representatives**, with a Who To Feature radio in Design Settings
  (both / candidates only / representatives only). Nothing on the page shows which was picked. A
  document saved without the field renders both.
- **The pledge callout is part of the block**, with its copy as a rich text field in Studio and a
  show/hide toggle. ~~There is no `/pledge` page on the live site today, so the default copy carries no
  link; the field description says to add one when the page exists.~~ Superseded 2026-10-06: the
  callout's link opens the pledge pop-up; see the revision below.
- ~~**Order: pledged first, then unpledged people with no major party, then everyone else.**~~
  Superseded 2026-10-06: pledged people only; see the revision below. Inside the pledged group,
  candidates by soonest election, then representatives by name. `rankFeaturedPeople` in
  `src/lib/featuredCandidates.ts` is the rule. Capped at eight, in the section and in the ranking.
- **The pledge is read by the same rule the `/people` cards use.** `pledgedFromSpine` (the spine
  flag, confirmed running, no major party in the evidence) is now exported from
  `src/lib/peopleProfile.ts` for it, so a badge in the carousel can never disagree with the person's
  own profile. The redesign doc's earlier line that the flag was unpopulated was stale; see the
  corrected counts section below.
- **The seam is `featuredPeople` on `ElectionsIndexPageContext`**, carrying two lists (candidates and
  representatives) so the Studio setting can choose at render time. `renderElectionsIndexPage`
  fetches it with `getFeaturedPeople`, so every location route feeds the block without touching its
  `page.tsx`. Absent, the override is `{ hidden: true }`.
- **Where the people come from.** Candidates: the place's own upcoming races (same level filter as
  its offices list), each asked through `/v1/candidacies?raceSlug=`, soonest election first, within
  a budget of sixteen races (`FEATURED_RACE_BUDGET`), six requests at a time. Representatives:
  `/v1/officeholders?geoId=` with the place's own `geoId` (now on `PlaceItem`; ask for it with
  `placeColumns`), current terms only. Both lists then read the person rows in one batch for the
  pledge flag, party evidence, photo and canonical slug, and honour the removed-people list the
  profiles honour.
- **The empty state is "render nothing"**, pinned by
  `src/PageSections/featuredCandidatesBlockSection.test.tsx`.

**Revised after design feedback (Emily, 2026-10-06; Figma 2188:38821 desktop, 2188:38534 mobile).**
The heading became "Candidates and officials who took the GoodParty.org Pledge", a body paragraph
appeared under it, and the callout box was redrawn: a bold title, the heart in its own column behind a
hairline (stacked on top on the phone), "GoodParty.org Pledge" in bold, and a blue "Read the full
pledge" link at the end. The code sits on the location hero's draft branch (PR #300), because the
people now follow the ballot that branch built. Decisions:

- **Pledged people only.** Unpledged people no longer fill the spare slots, since the heading says
  everyone shown took the Pledge. The filter is in `selectFeaturedPeople`, at render time, so the
  hero's independent count (which reads the raw lists) is unaffected. A place with nobody pledged
  shows no block at all.
- **Upward for people, officials included.** The carousel draws on the voter's ballot the way the
  hero's count does (the page's own races, then its county's, then its state's), and the current
  officeholders of every tier, each named with its own tier's place. Chosen over same-level-only
  because pledged people are sparse and most city and county pages would otherwise show nothing.
  The body copy therefore says "near you", not "in [location]".
- **The search's first query is answered, and its script is fetched early.** With `loading=async`
  the Google script's `load` event fires before `google.maps.places` is populated, so the query a
  visitor typed while it loaded threw, was swallowed, and showed nothing until the next keystroke;
  the loader now awaits `importLibrary('places')` and checks the classes (`awaitPlacesReady`). The
  script is also fetched once the page is idle rather than on the first click into the box, which
  put the first suggestion 0.5 to 0.75 s behind the first keystroke (timed live, 2026-10-08).
  Destination pages still take 1.7 to 2.4 s to first byte when uncached; that is page caching, not
  the search.
- **Pages with no ballot show a weekly rotation** (Emily, 2026-10-09). The /elections landing page is a plain
  landing page with no location, so its route hands the block nobody and the block rendered nothing. It now
  shows eight people drawn each week from everyone with a published GoodParty.org profile (gp-api
  `/published`), narrowed to pledged candidates with an upcoming election and current officeholders, photo
  required; past candidates who hold no office are left out. The draw is seeded with the ISO week
  (`weekKey`), weighted towards a product photo and an election within 120 days, so the set changes on
  Monday with no scheduled job and no stored list, and the pool grows on its own as profiles are published.
  Editors pin or exclude people on the block's Weekly Rotation tab (profile links or person ids; a
  link matches by the eight-character id tail the /people slugs carry). `getWeeklyFeaturedPeople` in
  `src/lib/featuredRotation.ts`; `FeaturedCandidatesRotationSection` renders it whenever no route
  override is present, so location pages are untouched. The body copy on that page should say "across
  the country" rather than "near you"; it is the editor's field.
- **A candidate card says "Candidate for".** The card shows one office line with no role, so a
  council member running for mayor read as the mayor (Japjeet Uppal, Livingston, CA; Emily,
  2026-10-08). A candidate's line is now "Candidate for [office]"; an official's stays the plain
  office. The position page rows were left as they are on purpose (Emily held that change).
- **A districted office above the page is not counted on it.** election-api folds every district
  of a shared slug into one race row per place (`getDedupedRacesBySlug`, on both `/v1/places` and
  `/v1/races`) and no feed says which districts cover a city, so San Francisco counted and featured
  an Assembly candidate from District 15, in Contra Costa (Emily, 2026-10-08). A candidacy with a
  `subAreaValue` from a tier above the page is left out of the candidates, the counts and the
  rescue; the office row still links to the position page, with no count. A statewide office counts
  everywhere beneath it, and a districted office counts on the page of the place that owns it. The
  real fix needs election-api to say which districts cover a place (position-to-place coverage from
  BallotReady); lift this rule when it does.
- **Only the upcoming ballot.** `/v1/candidacies?raceSlug=` returns every cycle of a slug, so past
  candidates appeared beside current ones (Emily, 2026-10-07, Holland, MI). A candidacy whose own
  `Race.electionDate` has passed leaves the candidates; one with a date uses it on the card.
  Officeholders were already limited to `isCurrent`. The first cut dropped Holland's sitting council
  members, who reached the block only through their 2025 race because `/v1/officeholders?geoId=`
  for the city did not list them: a past-cycle candidate whose person record carries a current
  `OfficeHolders` term now stays, as a representative card, when the feed missed them. That term
  only reaches the row when `/v1/persons?ids=` is asked for `includeOfficeHolders=true` (the list
  endpoint carries no relations by default), which the first cut forgot, so the rescue never fired
  on the live site; `getPersonsByIds` takes the flag and the featured-people loader sets it whenever
  it holds a past candidacy.
- **A person's own profile photo wins on every card.** The position page showed Thomas Nguyen
  (Garden Grove, CA) in BallotReady's photo while his profile showed the one he uploaded (Emily,
  2026-10-07). `resolveProductAvatars` in `src/lib/productAvatars.ts` reads gp-api's published
  list (a few dozen ids, cached five minutes), fetches the profile of each card person on it, and
  the live profile's `avatarUrl` replaces the feed photo on position candidates and officeholders,
  the featured carousel, and the profile's own related cards; the same rule the profile hero uses.
- **Seats both officeholder feeds miss come from past winners.** Garden Grove, CA's council page
  listed one member while District 5's 2024 winner (term 2025 to 2028 on her profile) was absent
  from both `/v1/officeholders?positionId=` and the place's `?geoId=` read (Emily, 2026-10-07).
  `loadSeatsFromPastCandidates` reads the office's candidacies, asks for up to 200 of those people
  with `includeOfficeHolders=true`, most recent cycle first, and keeps a current term for this
  office (same position id or normalised name). Same idea as the featured carousel's rescue.
- **Office names read the way voters say them.** election-api's normalised names ("City
  Legislature", "County Legislature-Executive Board", "Local Higher Education Board-Community College
  Board") headed every page (Emily, 2026-10-08). `officeDisplayName` in `src/lib/officeDisplayName.ts`
  takes BallotReady's own names for a local office (`positionNames`, now in `PLACE_RACE_COLUMNS`),
  drops the seat and the page place's own name, and shows what is left: "City Council", "Board of
  Supervisors", "County Commission", "Mayor". When those names disagree on one page or are missing it
  falls back to Emily's table (`OFFICE_NAME_FALLBACKS`), then a generic cleanup of "(Joint)" and
  hyphen-joined alternatives. State and federal offices keep their normalised names on purpose
  ("State Representative" stays). URLs are untouched. Shows in position headings, titles, breadcrumbs,
  the `[office name]` token, the offices list rows and the nearby offices block.
- **A position page lists one cycle.** `/v1/candidacies?raceSlug=` returns every cycle of a slug,
  so Garden Grove's council page showed two 2024 District 5 candidates, one of them the sitting
  member, as filed for 2026, and "5 candidates filed" where the location page counted 2 (Emily,
  2026-10-07). `currentCycleCandidacies` keeps a candidacy whose race date is still ahead, is the
  page race's own date, or is missing; the location page's count already worked this way.
- **Person ids go to election-api 200 at a time.** `/v1/persons?ids=` takes 500 ids on paper, but
  500 UUIDs make an 18.5 KB URL and the server answers 414 before it reads the request. Refreshing
  every past race date (2026-10-07) put enough races on the upcoming ballot that location pages hit
  the cap, the lookup returned nothing, nobody counted as pledged, and the block hid everywhere for
  about an hour. `getPersonsByIds` now splits the list into requests of 200 and resolves up to 1,000.
- **The count is a seam, not a figure.** The body copy accepts `[count of candidates]`, meaning
  the number of pledged people in the page's place *and everything inside it* (all of Texas on the
  Texas page). That is a downward count, and election-api cannot answer it today: a person row
  carries a state and the pledge flag but no county or city, and candidacies and officeholders can
  only be filtered by race, position, geo id or state. So no route supplies `pledgedCount` on the
  override, and the placeholder is left out of the sentence (the gap closes up) rather than filled
  from the partial carousel pool. The default copy carries no number. When the count is withheld,
  only the number is hidden, not the sentence.
- **Editable in Studio:** the heading (already was), the body copy, the callout title, the callout
  text, a Show Pledge Link toggle and its label. Nothing is placed anywhere yet, so the defaults
  could change to the frame's copy with no page affected.
- **The link opens a pop-up, not a page.** `PledgeModal` in `src/ui/PledgeModal.tsx` is a plain
  component any block can wrap a trigger in (Radix dialog, the same plumbing as the profile's
  notify form); it is deliberately not a Studio block. Its copy (title, intro, the three pillars)
  lives in code; its "Learn more" button goes to `/about`, there being no pledge page. Figma
  2156:29105 and 2156:29080. Move the copy into a settings document if marketing needs to edit it.

Noted and not acted on: the frame's heading is `gray-900` where the site's headings are black; the
mobile frame bolds the callout title where the desktop frame uses semibold (semibold on both).

**Request to the election data team** (the one query that finishes this block): a persons read
filtered by **place including its descendants** and by **pledge**, with the person's current
candidacy or office for the card, e.g. `/v1/persons?placeSlug=tx/harris-county&includeDescendants=true&isPledged=true&includeCandidacies=true&includeOfficeHolders=true`.
"Pledged" must mean the rule the profiles use (`isPledged` on the spine and no major-party evidence
on the candidacy or office). With it, `pledgedCount` becomes the result's length, the carousel can
switch from the ballot to the place, and the race budget goes away. Until then the budget still
means a ballot with more than forty-eight upcoming races is only partly featured.

**Profile hero** (every `/people` profile) — `component_profileHero`, an **Extend** of the block
already on the Person Profile global. Revised after the Voter Guide feedback round (Emily,
2026-10-06; frames 2139:26364 desktop and 2139:26634 mobile, plus the unclaimed pair
2156:34361 / 2156:34632). Two things were added under the name and office:

- **An intro paragraph** about the voter guide ("Learn about [candidate name]’s candidacy and
  positions on the issues. This guide is built by GoodParty.org, …"). It is a Studio text field on
  the block's new Text tab, one per subject, with the frame's copy as the preset in
  `src/lib/profileHeroDefaults.ts`; a template saved before the field existed renders the preset.
  The frames only draw candidates, so for someone who holds or held office the preset says
  "public service" instead of "candidacy" (Emily, 2026-10-06).
- **A pledge callout** replacing the one-line pledge status: a bordered box with one sentence and
  a "Read the full pledge" link that opens `PledgeModal`, the pop-up the featured candidates and
  position pages use (there is still no pledge page). The three sentences are marketing's and
  live in `pledgeCalloutCopy` next to the older lines: "This candidate took the GoodParty.org
  Pledge, promising to serve people first, independent of both major parties and big-money
  interests." / "…has not yet taken the GoodParty.org Pledge to serve people first, …" / "…is
  ineligible for the GoodParty.org Pledge due to partisan affiliation." The heart-and-star mark
  sits in the box only when the person took the pledge. "Candidate" becomes "elected official"
  for officeholders and past officeholders; someone serving and running keeps "candidate"
  (`pledgeSubject` in `personSectionOverrides.tsx`).

Decisions that came with it:

- **Removed profiles (K/L) carry the same callout as if they were not removed** (Emily,
  2026-10-06). The pledge flag is therefore no longer cleared on removal in `peopleProfile.ts`;
  removal still strips the photo and the authored content, and the pledge band's "Take the pledge"
  button stays off removed profiles: the page states the fact but does not invite someone who asked
  us to stop publishing them to sign up (Emily, 2026-10-06).
- **The hero no longer links down to the pledge band.** The callout explains the pledge through
  its own pop-up, so the `attributionHref` override is gone. The band itself is unchanged and
  still renders on every profile.
- **The band's height follows the text column** instead of being fixed at 240px, so the taller
  content (intro plus callout) cannot spill white text onto the cream. The portrait is anchored
  to the bottom of the row and overflows the band by a fixed 48px (`md`) / 68px (`lg`) as the
  frame draws it; `ProfileContentBlock`'s sidebar clearance moved with it (was 104/216).
- **Live scale over the frame**, per the settled decision: the intro is `body-2`, whose ramp
  (16 on the phone, 18 from 1280) happens to land on the frame's two fixed sizes, and the
  content sits in the 1200px container rather than the frame's 1280. At 1440 the callout's
  sentence therefore wraps to three lines where the frame fits two plus the link.

Noted and not acted on: the frames redraw the band's gradient as a linear ramp with a shader
layer. The request was the intro and the callout, so the fitted radial glow stays. The legacy
`/candidate` route shares the component and is untouched: no intro, no callout, the "Empowered by
GoodParty.org" line.

**Breadcrumb block** (every election template and the two position landing pages) —
`component_breadcrumbBlock`, an **Extend**, revised for the phone in the Voter Guide round
(Emily, 2026-10-06; frames 2139:26708 profile and 2139:21609 position). Below `md` the trail
shows its first and last crumb with a "..." between them, at the frames' sizes (Open Sans 14/20,
6px gaps, 15px chevrons, 24px above and below); tapping the "..." reveals the rest in place.
Every crumb stays in the DOM, so the links and the BreadcrumbList schema do not change. Desktop
is untouched. The treatment is the `collapseOnMobile` switch on `Breadcrumbs`, turned on by the
block's section wrapper and the two election page components that render the block directly; the
blog article hero and the political-terms glossary share the component and were not in the round,
so they keep the full trail.
**Profile content block** (every `/people` profile) — `component_profileContentBlock`, an
**Extend**. Revised in the same Voter Guide round (Emily, 2026-10-06; same frames as the hero,
with the block itself at 2139:26748 phone / 2156:34712 unclaimed phone). The block has no content
fields in Studio: everything inside it on a `/people` page is assembled in
`src/components/people/personSectionOverrides.tsx` from election-api data, so all three changes
are code, none is a template edit. Built on the hero PR's branch (#374), because both edit that
file and the content block's clearance, and both wait for the `/people` batch (PR #375).

- **A "Took the GoodParty.org Pledge" row in the siderail**, under Political Affiliation, with
  the heart-and-star mark, for anyone the pledge rule affirms (the same `pledged` flag the hero
  and the cards read). The frame puts "Signed on January 1, 2026" under it. **No pledge date
  exists in the data**: election-api carries a yes/no flag only. Marketing's source for the date
  is the HubSpot deal's closed-won date, to be carried onto the person record by the ETL the way
  `isPledged` is (Emily, 2026-10-06). The site reads an optional `pledgedAt` on the person and
  shows the row with its "Signed on" line when it is there; until then the row is not shown at all
  (Emily, 2026-10-06: a heading with only the mark under it was not worth showing in the meantime). To settle with the data team before it ships: which deal when a person has several
  (the earliest closed-won is the natural rule), whether closed-won is in fact when the pledge is
  taken (if not, "Signed on" overstates it), and that the deal is joined to the person the way
  "Confirmed Candidate" is.
- **A disclaimer under the authored sections**: "These statements come from [name] and do not
  reflect any positions or stances on individual issues held by GoodParty.org." as a 12px grey
  caption. It closes the platform card (after Campaign Issues, or after Why I'm Running when the
  owner wrote no issues), the About Me section (before Recent Experience, which shares the card),
  and the in-office card (after Accomplishments, or after Top Priorities when there are none).
  The frames only draw candidates, so the in-office card was Emily's call (2026-10-06): it is the
  person's own words as much as the platform is. Claimed pages only: the unclaimed placeholders
  are our copy, not the person's, and the unclaimed frame shows none. The name is the page's
  display name; the frames show a first name, but splitting names is unreliable.
- **A "What this symbol means" box above Other Candidates**: the heart-and-star mark, "Candidates
  and elected officials with this symbol took the GoodParty.org Pledge, promising to serve people
  first, independent of both major parties and big-money interests." and a "Read the full pledge"
  link opening `PledgeModal`. Third-person copy, so it renders on every profile that has the list
  (`PledgeSymbolCallout`, copy in `PLEDGE_SYMBOL_CALLOUT`). Nearby Officials is not in the frames
  and gets no box.
- **The cards, in the same round (Emily, 2026-10-06)**: a district pill beside the name
  ("District 5"; above the name on the phone), the heart-and-star mark on every pledged person's
  photo, and the lists showing three cards at a time with a "See more" button (`RelatedPeopleList`,
  the Candidates block's reveal rule with the frame's label), on both rails. The pill reads the
  feed's sub-area pair (`districtTag`: name and value, "Ward 3"): a nearby official's from their own
  office row; the other candidates' from the subject's race, which the candidacy rows do not carry,
  so the profile loader reads the race record once (`loadRaceDistrictTag`) and a miss leaves the
  cards untagged. **Pledged and claimed are the same thing** (Emily, 2026-10-06), so the mark follows
  the pledge flag on these cards (`showMark` on `CandidatesCard`), without the yellow frame the
  legacy `isGoodPartyCandidate` treatment draws; the frames draw no frame, and the production
  builders never set that flag anyway. The pledge line is unchanged.
- **Rail order: pledged people first, then the unpledged with no major party, then Republicans and
  Democrats** (Emily, 2026-10-06), the featured candidates block's rule, stable inside each group.
  `rankRelatedPeople` in `personSectionOverrides.tsx`; the cards carry `majorParty` from the same
  party rule the profile's own gating uses. It replaced the older "empowered first" sort, which the
  production builders could never trigger.
- **One office per profile page** (Cuomo, 2026-10-09). The breadcrumb's position crumb, "About
  [position]" with its term, next election and "Learn more" link, and "Other Candidates for
  [position]" are all built from one context, chosen by `selectPrimaryCandidacy` in
  `src/lib/peopleProfile.ts`, and that context is the office the hero names: the race the person
  is in (soonest election first, also for someone serving and running, where the race leads);
  else the office they hold or last held, linked through the term's own race slug; and only for
  someone with no office at all, their most recent concluded run. Before this, only a *current*
  office deferred, so Andrew Cuomo's page said "Former New York Governor" and "About New York
  Governor" over the Mayor's description, the 2025 mayoral election date, a link to the mayoral
  position page and the mayoral field as "Other Candidates for New York Governor". The two
  headings now read `positionName`, the context's name, which the loader passes alongside
  `positionId`; `officeName` stays the sidebar's and the placeholder prompts' office. A concluded
  run for another office is a Recent Experience row and nothing more.
- **A related-person card reads the same record its profile reads** (Mamdani on Cuomo's page,
  2026-10-09). `pledgedFromSpine` needs the person's party evidence, but `/v1/persons?ids=` sends
  scalars only unless asked, so a card built from a bare row saw one ballot line, "Working
  Families Party", and marked a pledge the person's own page called impossible off the
  Democratic line on his office. `loadOtherCandidates` and `loadNearbyOfficials` ask the batch
  for `includeOfficeHolders=true&includeCandidacies=true`, and a person listed on several lines
  of one race folds into one card that reads every line (`buildOtherCandidateCards`), labelled
  major party first like the profile. The mark stays on a pledged person with no major line
  anywhere on record (Jim Walden), because his own page says the same.
**GoodParty.org Pledge block** (person profile pages first; location and position pages once editors
place it) — extended, not rebuilt: `component_goodPartyOrgPledge`, the Studio block "GoodParty.org
Pledge". The Voter Guide frames (2156-34297 desktop, 2188-38249 mobile) show a centred heading and intro
over three columns of icon, heading and sentence, no buttons anywhere, on midnight. The block already had
the header, the cards, the mixed icon colours and the midnight background; it lacked a three-column
layout, a way to carry no buttons, and any preset content, so an editor adding it got an empty form.

Decisions that came out of it (Emily, 2026-10-06):

- **The `/people` profile band is the primary target.** The frames live in the Voter Guide file, but the
  block's one live placement is the Person Profile global, and marketing treats the profile pages as part
  of the voter guide. The band changes there, not only on the election pages when they get it.
- **Three columns is a third option in the existing Column Layout dropdown**, and the preset for a new
  block. That dropdown (`field_columnLayout12Columns`) is used by this block alone, so the new option
  reaches nothing else. Two columns from `md`, three from `lg`, stacked below. A block saved without a
  value keeps rendering two columns, pinned in `src/PageSections/goodPartyOrgPledgeLayout.test.tsx`.
- **Card buttons are gone.** The Button field on each pledge card is removed from the schema and the
  render. The section-level Buttons list on the Text tab stays, empty by default, because the `/people`
  band supplies one button per state through it ("Take the pledge" or "Learn more"). The retired
  Candidate Profile global still carries card buttons, which Studio now shows as an unknown field.
- **Studio pre-fills the block.** `src/lib/goodPartyOrgPledgeDefaults.ts` holds the heading, the intro,
  the three cards (Independent / People First / Anti-Corruption), midnight, mixed icon colours and three
  columns; the schema's `initialValue` and the person-profile code seed both read it so they cannot
  drift. The frame cuts the Anti-Corruption sentence off mid-way, so the full sentence that was already
  live is used. The frame also underlines "GoodParty.org" as a link to the homepage; that was left out
  of the preset (it is our own homepage, and the round was about removing links). An editor can still
  link it in Studio.
- **Sizes follow the live scale.** `heading-lg` with `max-md:text-heading-md` (48 → 32, as the editorial
  and illustrated columns blocks do), intro `body-1`, card heading `subtitle-1`, sentence `body-2`.
  Measured at 1440 and 390: the frame's 32px line-height on the card heading and 28px on the sentence
  are not in the scale and were not chased.

Content step that code cannot do: live `/people` pages render the Person Profile global template from
Sanity, not the code seed (`resolveElectionTemplate` goes custom → global → code default), and that
document explicitly says 1 Column, "People-First" and the earlier intro. After this code deploys, the
template's pledge block needs Column Layout set to 3 Columns and its copy brought in line with the
preset, or profiles keep the single column. Code first: production does not know the 3 Columns value
until it ships, so a draft saved earlier previews as two columns.

**Elections Position Content Block: Siderail, Badge callout, Filter by seat/district,
Candidates/Representatives rows, "Who's currently in office", Branded CTA with icon, 3-column icon
block, About [Position Name], 3-step How to run** (position pages) — one block,
`component_electionsPositionContentBlock`, rebuilt in place. Decided with Emily on 2026-09-24.

The Figma frame marketing calls the "Elections Position Content Block" is the whole page body below
the hero: a side rail and a right-hand column holding nine of the spreadsheet's rows. The audit
offered two builds. Separate blocks per row would have needed a two-column page layout that a flat
template cannot express (no block here nests other blocks), so the layout would have moved into the
route. Marketing chose one block instead, on the condition that every section inside it hides on
its own when a page has no data for it. That is how it is built. Things that came out of it:

- **The state is the hero's.** The section wrapper feeds the same race dates and winner lists to
  `resolvePositionHeroState`, so the body cannot sit in a different phase from the header. Filing
  and mid-election render the same body; decided switches the list heading to "Results", tags the
  winners, shows the winner copy in the branded CTA and the "This election is over" banner above
  the How to run steps. Frames 3 and 4 differ only in the hero; state 4 (several winners) has the
  same body as state 3.
- **Every data-fed section hides on its own.** Candidates and officeholders hide when the route
  holds no rows (`undefined`) and also when the list is empty, because a list with nothing in it
  is not a zero worth publishing; the badge callout hides with them since it explains the mark on
  those rows. The About card hides without a description or a fact, Steps 1 and 2 of How to run
  hide without eligibility or filing data, the explore card hides without a location page to link
  and the share card without a page URL. The "On this page" links name only sections that
  rendered. `src/ui/electionsPositionContentBlock.test.tsx` pins each rule.
- **Every sentence is editable in Studio and has a default in code.** The block is on the live
  Position template with none of the new fields filled, so `POSITION_CONTENT_DEFAULTS` in the
  schema file is what every page shows until an editor changes a field. The branded CTA carries
  four copy pairs, chosen by state and by whether anyone listed took the Pledge: no pledged
  candidate, a pledged candidate running, a pledged winner, and no pledged winner (copy from Emily,
  2026-09-24). The "pledged candidate running" default is new copy and needs a marketing read.
- **Plain strings and pasted links only, and this matters for the whole batch.** The shared
  `sectionsGroq` query that fetches every block on a page measured 302,483 characters with this
  block's first version, which projected three rich text fields and three button pickers. Sanity
  rejects request bodies over 300 KB, so every page prerender failed on Vercel. Without those
  projections the query is about 286 KB, which means **the sections query sits within roughly 2 KB
  of the limit before any new block is added**. A `buttonGroq` projection costs about 3.7 KB and a
  `block_summaryText` one about 1.5 KB. Until the query is restructured (a separate task), a new
  block in this batch should use plain `string`/`text` fields and a pasted path for its links, and
  should measure `sectionsGroq.length` before opening its PR. This block's links are label + path
  pairs; the "Need help?" community phrase is linked in code.
- **`[Position Name]` is now a token.** The Figma copy uses it throughout, so it resolves to the
  office name alongside `[office name]`. Location wording uses `[County or City]`, which is the
  most specific place the page represents.
- **Officeholders come from `/v1/officeholders?positionId=`**, joined to `/v1/persons` for the
  name, photo, profile link and pledge mark, the same way the profile pages build "Nearby
  Officials". `RaceDetail.positionId` is newly typed for it. The loader filters the response on
  `positionId` itself, so if election-api were to ignore the parameter the section would go empty
  rather than list every officeholder. Whether the API honours the parameter has not been
  confirmed against omni; check the query DTO before relying on it (see
  `[[election-api-source-is-in-omni]]`).
- **Waiting on data, so hidden today:** the seat/district filter (candidate rows carry no
  sub-area yet; the filter appears only when every row it would narrow has one and there is a
  choice), the judicial and retention election types (no flag in election-api; only partisan and
  run-off are asserted), and everything decided-state, for the same reason as the hero.
- **Links.** `/run` on goodparty.org returns 404 today; the run CTAs here point at
  `/run-for-office`. No pledge page exists, so the pledge phrase in the default copy is not a link.
  The "Need help?" line links "GoodParty.org Community" in code. The three voter-readiness links default to vote.gov
  and vote.org and need marketing's confirmation.
- **Share** uses the device share sheet where the browser has one and copies the link elsewhere.
  No custom modal was built.
- **Where the frames and the live scale disagreed,** the scale won as before, with one pairing: the
  32px section headings use `heading-sm` with a `max-md:text-heading-md` override (24 → 32 and 32 → 40
  are the two ramps, so this holds 32 at both ends), `body-1` for the 18px body, `text-md` and `text-sm` for the 14px and 12px
  row text, the xl container (308px rail, 44px gap, 848px column at 1440).

**Position content block, second round** (position pages) — revised in draft PR #327 after design
feedback (Emily, 2026-10-06; frames 2139-20108 / 2360-15568, and the pre-filing frames 2360-19703 /
2360-19298). Still one block; the Studio fields changed shape.

Decisions that came out of it:

- **The rail is desktop-only and has two cards.** The share card and its button component are gone,
  with their Studio fields; the "On this page" links and the "Explore more races" card remain, and the
  whole rail is hidden below the `lg` breakpoint because the phone frame carries none of it. The
  "GoodParty.org Pledge" in the explore card's body opens the pledge pop-up.
- **The branded CTA ("Tired of choosing between red and blue?") is gone**, with its nine fields and
  the four-way copy switch. No editor had filled any of them, so nothing is orphaned in Studio.
- **The pledge explainer is drawn inside each people list**, under the intro sentence, in the shape
  the featured candidates block settled on the same day (PR #371): heart in a divided 112px cell on
  desktop and stacked on the phone, "What this symbol means", the pledge's name in bold, and a
  "Read the full pledge" link that opens `PledgeModal`. One set of Studio fields serves both copies,
  with a show/hide toggle for the link. The old single callout above both lists is gone.
- **`PledgeModal` is copied in, byte for byte, from the location hero branch (#300)**, where #371
  merged it; it is not on `develop` yet. Both drafts add the identical file, which git merges without
  conflict. If the featured block changes the pop-up before either lands, resolve the merge in favour
  of that branch.
- **Each list has an intro sentence** ("Learn about candidates who have filed to run for [office]",
  "Learn about who represents you in [County or City]"), two new editable fields.
- **The seat is a chip next to the name** (Figma "Tagline": white, 6px radius, 28px tall), on
  candidates and officeholders alike, and leaves the meta line. The seat filter moved into the
  heading row of the first list that renders, full width under the intro on the phone.
- **The voter readiness card uses uploaded illustrations, not icons**, like the illustrated columns
  block: `img_image` on each item replaces `field_icon`. The default three items carry no picture
  until an editor fills the items in Studio with artwork, which is the same rule as that block. The
  phone stacks the three centred with hairlines between them (112px pictures); desktop keeps three
  divided columns (64px).
- **The three default links point at this site's voter pages**: `/check-voter-registration`,
  `/find-polling-place` and `/request-mail-in-ballot` (all live, checked 2026-10-06), replacing the
  vote.gov and vote.org links.
- **Before the filing window opens the About card and the How to run steps lead.** The block reads
  the hero's state, and `leadsWithAbout` is true only for `filing` with `filingOpen` false (the six
  months before the window). The "On this page" links follow the rendered order. Every other phase,
  including decided, leads with the people lists. `src/ui/electionsPositionContentBlock.test.tsx`
  pins both orders.

Noted and not acted on: the pre-filing desktop frame still lists the "On this page" links in the
people-first order; the block follows the sections as rendered instead. The frames prefix the
officeholder meta line with the office name ("City Council · Independent · …"); the line stays
party and term only.

## The shared election counts, as marketing defined them

Settled with Emily on 2026-09-17 while building the location hero's stat cards, and
trimmed on 2026-09-24 when the design went from four cards to three. Several other
blocks in the batch want the same counts, so treat these as the batch's definitions
rather than one block's, and state them verbatim in any request to the election data
team.

The hero now shows three: the election date ("Election day"), the race count ("Races on
the ballot") and the independent count ("Independent candidates"). Days until the next
election and the uncontested count were dropped from this block; the uncontested
definition is kept below because the position pages still want it.

- **Year scope.** Every figure follows the year the offices list opens on: the current
  year when it has elections, else the soonest year ahead
  (`resolveDefaultElectionYear` in `src/lib/electionsHelpers.ts`).
- **Geographic scope.** The ballot a voter in the location sees: the location's own
  races plus those of the places above it (a city page counts its county's and its
  state's races; a state page counts state races only). Never the places below it:
  someone on the Texas page does not vote in every municipal race in Texas. This is
  the offices list's rule (PR #304) and the hero follows it so the two agree
  (Emily, 2026-10-05). It replaces an earlier "whole location including
  sub-locations" definition that was never built.
- **Independent** means the person has taken the GoodParty.org Pledge, by the same
  rule the candidate cards and profiles use (`pledgedFromSpine`: the spine's
  `isPledged`, and no major-party evidence). It does not mean party affiliation, so
  `classifyParty` is the wrong tool for this count.
- **Uncontested** means exactly one candidate on the ballot per seat, counted for any
  race where we hold candidate data, including races whose filing window is still
  open.
- **Zero versus unknown.** Show 0 when the data genuinely says zero; hide the element
  when there is no data. These differ: `Person.isPledged` was unpopulated across
  production until mid-September 2026 (see the superseded note in
  `docs/person-spine-pledge-and-claim-linkage-handoff.md`); it is being written now, but
  re-measure coverage before publishing a pledge count, because a zero from a sparsely
  written flag is a no-data zero and must not be published as "0 independents".
- **Editor versus data.** The label is editable in Sanity, with location tokens; the
  number always comes from the data. These blocks live on global templates, so a
  number typed in Studio would otherwise freeze the same figure across thousands of
  pages.

Of these, the race count and the independent count reach a location page today: the
races off the offices list's own rows, the independents through the featured people
fetch (per-race `/v1/candidacies` calls within a budget of 48 races, so the hero hides
the figure when the budget was exceeded; see the hero entry above). `/v1/candidacies`
has no place filter, so the uncontested count needs either per-race calls or a
whole-state sweep joined on `raceId`. The right fix is one aggregate from election-api,
keyed by place and year, which the candidates rows, "who's currently in office" and
nearby offices blocks will all want too.

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
- **"Who's currently in office" reads every seat of a multi-district office.** A race carries one
  BallotReady position id, and `/v1/officeholders?positionId=` answers for that seat alone, so Los
  Angeles' city council page listed District 9 and nobody else (Emily, 2026-10-07). The loader now
  also reads the page place's officeholders (`getElectionsPagePlace` for the geo id, then
  `/v1/officeholders?geoId=`) and keeps those whose normalised position name matches the race's,
  merged and deduped with the position-id read and ordered by district when every seat is numbered.
  Only the race's `normalizedPositionName` is compared (the display name never matches the rows);
  a race without one lists the single seat its position id answers for. A failed place read keeps
  the race's own seat rather than hiding the section.
- **The `/candidates` pages are going away with the redesign** (Emily, 2026-09-24). No
  redesign block links to `/elections/.../position/<slug>/candidates`. Candidate rows live on the
  position page itself (the content block's list, anchored at `#position-candidates`), and the
  hero's ballot button points there or does not render. The old template's CTA block still
  carries a candidates page link; it is replaced with the rest of the position page set.
- **Page state comes from data, not from an editor's choice.** Where a component
  varies by where an election is in its cycle (pre-filing, mid-election,
  post-election), that is a fact derived from filing dates and certified results, not
  an editorial decision. Model it as one block that reads the state, not as separate
  blocks an editor picks between. Ten of thousands of position pages cannot be
  hand-switched as their elections progress, which is the whole point of templates.

## Open questions, to settle before building the blocks they affect

Several are marketing's own, from the spreadsheet. Do not guess at these; they change
how many blocks get built.

- ~~**Featured candidates vs Featured representatives:** one block or two?~~ Settled:
  one block with a Studio dropdown (Emily, 2026-09-29); see the audit result above.
- ~~**Candidates/Representatives rows vs "Who's currently in office":** one block or two?~~
  Settled 2026-09-24 for position pages: both are sections of the content block, each hiding on
  its own. Location pages' Featured candidates/representatives are settled separately above.
- ~~**Badge callout:** standalone block, or part of a people block?~~ Settled twice, once per
  page family: on position pages it is part of the content block, shown only next to a people
  list (2026-09-24); on location pages it is part of the featured block, with editable copy
  (Emily, 2026-09-29).
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

## Updating a block after design feedback

Once a block is built, feedback rounds change it, and a change is a different job from a
build. The **`update-component`** skill owns it. What makes it different, in short:

- **The code can be in three places at once.** On `develop`, in a draft PR waiting for its
  page batch, and in a second PR stacked on the first. The change has to land in the most
  downstream one, or two PRs fight over the same file. Several drafts are also far behind
  `develop`; bring it in with a merge before changing anything.
- **Who is affected is a query, not a memory.** Editors place blocks on templates and landing
  pages between rounds, so this doc's notes about where a block sits go stale (the Near You
  note above is one example). The skill runs the placement query against both the published
  and the drafts perspective before deciding whether the PR can merge or must park.
- **Existing pages have no value for a new field.** The component's fallback is what they
  render, and it must match today's render unless the change is meant to alter the default.
- **Tests pin earlier decisions.** A failing assertion may be guarding a rule from an earlier
  round that this feedback did not revisit. Read it before changing it.

### Placement snapshot, 2026-10-05

Where each block's code lives and what carries it in Sanity, from the placement query
(published view; the drafts view added one hit, noted). Re-run the query rather than trusting
this table; it is here to orient, and to show the shape of the answer.

| Block | Code | Placed on (published) | An update ships as |
| --- | --- | --- | --- |
| Location landing page hero | develop + draft PR #300 | all five Location globals (drafts view adds the `template-elections-subset` landing page) | into #300, stays draft |
| List of offices | develop + draft PR #304 (stacked on #300 since 2026-10-05) | all five Location globals (drafts view adds the `template-elections-subset` landing page) | into #304, stays draft |
| Location facts | develop | State / County / City / District globals | draft and batch |
| Elections index | develop | Location globals, Person Profile global | draft and batch |
| Position hero | develop + draft PR #320 | Position and Position Candidates globals | into #320, stays draft |
| Position content block | develop + draft PR #327 (stacked on #320) | Position global, plus the landing page `template-elections-position-subset` | into #327, stays draft |
| Candidates block | develop | Position Candidates global, every `/people` profile | draft and batch |
| Breadcrumb block | develop + draft PR #377 (phone collapse) | every election global, two position landing pages | into #377, stays draft |
| Profile hero | develop + draft PR #374 | Person Profile global, Candidate Profile global | into #374, stays draft |
| Profile content block | develop + draft PR #375 (stacked on #374) | Person Profile global, Candidate Profile global | into #375, stays draft |
| Profile hero | develop | Person Profile global (every `/people` profile), the retired Candidate Profile global, twelve disabled per-state scaffolds; a landing page **draft** also carries it | draft and batch with the `/people` pages (PR for the 2026-10-06 revision) |
| Elections search hero | develop + draft PR #351 | the `/elections` landing page | into #351 |
| Featured cities | develop + draft PR #307 | the `/elections` landing page | into #307 |
| Elections near you | develop | `/all` plus three landing pages (see the note above) | ready to merge, list the pages |
| Election position resources | develop | nowhere published; a **draft** of the Position Page global adds it | ready to merge, tell the editor holding that draft |
| Nearby offices | develop | nowhere | ready to merge |
| Featured candidates | develop + draft PR #300's branch (the 2026-10-06 revision is stacked on it) | nowhere | into the #300 branch, ships with the location batch |
| Illustrated columns | develop | nowhere | ready to merge |
| Testimonial block with link | develop | nowhere | ready to merge |
| Location editorial | develop | nowhere (hidden on location pages by design) | ready to merge |
| GoodParty.org Pledge | develop | Person Profile global (every `/people` page), the retired Candidate Profile global; a **draft** landing page | draft and batch, then the template content edit above |

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
| 3-column icon block | Voter Hub, position, location | content (audited — built, see above) |
| Testimonial block with link | Voter Hub, location, position | content, plus the page's state via overrides (revised 2026-10-06, see above) |
| 3-column icon block | Voter Hub, position, location | content (audited — built as the illustrated columns block, see above; on position pages the voter readiness section of the content block covers it) |
| Testimonial block with link | Voter Hub, location | content |
| Browse elections in Location Hero | location | data |
| Local election rows block | location | data |
| Find elections container | location | data |
| Featured cities carousel | location | data |
| Featured candidates/Representatives | location | data (audited — built, see above) |
| More about location container | location | data (audited — built, see above) |
| Header_Pre-Filing | position | data (audited — one state of the existing hero, see above) |
| Header_Mid-Election | position | data (audited — one state of the existing hero, see above) |
| Header_Post-Election | position | data (audited — one state of the existing hero, see above) |
| Header_Post-Election_Multiple winners | position | data (audited — one state of the existing hero, see above) |
| Siderail | position | data (audited — part of the content block, see above) |
| Badge callout | position | content (audited — part of the content block, see above) |
| Filter by seat/district | position | data, interactive (audited — part of the content block, hidden until rows carry seats) |
| Candidates/Representatives rows block | position | data (audited — part of the content block, see above) |
| Branded CTA block with icon | position | content (audited — part of the content block, see above) |
| "Who's currently in office" block | position | data (audited — part of the content block, see above) |
| About [Position Name] | position | data (audited — part of the content block, see above) |
| 3-step How to run for [Position Name] | position | content + post-election state (audited — part of the content block, see above) |
| 3-column e-book support block | position | data (audited — built, see above) |
| Nearby offices | position | data (audited — built, see above) |
| Find more elections block | position | data |
| Video hero with search | Voter Hub | content + search, video modal |
| Animated number block | Voter Hub | content |
| Animated map block | Voter Hub | data |
| Divider | Voter Hub | content |
| 3-block CTA with icon | Voter Hub | content |

## Kickoff prompt

Paste this to start a session on one of these components. For a revision to a block
that already exists, use the kickoff prompt in the `update-component` skill instead.

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
