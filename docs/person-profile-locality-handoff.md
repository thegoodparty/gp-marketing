# Handoff: authoritative locality on the person spine (Option A)

**Audience:** election-api / data platform team
**Consumer:** `gp-marketing` public `/people/*` profiles (see `src/lib/peopleProfile.ts`)
**Type of change:** purely **additive** — new nullable field on two existing feeds. No
existing field changes shape, so current consumers keep working untouched.

## Why

The Figma person-profile frames render section headings and the hero subheading as
**"[Position] in [Location]"** — e.g. _"Other Candidates for City Council Member in
Chicago, IL"_ and the hero line _"Mayor · Springfield, IL"_. Today the app can only
render the **position** half. There is no field on the person spine that gives a clean,
consistently-formatted **locality** that is:

1. present for **every** persona (candidate, officeholder, both, past), and
2. distinct from `positionName` (so we don't duplicate when the name already embeds a place).

What we have now and why it's insufficient:

| Field (current) | Problem for locality |
| --- | --- |
| `positionName` | Sometimes embeds locality ("Mayor of Springfield"), sometimes bare ("City Council Member"). Inconsistent, so we can't reliably split "position" vs "location". |
| `normalizedPositionName` | Deliberately **generic** ("City Council") — locality intentionally stripped. Great for the title half, useless for the location half. |
| `subAreaName` / `subAreaValue` | The district **within** the office ("Ward" / "3"), not a city/county. |
| `state` | State only — no city/county. |
| breadcrumb path segments | Clean city/county/state, but **only resolvable for candidate/"both"** (needs a Race slug). Pure officeholders get nothing. |

So the app currently omits the "in [Location]" clause rather than inventing a wrong or
duplicated one.

## What we need

A resolved **`place`** object on the two feeds the profile already reads, derived from the
position's geography (the same Census/BallotReady geo you already expose via the places
endpoints — `GET /v1/places?...`, `mtfcc` = `G4020` county / `G4110` place).

Add `place` to:

1. **`GET /v1/officeholders?personId=…&includePosition=true`** — each `OfficeHolder` (powers officeholder / both / past personas).
2. **`GET /v1/officeholders?geoId=…`** — same object (powers the "Nearby Officials" list).
3. The **candidacy → Race** payload returned for a person (powers candidate / both personas), i.e. alongside `Race.positionId` / `Race.slug`.

### Contract

```jsonc
// Nullable object. null ONLY when the position's geo can't be resolved to a place.
"place": {
  "stateCode": "IL",            // 2-letter, always present when place is non-null
  "stateName": "Illinois",      // full state name
  "countyName": "Cook County",  // nullable (null for state-level offices)
  "cityName": "Chicago",        // nullable (null for state/county-level offices)
  "level": "city",              // "state" | "county" | "city" — the office's geo granularity
  "displayName": "Chicago, IL"  // PRE-FORMATTED, nearest-granularity, ready to render as-is
}
```

Requirements:

- **Present for all personas.** The single hard requirement — resolve from the office's
  geo, not from a Race slug, so officeholders and past officials get it too.
- **`displayName` is authoritative and render-ready.** We render it verbatim. Format it as
  the nearest meaningful granularity: city → `"{cityName}, {stateCode}"`, county →
  `"{countyName}, {stateCode}"`, state → `"{stateName}"`. This matches the existing
  `/elections` location pages (`src/ui/LocationLandingPageHero.tsx`).
- **Additive & backward-compatible.** Do not rename or change the type of `positionName`,
  `normalizedPositionName`, `subAreaName`, `subAreaValue`, or `state`. `place` is new and
  nullable; omitting it (or sending `null`) leaves the app on today's behavior.

## How the app will consume it (no action needed from you)

Once `place` lands, the front-end change is a few lines in `src/lib/peopleProfile.ts` /
`src/components/people/personSectionOverrides.tsx`:

- **Section heading:** `Other Candidates for {normalizedPositionName} in {place.displayName}`
  — using `normalizedPositionName` (title only) + `place.displayName` (location only) gives
  the exact Figma split with **zero duplication risk**.
- **Hero subheading:** append `place.displayName` so officeholder/past personas finally show
  locality (candidates already do, via the location embedded in `positionName`).

Until then the app safely falls back to the current `positionName`-only rendering.

## Acceptance

For a spread of offices across levels, `place.displayName` is non-null and correctly
formatted:

| Office level | Example office | Expected `place.displayName` |
| --- | --- | --- |
| City | Chicago City Council, Ward 3 | `Chicago, IL` |
| County | Cook County Board | `Cook County, IL` |
| State | State Senate District 5 | `Illinois` |

And it resolves for an **officeholder fetched with no candidacy** (the case the app can't
resolve today).
