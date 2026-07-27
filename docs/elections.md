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
