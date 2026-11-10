# How cached pages learn about changes

Every `/people/<slug>` page and every `/elections` location and position page
is ISR: rendered once, then served from Vercel's cache until something tells it
to re-render. This doc lists, for each of those pages, every source it reads,
everything that changes that source, and how the page finds out. **Before
raising any page's refresh window, every row for that page must have an
on-demand path.** A row without one is only as fresh as the window.

Update this doc in the same PR when you add a read to one of these pages, a tag,
or (in omni) a gp-api write that changes what one of them shows.

## How a page's window is set

- **The shortest cached read wins.** In Next 15 a page re-renders after the
  shortest `revalidate` among its own segment export and every `unstable_cache`
  read made while rendering it. Every profile, location and position page reads
  the removals list (`getRemovedPersonIds`, 300 s), so all of them refresh every
  5 minutes, whatever their `revalidate = 3600` says.
- **A page carries the tags of every cached read it made.** `revalidateTag(t)`
  marks every page that read anything tagged `t`, and each re-renders on its
  next request (Vercel reports it as `REVALIDATED`).
- **Every production deploy starts an empty page cache.**

## Tags and who clears them

| Tag | On which reads | Cleared by | When |
| --- | --- | --- | --- |
| `person:<id>` | that person's profile overlay, `/persons/:id`, office terms, merge lookup, voter density | gp-api, `POST /api/revalidate-person { personId, listings }` | every gp-api write that changes what their page shows (tables below) |
| `people-removals` | the `/unlisted` list | same call, when `listings` has `"unlisted"` | takedown set or cleared, profile deleted, account deleted, person id repointed |
| `people-published` | the `/published` list | same call, when `listings` has `"published"` | publish, unpublish, profile deleted, account deleted, person id repointed |
| `election-data` | every `/v1/elections` read, voter density | `POST /api/revalidate-person { scope: "election-data" }` | **nobody calls it yet**; see [Nightly load](#nightly-load) |
| Sanity `_type` tags | every `sanityFetch` | Sanity webhook, `POST /api/revalidate` | a publish of that document type |

A caller that sends no `listings` (gp-api from before the field existed) clears
both lists, as every call did before. An edit clears neither: other pages show a
person's own photo only after reading their overlay, so they carry the
`person:<id>` tag and the edit reaches them through it.

## `/people/[slug]`

| Source | What changes it | How the page learns |
| --- | --- | --- |
| Own profile overlay, `/v1/public-person-profiles?personId=` (`person:<id>`, 3600 s) | Create (`POST /v1/person-profiles`) | `person:<id>` |
| | Edit, issues, photo upload (`PUT mine`, `PUT mine/issues`, `POST mine/upload-image`), only while live | `person:<id>` |
| | Publish, unpublish (`POST mine/publish`, `mine/unpublish`) | `person:<id>` + `people-published` |
| | Owner delete (`DELETE mine`), account delete (`UsersService.deleteUser`) | `person:<id>` + both lists |
| | Takedown set or cleared (`POST` / `DELETE /v1/person-profiles/removals`, gp-admin) | `person:<id>` + `people-removals` |
| | Person id repointed after a data-team merge (04:00 UTC drift sweep, or on takedown clear) | `person:<id>` for both ids + both lists |
| | Priority title or description edited (`PUT /v1/priorities/:id`, Chief of Staff tool) | `person:<id>` of each live profile publishing it |
| | Priority archived (`DELETE /v1/priorities/:id`, Chief of Staff tool) | same. No visible change today: the public read does not drop archived priorities |
| | Priority archived or restored in Serve onboarding (`PriorityOnboardingService`) | none needed today, for the same reason. Needs one if the public read starts hiding archived priorities |
| | Office deleted with its priorities: a withdrawn win's dormant office (`WinOfficeService`), a test-mode org (`TestModeService`) | `person:<id>` of each live profile that published one |
| | User linked to a person (`POST /links`, null-id sweep, lazy link on `GET mine`, non-prod `test-set-person-id`) | none needed: no profile exists yet, and the create that follows clears the tag |
| Other people's overlays, read for card photos (`person:<other id>`) | that person's writes, above | their `person:<id>` |
| Removals list, `/unlisted` (`people-removals`, 300 s) | rows above that name it | `people-removals` |
| Published list, `/published` (`people-published`, 300 s) | rows above that name it | `people-published` |
| Election data: `/persons/:id`, `/persons/by-slug/:slug`, `/person-merges/:id`, `/officeholders`, `/candidacies`, `/persons?ids=`, `/places` (`election-data`, 3600 s) | The nightly load: offices, candidacies, races, positions, party, the pledge flag, names and slugs, and the data team's person merges and purges (written in the same run) | `election-data`, **no caller yet** |
| Voter density, `/v1/public-person-profiles/voter-density` (`person:<id>` + `election-data`, 3600 s; gp-api holds it 60 s in memory) | The nightly load (rebuilt monthly, copied nightly) | `election-data`, **no caller yet** |
| Sanity `personProfile` template, navigation, footer, social channels | Publish in Studio | Sanity webhook clears the type's tag |
| Sanity documents a template pulls in by reference (shared CTAs, promotions, quotes, forms) | Publish in Studio | **none**: these reads carry no tag on this page |
| Time | "Running" becomes past at midnight Pacific after election day (`startOfElectionDay`, `isRunningNow`, `resolvePersona`); which candidacy leads and which rivals show (`selectPrimaryCandidacy`, `currentCycleCandidacies`) | **none**: decided at render |

## Location pages: `/elections/[state]`, `/[county]`, `/[city]`

| Source | What changes it | How the page learns |
| --- | --- | --- |
| Election data: places, races, candidacies, office terms, persons (`election-data`) | The nightly load | `election-data`, **no caller yet** |
| Featured people: removals list, published list, overlays of published people | gp-api writes in the `/people` table | `people-removals`, `people-published`, `person:<id>` |
| Sanity location template (`locationState`, `locationCounty`, `locationDistrict`, ...), layout documents | Publish in Studio | Sanity webhook |
| Sanity documents referenced by a template | Publish in Studio | **none** |
| Time | Default election year (`new Date().getFullYear()`); races re-dated once their date has passed on the Pacific calendar (`resolvePlaceRaceElectionDates`); upcoming vs past featured people | **none** |

The 51 state pages are prebuilt at build time; the rest render on first request.

## Position pages: the four `.../position/[positionSlug]` routes

| Source | What changes it | How the page learns |
| --- | --- | --- |
| Election data: race by slug (its key carries yesterday's UTC date, so it changes daily), places, candidacies, office terms, persons, nearby offices (`election-data`) | The nightly load | `election-data`, **no caller yet** |
| Hero candidates and officeholders: removals list, published list, overlays | gp-api writes in the `/people` table | `people-removals`, `people-published`, `person:<id>` |
| Sanity `position` template, the `article` guide card, layout documents | Publish in Studio | Sanity webhook |
| Sanity documents referenced by a template | Publish in Studio | **none** |
| Time | Position phase (`resolvePositionHeroState`, also in the `<title>`); "Days until election" and "Days to file" countdowns rendered on the server; `currentCycleCandidacies`; the nearby-offices filter | **none** |

`/candidate/[...slug]` and the sitemap also read election data, so the
`election-data` tag reaches them too. `/candidate` reads the two lists only when
`ENABLE_CANDIDATE_PEOPLE_REDIRECT=true`.

## What has no on-demand path

These keep every page above at its current 5-minute window. Each needs a
trigger before that page's window can go up:

1. **The nightly election load.** See below.
2. **Time.** The day after an election, countdowns, the default year. Needs a
   refresh just after midnight Pacific every day, for example a Vercel cron
   that clears `election-data`.
3. **Sanity documents a template references.** The webhook clears only the
   published document's own type. Needs the webhook to also clear the template
   tags (or a shared tag on every `sanityFetch`) when a referenced type is
   published.

## Nightly load

The election data is copied from Databricks into the election database by
gp-data-platform's `sync_election_api` Airflow DAG
(`airflow/astro/dags/sync_election_api.py`), daily at 22:00 UTC. It builds a
staging copy of every table, gates it, then a single `swap` task renames the
whole set into place in one transaction, followed by `drop_old`. Nothing is told
when the swap commits.

What is needed: one task after `swap` that sends
`POST /api/revalidate-person` with `{ "scope": "election-data" }` and the
`x-revalidate-secret` header, to `https://goodparty.org` from the prod
deployment and to the develop deployment from dev. It sits downstream of the
`cutover_enabled` gate, so a rehearsal night refreshes nothing. It needs the
revalidate secret in Astro for each environment, and the Vercel firewall has to
let Astro's requests through the way it lets gp-api's through.
