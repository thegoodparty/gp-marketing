# Handoff: `Person.state` is not always a state code

**Ask:** normalize `state` to the two-letter USPS code in the Person mart
(`m_election_api__person.sql`), so every row spells it the way BallotReady-sourced
rows already do.

**Status:** the marketing site has shipped defensive workarounds for both known
symptoms ([gp-marketing#256](https://github.com/thegoodparty/gp-marketing/pull/256),
[#257](https://github.com/thegoodparty/gp-marketing/pull/257)). Nothing is on fire.
This is the root-cause fix that makes those a no-op safety net and stops the next
consumer from hitting it.

## What we found

`election-api.Person.state` holds two different formats:

| shape | rows |
| --- | --- |
| two-letter code (`MN`) | 551,372 |
| spelled out (`Minnesota`) | **24,619** |
| null | 20,636 |

The spelled-out rows are not random. They are almost exactly the cohort the ETL
creates from a gp-api account rather than from BallotReady:

| of the 24,619 spelled-out rows | count |
| --- | --- |
| linked to a gp-api user (`gp_api_user_id` set) | 24,385 (99%) |
| `is_pledged` | 18,893 |
| with any `Candidacy` or `OfficeHolder` row | **0** |

The working theory is that this path passes gp-api's own state format straight
through, while the BallotReady path carries codes. Worth confirming on your side —
if that is right, the fix is one normalization at the point those rows are built.

## Why it matters

Every consumer treats this column as a code. In gp-marketing the variable is
literally named `stateCode`.

**1. A 404 breadcrumb on all 24,619 pages.** The profile breadcrumb builds
`/elections/${state.toLowerCase()}`:

| URL | status |
| --- | --- |
| `/elections/mn`, `/elections/ok` | 200 |
| `/elections/minnesota`, `/elections/california`, `/elections/texas` | **404** |

This was invisible for a while because the label helper falls back to echoing its
input, so the crumb *reads* "California" and simply goes nowhere. It affects the
published, indexable profiles too — the crumbs a crawler actually follows.

**2. These people can never enter the sitemap.** The sitemap enumerates by
sweeping `v1/persons?state=<code>` across the 51 codes, and election-api filters
with exact equality (`...(state && { state })`). A `Minnesota` row is returned by
no sweep. Normally the candidacy/officeholder feeds recover such rows, but this
cohort has zero civics rows, so there is nothing to recover them with.

While they are unpublished this is harmless — they are thin and correctly
excluded. But four of them have already published, which makes their pages
indexable, and all four were missing from the production sitemap:

| published profile | state | in sitemap |
| --- | --- | --- |
| `sean-matteson-d1d88988` | `NC` | yes |
| `matthew-janson-e2f25d7b` | `MT` | yes |
| `david-patterson-65b96bee` | `California` | **no** |
| `valentin-pena-1b1555a1` | `Oklahoma` | **no** |
| `james-macon-03ba19fc` | `Tennessee` | **no** |
| `kasen-hampton-623ac0fe` | `Florida` | **no** |

## Queries to reproduce

Run against the election-api database.

```sql
-- 1. How is state spelled?
select case
         when state is null then '(null)'
         when length(btrim(state)) = 2 then 'two-letter code'
         else 'spelled out'
       end as shape,
       count(*)::int as persons
  from "Person"
 group by 1
 order by 2 desc;

-- 2. Who are the spelled-out rows?
select count(*)::int                                              as spelled_out,
       count(*) filter (where gp_api_user_id is not null)::int    as gp_api_users,
       count(*) filter (where is_pledged)::int                    as pledged,
       count(*) filter (
         where exists (select 1 from "Candidacy"    c where c.person_id = p.id)
            or exists (select 1 from "OfficeHolder" o where o.person_id = p.id)
       )::int                                                     as with_civics
  from "Person" p
 where state is not null and length(btrim(state)) <> 2;

-- 3. Most common spellings.
select state, count(*)::int as persons
  from "Person"
 where state is not null and length(btrim(state)) <> 2
 group by state
 order by 2 desc
 limit 12;
```

Figures above were measured 2026-08-25.

## Suggested fix

Map the full name to the USPS code wherever these rows are built, so `state` is a
code for every row regardless of source. Two things to decide:

- **Values that are neither.** `Puerto Rico` and similar appear upstream and have
  no `/elections` page. gp-marketing now resolves those to `null` rather than
  passing them through. A null is easy to handle; a value that only *looks* like a
  code is what caused this.
- **Null states.** 20,636 rows have no state at all. Out of scope here, but they
  are unreachable by the same sweep, so worth knowing whether that is expected.

## Separately, and probably more important

While investigating we found two things that are not about state at all, and are
worth their own conversation:

1. **Duplicate Person rows.** 1,775 name pairs where one row is a real product
   user and its twin is a completely empty shell; 1,419 of those have the pledge
   on the row nobody is looking at. This produces public pages that tell visitors
   someone has *not* taken a pledge they did take.
2. **Product data never reaches the public profile.** `PersonProfile` in gp-api is
   populated only by the profile editor — there is no sync from `Campaign` in
   either direction. A candidate who completed Win onboarding has to retype all of
   it to get anything on their public page.
