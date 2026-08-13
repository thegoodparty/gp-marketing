# Handoff: `Person.is_pledged` and `Person.gp_api_user_id` are never written by the ETL

**Audience:** data platform / civics team (`gp-data-platform` — `mart_civics`, the election-api serving writer)
**Consumer:** the public `/people/*` profiles on `gp-marketing`, and the in-product **Public Profile editor** in `gp-webapp` (`app/dashboard/public-profile`), backed by gp-api's `person_profiles` overlay.
**Type of change:** **fix an existing pipeline gap.** Two columns that already exist on the election-api `Person` table, and that both apps already read, are never populated. No schema change is needed on either side — only the mart and the writer.

## TL;DR

`Person.is_pledged` and `Person.gp_api_user_id` were added to the election-api Postgres schema and wired up in the apps, but **the ETL that populates `Person` never selects or writes either column**. Both therefore sit at their defaults in production forever — `is_pledged = false` for every person, `gp_api_user_id = NULL` for every person.

Two user-visible consequences:

1. **No pledge badge can ever render** on a `/people/*` profile, because the flag the page reads is always `false`.
2. **Nobody can claim a profile at all.** `gp_api_user_id` is the only channel by which gp-api learns which of its users maps to which canonical person. With it null, gp-api never sets `User.person_id`, so the editor stays locked and `POST /v1/person-profiles` returns 409 for every real user. Production currently has **zero** published person profiles.

This is the reason the marketing team sees people they know to be pledged rendering as unclaimed, non-pledged profiles. Both halves of that complaint trace to these two unwritten columns.

## Where the gap is, exactly

The columns exist in Postgres — the Prisma migrations were applied:

| Column | Migration | App usage |
| --- | --- | --- |
| `Person.is_pledged` | `20260721173000_add_person_is_pledged` | Read by election-api and returned in the default person response; drives the pledge badge in `gp-marketing/src/lib/peopleProfile.ts` (`pledged: !removed && (person?.isPledged ?? false)`). |
| `Person.gp_api_user_id` | `20260805000000_add_person_gp_api_user_id` | Filter-only in election-api (`GET /v1/persons?gpApiUserId=<numeric user id>`, M2M-gated). Consumed by gp-api's `PersonIdBackfillService` to set its own `User.person_id`. |

Neither is produced or written:

1. **Mart — `dbt/project/models/marts/election_api/m_election_api__person.sql`.** The final `select` ends at `people.state`. There is no `is_pledged` and no `gp_api_user_id` column in the model's output at all.
2. **Writer — `dbt/project/models/write/write__election_api_db.py`, `PERSON_UPSERT_QUERY`.** Both the `INSERT INTO ... "Person" (...)` column list and the `ON CONFLICT (id) DO UPDATE SET` clause omit both columns. So even if the mart grew them tomorrow, the writer would silently drop them.

Note that `people.gp_api_user_id` **already exists** in `dbt/project/models/marts/civics/people.sql` — it is computed and then simply not carried through to the serving mart. That makes fix (2) below mostly a plumbing change rather than new modelling.

## Evidence (production, 2026-08-12)

- **`is_pledged` is universally false.** Sampled `GET /v1/persons?state=<st>&columns=id,isPledged` across 15 states — MI, FL, CA, NH, TX, NY, PA, OH, GA, AZ, NC, VA, WA, CO, MA — for **69,385 person rows**. Count with `isPledged = true`: **0**.
- **No profile has ever been published.** `GET https://gp-api.goodparty.org/v1/public-person-profiles/published` returns `[]`, and `.../unlisted` returns `[]`. Zero published profiles and zero removals across all of production.
- **The five people reported by marketing** all return `isPledged: false` from election-api and 404 from the gp-api overlay endpoint (`/v1/public-person-profiles?personId=…`), i.e. no overlay exists:

  | Person | personId (8-hex) | `isPledged` | Overlay | Rendered framing |
  | --- | --- | --- | --- | --- |
  | Monique Bryant | `2c70fe12` | false | 404 (none) | unclaimed + claim CTA |
  | Matthew Crowley | `bbaf8bbf` | false | 404 (none) | unclaimed + claim CTA |
  | Monica Radyko | `ca6790fb` | false | 404 (none) | unclaimed + claim CTA |
  | Santosh Salvi | `cd795f33` | false | 404 (none) | major-party (no CTA) |
  | Omari Ferguson | `4b428be5` | false | 404 (none) | unclaimed + claim CTA |

- gp-api's own code already anticipates the empty column — `person-profiles.controller.ts` `GET mine` comments that the backfill "is a graceful no-op (returns null) until the data platform populates the linkage — so `canCreate` is identical to today when the election-api column is empty." That is the state production is in.

The apps are behaving exactly as designed given the data they are served. Nothing needs to change in `gp-marketing` or `gp-api` for either symptom.

## What we need

### 1. `is_pledged` — roll the candidacy flag up to person grain

The contract in the election-api schema is "a person is pledged if pledged on any candidacy". The source column already exists: `candidacy.is_pledged` in `mart_civics` (gp_api-native, `gp_api` is the only source per `m_civics.yaml`), and `candidacy` carries `gp_candidate_id`, which is the person grain (`= gp_person_id`).

- Add to `m_election_api__person.sql`:
  ```sql
  pledged as (
      select gp_candidate_id, bool_or(coalesce(is_pledged, false)) as is_pledged
      from {{ ref("candidacy") }}
      where gp_candidate_id is not null
      group by gp_candidate_id
  )
  ```
  left-joined on `people.gp_person_id = pledged.gp_candidate_id`, selected as
  `coalesce(pledged.is_pledged, false) as is_pledged`.
- **Not nullable.** The Postgres column is `NOT NULL DEFAULT false`; send `false`, not null, for people with no pledged candidacy.

### 2. `gp_api_user_id` — carry the value the person mart already computes

- Add `people.gp_api_user_id` to the `select` in `m_election_api__person.sql`. It is already produced by `people.sql`; nothing new to derive.
- **Type:** text, not UUID. The gp-api `User.id` is a numeric autoincrement stored as a string (election-api validates it against `/^\d+$/`). Keep it as the digit string.
- **Known partial coverage, please measure rather than assume.** `people.sql` makes the identifier scalar only when the cluster is unambiguous:
  ```sql
  case when count(distinct gp_api_id_val) = 1 then max(gp_api_id_val) end as gp_api_user_id
  ```
  A person cluster that maps to two or more gp-api users yields **null**, silently. Those users will still be unable to claim after this fix. Please report how many `people` rows have `is_candidate or is_elected_official` true, a gp_api member record, and a null `gp_api_user_id` — that is the residual population, and if it is large it needs its own resolution (probably de-duplication upstream, not a change here).

### 3. Writer — add both columns to `PERSON_UPSERT_QUERY`

Add `is_pledged` and `gp_api_user_id` to the `INSERT` column list, the `SELECT`, and the `ON CONFLICT (id) DO UPDATE SET` clause in `write__election_api_db.py`. Without the `DO UPDATE SET` entries, existing rows never pick up the values — only newly inserted ones would, which would look like a partial fix and be worse to debug than the current clean failure.

## Acceptance / how to verify

Run in order; each step is independently checkable.

1. **Pledge flag reaches the API.** `GET /v1/persons?state=MI&columns=id,isPledged` returns a non-zero count of `isPledged: true`. Cross-check the total against `select count(distinct gp_candidate_id) from candidacy where is_pledged` for that state — they should agree within the mart's own person-scoping (`is_candidate or is_elected_official` and a non-null name part).
2. **Linkage reaches the API.** For a known gp-api user id that owns a Win campaign or a Serve elected-office record, `GET /v1/persons?gpApiUserId=<id>&columns=id` (M2M token required) returns exactly one person, and that person's id equals the `gp_person_id` the mart holds for them.
3. **The editor unlocks.** That user's `GET /v1/person-profiles/mine` returns `canCreate: true` — either immediately via the lazy backfill on that call, or after the 4am reconcile cron. Their gp-api `User.person_id` is now set.
4. **Claiming works end to end.** That user can `POST /v1/person-profiles` (201, no longer 409), publish, and `https://goodparty.org/people/<first-last>-<id8>` renders the claimed template. `GET /v1/public-person-profiles/published` is no longer empty.
5. **Idempotent.** A second ETL run does not flip `is_pledged` back to false or null out `gp_api_user_id` on existing rows (this is what the `DO UPDATE SET` additions in step 3 above guarantee).

## Notes / non-goals

- **No app-side change is required or wanted.** `gp-marketing` reads `person.isPledged` and gp-api reads the `gpApiUserId` filter already. Patching the frontend to infer "pledged" or "claimed" from some other signal would hide the pipeline gap behind a heuristic, so we are deliberately not doing it.
- **Separate from the origination gap.** `PERSON_ID_ORIGINATION_HANDOFF.md` in this repo's sibling data repo covers users who have **no** canonical person at all (self-registered, absent from BallotReady/L2/HubSpot). This handoff is the complementary case: people who **do** have a canonical person row, where the row simply is not carrying the pledge flag or the user linkage. That doc's §2 assumed `gp_api_user_id` would "ride the person feed you already populate, exactly like `is_pledged`" — the finding here is that `is_pledged` is not populated either, so there is no working precedent to ride.
- **One product question remains after the data fix,** and it is the marketing team's call, not a bug: once `is_pledged` is true, a pledged person who has never authored a profile will render the pledge badge *and* the unclaimed framing with the claim CTA. That combination is correct per the current Figma states (claimed-ness is overlay presence; pledging is a separate factual flag), but if it reads wrong, changing it is a design decision on the D–F/H frames rather than a code defect.
