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
  covered by the `update-component` skill rather than the `new-component` skill.
- **New block.** Nothing covers it. Say which of the two kinds it is (see below).

Unverified starting hypotheses, for the audit to confirm or reject rather than
trust:

| Requested | Existing block worth checking first |
| --- | --- |
| Featured cities carousel | `component_featuredCitiesBlock` |
| Animated map block | `component_voterDensityBlock` (the map itself is built) |
| Animated number block | `component_statsBlock`, plus the animation |
| 3-step How to run for [Position Name] | `component_stepperBlock` |
| Nearby offices | ~~`component_listOfOfficesBlock`~~ — audited, rejected. Built as `component_nearbyOffices`; see below |
| "Who's currently in office" | `component_listOfOfficesBlock` |
| Candidates/Representatives rows | `component_candidatesBlock` |
| Featured candidates/Representatives | ~~`component_candidatesBlock`~~ — audited, rejected. Built as `component_featuredCandidatesBlock`; see below |
| Header_* (all four position headers) | `component_electionsPositionHero` |
| Siderail | the sidebar inside `component_electionsPositionContentBlock` |
| About [Position Name] | `component_electionsPositionContentBlock` |
| 3-column icon block | ~~`component_iconContentBlock`~~ — audited, rejected. Built as `component_illustratedColumnsBlock`; see below |
| Testimonial block with link | ~~`component_testimonialBlock`, plus a link field~~ — audited, rejected. Built as `component_testimonialBlockWithLink`; see below |
| More about location container | ~~`component_locationFactsBlock`~~ — audited, rejected. Built as `component_locationEditorialBlock`; see below |
| Branded CTA with icon | `component_ctaBlock`, `component_ctaBannerBlock` |
| 3-block CTA with icon | `component_ctaCardsBlock` |
| 3-column e-book support block | ~~`component_ctaCardsBlock`, `component_twoUpCardBlock`~~ — audited, rejected. Built as `component_electionPositionResourcesBlock`; see below |
| Find elections container | `component_electionsSearchHero`, `component_electionsIndexBlock` |
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
  level-up rule. Stale primary dates are re-resolved the same way the location pages do it.
- **The level tag is per row, from the race's own `positionLevel`** (Federal / State / County /
  Local), matching the mixed list in the Figma frame rather than the one-label-per-page tag the
  location list uses. The Figma tag colour is `blue/900`, which had no token; it is now
  `--blue-900` in `colors.css`.
- **The seam is `nearbyOffices` on `PositionPageContext`.** `renderElectionsPositionPage` fetches
  it, so all three position routes get it without touching their `page.tsx`. The candidates
  template does not populate it, and the block hides itself wherever the override is empty.
- **The empty state is "render nothing"**, pinned by `src/ui/nearbyOffices.test.tsx`.

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
- **Pictures, not icons.** Each column has an image field. The Figma illustrations are placeholder renders
  and are not baked into code; marketing uploads the final artwork in Studio.
- **The link reuses the `button` object** (same as the resources block and the quote's story link) and is
  always drawn as the blue text link from the frame, whatever hierarchy the editor picks. The colour is
  `info-500`, which is the frame's `theme/info` exactly.
- **Sizes follow the live scale.** The heading pairs `heading-lg` with `max-md:text-heading-md` (48 → 32,
  as the editorial block does); the column heading is `subtitle-1` (24 → 20, matching both frames) and the
  sentence is `body-2`. Measured at 1440 and 390 before the PR.
- **The empty state is "render nothing"**, pinned by `src/PageSections/illustratedColumnsBlockSection.test.tsx`.

The block reads `tokens` like the other content blocks, so the location templates fill `[Location]` in the
heading, intro, column text and link labels.

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
  show/hide toggle. There is no `/pledge` page on the live site today, so the default copy carries no
  link; the field description says to add one when the page exists.
- **Order: pledged first, then unpledged people with no major party, then everyone else.** Inside a
  group, candidates by soonest election, then representatives by name. `rankFeaturedPeople` in
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

Waiting on data: the race budget means a state page whose legislature has more seats than sixteen on
one ballot only features candidates from the first sixteen, and the "pledged first" rule cannot see
the rest. The place-and-year aggregate the counts section asks for would remove the budget.

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
- **Candidates/Representatives rows vs "Who's currently in office":** leaning
  separate blocks because the data differs (Emily).
- ~~**Badge callout:** standalone block, or part of the Featured
  candidates/representatives block?~~ Settled: part of the featured block, with
  editable copy (Emily, 2026-09-29). The position pages' badge callout, if it is still
  wanted there, is a separate question.
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
| List of offices | develop + draft PR #304 (base still points at merged #303) | all five Location globals | into #304, stays draft |
| Location facts | develop | State / County / City / District globals | draft and batch |
| Elections index | develop | Location globals, Person Profile global | draft and batch |
| Position hero | develop + draft PR #320 | Position and Position Candidates globals | into #320, stays draft |
| Position content block | develop + draft PR #327 (stacked on #320) | Position global | into #327, stays draft |
| Candidates block | develop | Position Candidates global, every `/people` profile | draft and batch |
| Elections search hero | develop + draft PR #351 | the `/elections` landing page | into #351 |
| Featured cities | develop + draft PR #307 | the `/elections` landing page | into #307 |
| Elections near you | develop | `/all` plus three landing pages (see the note above) | ready to merge, list the pages |
| Election position resources | develop | nowhere published; a **draft** of the Position Page global adds it | ready to merge, tell the editor holding that draft |
| Nearby offices | develop | nowhere | ready to merge |
| Featured candidates | develop | nowhere | ready to merge |
| Illustrated columns | develop | nowhere | ready to merge |
| Testimonial block with link | develop | nowhere | ready to merge |
| Location editorial | develop | nowhere (hidden on location pages by design) | ready to merge |

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
| Testimonial block with link | Voter Hub, location | content |
| Browse elections in Location Hero | location | data |
| Local election rows block | location | data |
| Find elections container | location | data |
| Featured cities carousel | location | data |
| Featured candidates/Representatives | location | data (audited — built, see above) |
| More about location container | location | data (audited — built, see above) |
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
