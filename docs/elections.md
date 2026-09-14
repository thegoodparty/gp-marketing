# Elections and candidate pages

This is the hardest, most bug-prone surface in gp-marketing. Read this before
touching anything under `src/app/elections/**`, `src/app/candidate/**`, or the
`src/lib/election*` files. It marks clearly what an agent can safely change and what
must be escalated to an engineer.

If you are the human driver reading a report from the agent: the short version is
that layout, copy, wording, and formatting bugs on these pages are fixable here, but
"this candidate's profile is wrong" or "my page says I am unclaimed" is almost never
a bug in this website. That is a data problem in other systems and needs an engineer
or support, not a code change here. The agent should tell you which kind it is.

## What these pages are

These are SEO-driven programmatic pages. There is one page per state, county, city,
elected office (position), and candidate across the country, generated automatically
from data rather than hand-authored. The page content is built by taking live data
from our APIs and merging it onto a Sanity CMS template (the blocks and token-driven
copy that marketing controls). No one creates these pages one at a time. They exist
because the data and a template exist.

## Data sources and fetching

Two backends feed these pages. Both are read through `src/lib/electionsApi.ts`.

- election-api (`ELECTIONS_API_BASE_URL`, default
  `https://election-api.goodparty.org`) is the base data source: races, positions,
  places, candidacies, and districts. Endpoints used include
  `/v1/elections/races-by-year`, `/v1/districts/types`, `/v1/districts/names`,
  `/v1/positions/:id`, `/v1/races`, `/v1/candidacies`, `/v1/places`, and
  `/v1/places/most-elections`.
- gp-api (`GP_API_BASE_URL`, derived by replacing `election-api` with `gp-api` in the
  base URL) is queried at `/v1/public-campaigns` through `findCampaignByRace` to find
  a claimed campaign for a candidate.

All reads go through `fetchJson`, which retries twice with a 500ms times attempt
backoff, returns `null` on 404 or any non-500 error, and caches most responses with
`{ next: { revalidate: 3600 } }` (one hour). Pages themselves also set
`revalidate = 3600`.

## Domain vocabulary the agent needs

### MTFCC codes

MTFCC codes are US Census geographic-entity codes. election-api tags every place with
one, and the code decides how the place is treated. The constants live in
`electionsApi.ts`:

- `COUNTY_MTFCC = 'G4020'` for counties and county-equivalents (including DC).
- `CITY_MTFCC = 'G4110'` for incorporated cities.
- `TOWN_MTFCC = 'G4040'` for towns. This matters for New England and especially Maine,
  where town governance is real and towns behave like the primary local unit.
- `DISTRICT_MTFCCS = ['G5400','G5410','G5420']` for school districts (elementary,
  secondary, unified). `isDistrictMtfcc` matches any code starting with `G54`.

Helpers: `isCityOrTownMtfcc` (city or town), `isDistrictMtfcc`, and the defensive
`isStateIndexDistrictPlace`. The last one exists because some API payloads (notably
Maine) attach `G54xx` codes to municipality-like slugs, so it re-checks slug depth,
the county-equivalent tail, and district keywords before trusting the code.

### County-equivalents

Not every state calls its counties "counties". `canonicalizeCountyEquivalentName` in
`electionsHelpers.ts` normalizes these and returns `{ displayName, baseName,
suffixLabel }`. The suffix set is County, Parish, Borough, Census Area, City and
Borough, City and County, and Municipality. State rules are baked in: Alaska resolves
to Borough (but keeps City and Borough, Census Area, or Municipality when already
present), Louisiana resolves to Parish, an existing City and County is preserved, and
everything else resolves to County. This is why "Los Angeles County", "Jefferson
Parish", and "Prince of Wales-Hyder Census Area" all render consistently.
`stripCountySuffix` and `getCountySuffixLabel` are the utility companions.

### Place hierarchy and the /elections route tree

The hierarchy is state, county, city, then subplace. The route tree under
`src/app/elections/` is:

```
/elections
/elections/[state]
/elections/[state]/[county]
/elections/[state]/[county]/[city]
/elections/[state]/position/[positionSlug]                              (+ /candidates)
/elections/[state]/[county]/position/[positionSlug]                     (+ /candidates)
/elections/[state]/[county]/[city]/position/[positionSlug]              (+ /candidates)
/elections/[state]/[county]/[city]/[subplace]/position/[positionSlug]   (+ /candidates)
```

Race slugs look like `state/[county]/[city]/[subplace]/positionSlug`. City and town
races often carry 3-part slugs that must be expanded to 4-level URLs by resolving the
county (`resolveRaceElectionHrefs`, `resolveCountySlugForPlace`,
`buildElectionPositionHrefFromRaceSlug`). Joint city offices use a subplace segment
(`buildSubplaceRaceSlug`); the API omits the county segment there, so lookups retry
with and without the county. `redirectCityRaceToFourLevelUrl` and
`redirectCityPlaceToFourLevelUrl` issue `permanentRedirect`s to canonicalize URLs.
Place facts (population, density, income, and so on) come from `PlaceWithFacts`
through `placeToFactsCards`, and `hasSuspiciousFactsMatch` guards against a city
inheriting its county's statistics.

Every route above emits a **self-referencing canonical** from its `generateMetadata`
(`alternates: { canonical: toAbsoluteUrl(path) }`), built from the same lowercased path
the page body hands to `toAbsoluteUrl`. Self-referencing is correct here because the
redirects above already 301 the non-canonical variants; the canonical's remaining job is
to collapse the variants that still render 200, mainly mixed-case segments
(`/elections/CA/...`) and tracking query strings. These are the site's largest content
type, so a route that ships without one puts tens of thousands of URLs back into
"Google picks the variant", and `src/app/elections/canonicalMetadata.test.ts` fails the
build if a new election route forgets. Keep the canonical path identical to the sitemap
URL for the same page (`buildElectionPositionHrefFromRaceSlug`); a canonical that
disagrees with the sitemap sends conflicting signals.

### Joint offices eat place slots

A combined office (Indiana's Clerk/Treasurer, Montana's Clerk/Recorder/Surveyor,
California's Clerk/Recorder) is slugged upstream with a real slash per joined office:
`mt/gallatin-county/county-assessor/treasurer-joint`. Those extra segments have to go
*between* the place and `/position/`, because the position slug is a single route
segment and is fed straight back to `getRaceBySlug`. So the URL is
`/elections/mt/gallatin-county/county-assessor/position/treasurer-joint`, with the
office name sitting in the slot a city would normally occupy.

The index pages (`/elections/[state]`, `[county]`, `[county]/[city]`) build their
office links with `buildPlaceRacePositionHref(placeSegments, race.slug)`. Do not
hand-roll this: slicing the slug at a fixed depth folds the extra segments into the
position slug, and `.pop()` drops them, and both shapes 404 while looking plausible.
A September 2026 crawl found 516 such 404s, concentrated in Indiana towns and Montana
counties but present in at least 17 states.

Because the route tree stops at four place levels, an office combining four or more
roles cannot be addressed at all. `buildPlaceRacePositionHref` returns `undefined`
there and `ListOfOfficesBlock` lists the office without a link rather than linking to
a page that cannot exist. Giving those offices a real page needs a different URL
shape, which is a separate piece of work.

### Templates: global vs custom, and three-tier resolution

Editor-facing how-to (Studio steps, preview targets, clone workflow):
`docs/election-templates-manual.md`.

`ElectionTemplateType` is one of `locationState`, `locationCounty`, `locationCity`,
`locationDistrict`, `position`, `positionCandidates`, or `candidateProfile` (plus a
deprecated legacy `location`). `resolveElectionTemplate` in `electionTemplates.ts`
picks the page's blocks in three tiers, most specific first:

1. Custom. `goodpartyOrg_customTemplate` docs matched by `list_targets`
   (`field_electionTargetType` is `place`, `position`, or `candidate`, plus
   `field_electionTargetSlug`). Scored by specificity: `TARGET_TYPE_RANK` (candidate
   3, position 2, place 1) times 1000 plus slug depth times 10. Ties break on lower
   `field_priority`, then most recent `_updatedAt` (`pickBestCustomTemplate`). Place
   targets match by prefix.
2. Global. `goodpartyOrg_globalTemplate` for that type; location types fall back to
   the legacy `location` type.
3. Code default. `getCodeDefaultElectionTemplate(type)` builds from in-code seed
   sections, with `UNRESOLVABLE_SEED_BLOCK_TYPES` stripped (see the GROQ gotcha
   below). This is the last resort.

The result is `{ pageSections, source: 'custom' | 'global' | 'codeDefault', tokens }`.

### Token resolution

Templates contain bracketed placeholders like `[office name]`. `KNOWN_ELECTION_TOKENS`
in `resolveTokens.ts` is the full set: `[State] [County] [City] [District] [County or
City] [office name] [office] [location] [candidate name]`. `resolveTokens(value,
tokens)` does plain string replacement. Any known token that is not supplied for that
page is stripped to empty, so a raw `[token]` never renders (it warns outside
production). Token maps are built by the `build*Tokens` helpers in
`electionsTemplateHelpers.tsx` (for example `buildProfileTokens`,
`buildPositionTokens`, `buildCandidatesTokens`). Callers must `stegaClean` strings
before passing them in.

## The GROQ schema vs projection gotcha

This is the classic silent-failure trap, documented in `.cursor/BUGBOT.md`.

Sanity schema field names and GROQ-projected names are different. Seed data in
`electionsTemplateSeedSections.ts` uses CMS schema field names (`ctaMessaging`,
`ctaAction`, `ctaBlockDesignSettings`, `ctaAssets`, `smallCtaMessaging`). Page section
components read GROQ-projected names after fetch (`overview`, `primaryCTA`,
`designSettings`, `image`, `title`, `block_summaryText`) because `ctaBaseGroq` in
`src/sanity/groq.ts` renames them during projection. So a PageSection wrapper reads
`section.overview`, not `section.ctaMessaging`. Write it against the schema names and
it silently renders empty.

The code-default seed templates bypass GROQ entirely, so they must use the raw schema
names. Any block whose data only materializes after GROQ projection or reference
dereferencing cannot survive the code-default path, so it is listed in
`UNRESOLVABLE_SEED_BLOCK_TYPES` in `src/lib/electionTemplateDefaults.ts` (currently
`component_carouselBlock`, `component_ctaImageBlock`, `component_ctaBlock`,
`component_ctaBannerBlock`) and stripped from the last-resort fallback so it stays
content-light but never visibly broken.

## What you can change vs what to escalate

### Safe to change here (agent-doable)

These are self-contained, pure functions in this repo with `.test.ts` neighbors. They
are good agent targets: read the test, change the function, add a case, run
`bun run typecheck` and `bun test`.

- MTFCC classification (`isCityOrTownMtfcc`, `isDistrictMtfcc`,
  `isStateIndexDistrictPlace`).
- County-equivalent canonicalization (`canonicalizeCountyEquivalentName`,
  `stripCountySuffix`, `getCountySuffixLabel`).
- Slug and URL building (`buildRaceSlug`, `buildSubplaceRaceSlug`,
  `resolveElectionPositionFromRaceSlug`, `buildElectionPositionHrefFromRaceSlug`).
- Template scoring and selection (`scoreCustomTemplate`, `pickBestCustomTemplate`).
- Token maps (the `build*Tokens` helpers and `resolveTokens`).
- SEO and JSON-LD builders (`buildFAQSchema`, `buildPositionPageSchema`,
  `buildJobPostingSchema`, `buildBreadcrumbSchema`, `buildDynamicFAQItems`).
- Place-facts formatting (`placeToFactsCards`, `hasSuspiciousFactsMatch`).

### Privacy takedowns ("remove this person's page")

Support applies a takedown in the admin console, which records it in gp-api. Two
things then happen on this site, and they are separate:

1. **The person's own `/people` page.** `loadPersonProfile` reads the removal
   straight from gp-api and renders the "removal requested" states, which drop
   the photo, bio and every authored field while keeping a crawlable name.
2. **Everybody else's page.** A person's photo also travels on their candidacy
   and officeholder records, which is what the "Other Candidates" and "Nearby
   Officials" cards on *other* profiles read. Those come from election-api,
   which knows nothing about removals, so the cards are filtered here instead:
   `getRemovedPersonIds` reads gp-api's `/v1/public-person-profiles/unlisted`
   feed and `buildOtherCandidateCards` / `buildNearbyOfficialCards` drop the
   photo for anyone in it.

If that feed cannot be read, every card photo is dropped rather than risking
republishing one. A takedown propagates immediately because
`/api/revalidate-person` busts the feed's cache tag as well as the person's own.

Note this suppresses only what *we* publish. The image itself is usually hosted
by BallotReady and stays live at its own URL, so a genuine takedown request also
has to go upstream to them.

### Linking to a person: always `/people`, never `/candidate`

`/people/<base>-<id8>` is the one canonical home for a person.
`/candidate/<slug>` is a legacy path that 308s there whenever the candidacy row
carries a `personId` (see `src/app/candidate/[...slug]/page.tsx`), so linking it
buys a guaranteed redirect hop and nothing else. A full-site crawl in September
2026 found 31,211 such hops — 85% of every internal redirect on the site — all
from the candidate cards on the position pages.

So when you build a link to a person:

- **Have a `personId`?** Build `/people/${buildPersonSlug(name, personId)}`
  (`src/lib/personSlug.ts`).
- **Have the person's spine row?** Prefer `buildPersonSlugFromBase(person.slug,
  id)` — the mart's own `Person.slug` is the authoritative base.
- **Neither?** `/candidate/<slug>` is still correct. Those rows have no `/people`
  profile, so that route serves its own page instead of redirecting.

The slug rule is `<slugified name>-<first 8 hex of personId>`, and the id8 suffix
is what the resolver actually looks up. Getting the *base* wrong is not fatal but
is not free either: the resolver answers a near-miss base with a 307 to the real
URL, so a wrong base trades an avoidable 308 for an avoidable 307.

Two traps in the base, both verified against live data:

- **Apostrophes and periods are deleted, not turned into separators.** The mart
  has `robert-obrien`, not `robert-o-brien`; `tj-mcsparrin`, not `t-j-mcsparrin`.
  `slugifyName` handles this — do not hand-roll a slugifier.
- **The candidacy row's name and the person row's name genuinely disagree**
  for about 0.8% of rows: nicknames (`Eugene Bice` / `ej-bice`), middle names
  (`Richard Brooks` / `richard-louis-brooks`), and upstream typos
  (`Chris Bright` / `chirs-bright`). Nothing in this repo can reconcile those, and
  they are not worth chasing — they land on a single 307. This is the reason to
  prefer the spine row's slug whenever you have it.

### Linking to a race or a place: the county segment is not optional

A city or town race slug usually omits its county (`nc/greensboro/mayor`). Handed
to `buildElectionPositionHrefFromRaceSlug` with no county lookup it falls through
to the generic segment-count branch and yields
`/elections/nc/greensboro/position/mayor`, which is a *working* URL — it 308s to
`/elections/nc/guilford-county/greensboro/position/mayor` — and therefore a silent
one. The same September 2026 crawl that found the `/candidate/` hops above found
4,797 of these, every one of them from the `/people` profile template: ~36,900
internal link instances pointing at ~4,800 redirects.

So resolve the county before you build the link. There are two ways, and which one
fits depends on what you are holding:

- **One race, and you can afford a fetch:** `resolveRaceElectionHrefs`
  (`electionsApi.ts`) takes a slug, fetches the race for its place, and returns
  both the position and candidates hrefs. `/candidate` uses this.
- **Several slugs at once:** `getCitySlugToCountySlugMap(state)` builds the whole
  state's city → county lookup off the cached `/v1/places` responses, and you pass
  it as `citySlugToCountySlug` to `buildElectionPositionHrefFromRaceSlug`. `/people`
  uses this — `loadCityCountyLookup` in `peopleProfile.ts` builds it once per
  profile and every `/elections` link on the page (position href, each breadcrumb
  crumb, each "Recent Experience" row, and the "Explore Elections" tier, which is
  read back off the position href) is built through it.

Both degrade to the county-less URL rather than to no link at all when the county
cannot be resolved: a redirect beats an unlinked row. The sitemap is the one
deliberate exception — it passes `skipUnmappedCity` and emits nothing, because a
sitemap should advertise canonical URLs only.

### Not fixable here, escalate

Candidate claimed-vs-unclaimed state and any "my profile is wrong" bug is a data
lineage problem, not a marketing-site code bug. `src/app/candidate/[...slug]/page.tsx`
calls `buildSectionOverrides`, which stitches together the election-api candidacy
record, the claimed campaign from gp-api (`findCampaignByRace` ->
`/v1/public-campaigns`), claimed website content
(`claimed.website.content.about.bio` and `.issues`), stances, and custom issues. The
`isClaimed` flag and most of the fallbacks flip based on whether that gp-api lookup
succeeds. When a candidate page shows the wrong claim state, wrong bio, wrong issues,
or missing photo, the cause is almost always upstream: the product account, the
HubSpot company record, or the Candidacy record across gp-api, election-api, and
HubSpot are not linked or not in sync. Nothing in this repo can correct that.

If the agent concludes a bug is in this category, it should not attempt a code fix. It
should explain in plain language what is happening (for example, "the candidate has
not been matched to a claimed campaign in our backend, so the page falls back to the
public record") and route the user to an engineer or support to fix the underlying
data.
