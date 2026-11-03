# Nevada: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Nevada so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which offices
are actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/nevada.json`](./research/nevada.json).

**The one thing to know first:** Nevada votes on one even-year calendar, a June
primary and a November general election. County commissioners and most county
offices are partisan, but the **sheriff** is nonpartisan by law, and so are city,
school and judicial offices. Primaries for party offices are closed. Carson City is
a consolidated city and county.

## Legislative calendar

Next regular session: convenes 1 February 2027 (the first Monday of February after
the Assembly election; sessions are every two years, Nev. Const. art. 4, § 2) and
must end by midnight of its 120th day (31 May 2027). The governor has five days,
Sundays excepted, to return a bill, and ten days, Sundays excepted, after final
adjournment to veto (art. 4, § 35). Laws take effect on 1 October unless they set
another date (NRS 218D.330). There is no regular session in 2028.

Re-check this doc: July 2027. Last researched: October 2026.
Reviewed by Emily: 3 November 2026.

## How elections work in Nevada

Safe on any Nevada page, at the tier named.

### Election days

The **primary** is on the second Tuesday in June and the **general election** on
the first Tuesday after the first Monday of November, both in even-numbered years.

*NRS 293.12755, 293.175(1) · statutory · read in statute*

**General law cities** hold their general city elections in November of
even-numbered years. Category one cities, and category two cities that choose to,
also hold a city primary in June of even years. Charter cities follow their
charters.

*NRS 293C.140(1), 293C.145, 293C.175(1) · usual case · read in statute*

**School trustees** are elected at the general election on four-year cycles.

*NRS 386.160(1) · statutory · read in statute*

**Watch out:** do not state a charter city's election calendar unless race data
gives it.

### Primary type

Primaries are closed for party offices: a voter may vote a major party's primary
ballot only if registered with that party. Nonpartisan races appear on a ballot
every registered voter can vote. A candidate who changed party registration after
31 December before filing closes cannot run as that party's candidate.

*NRS 293.176(1), 293.257(2)-(3) · statutory · read in statute*

The candidate with the most votes in a party primary is the nominee. If only one
candidate files for a city office, that candidate is declared elected with no
election held; if no more than twice the seats file, the race skips the city
primary.

*NRS 293.260(2), 293C.180 · statutory · read in statute*

### Partisanship

Nevada law names its nonpartisan offices: judicial offices, school offices, the
**county sheriff**, city and town officers, constables, hospital trustees and a few
state boards. No party label is printed for them. Everything else elected by county
(commissioners, clerk, treasurer, assessor, recorder, district attorney, public
administrator) is partisan.

*NRS 293.195 · statutory · read in statute*

**Watch out:** never call a Nevada sheriff's race partisan, and never call a county
commission race nonpartisan.

### Winning an election

Party nominees are decided by the most votes in the primary, with no primary
runoff. For nonpartisan offices, the top vote-getters (twice the number of seats)
advance from the primary to November.

*NRS 293.260(2), 293C.180(2) · statutory · read in statute*

### Running as an independent

An independent candidate for a partisan office files a petition of candidacy
signed by registered voters. Nonpartisan offices have no party route, so every
candidate files the same way.

*NRS 293.200(1), 293.195 · statutory · read in statute*

## County government

Our data has 17 county-level pages: 16 counties and Carson City.

Each county is governed by a **board of county commissioners**. Its size follows
population: three in small counties (which may expand to five by ordinance and a
vote), five in counties of 100,000 to 700,000, and seven in counties of 700,000 or
more, elected from districts.

*NRS 244.011, 244.014, 244.016 · statutory · read in statute*

Our data shows elected county officers including the clerk, treasurer, assessor,
recorder, sheriff, district attorney and public administrator, and justices of the
peace and constables by township. Take which offices are on a page from race data.

**Carson City** is the consolidated city and county that is the seat of
government; it has county powers.

*Nev. Const. art. 4, § 37[A] · statutory · read in statute*

## City government

A general law city's government is vested in a **mayor and city council**, with
home rule subject to the Legislature's power to change any city's organization by
special act or charter. Council members serve staggered four-year terms; category
three cities have a mayor and three or five council members. The governing body
controls its own elections.

*NRS 266.010, 266.015, 293C.110(1), 293C.140(2), 293C.145 · usual case · read in statute*

**Watch out:** many of our Nevada municipal pages are not cities. Pahrump, Incline
Village, Sun Valley, Zephyr Cove and similar places are unincorporated communities
whose pages hold district boards, justices of the peace or constables. Describe
the offices on the page, never a city government.

## School districts

Every school district is countywide (17 pages). A board has 5, 7 or 11 trustees
depending on enrollment; in the largest district the 11-member board is partly
elected and partly appointed.

*NRS 386.120(1) · statutory · read in statute*

## Metro and major-place exceptions

`nv/clark-county/las-vegas`, `nv/clark-county/henderson`,
`nv/clark-county/north-las-vegas`, `nv/washoe-county/reno`,
`nv/washoe-county/sparks`, `nv/carson-city`, `nv/clark-county`,
`nv/clark-county-school-district`

Clark County has a seven-member commission; take each city's ward map and
calendar from race data.

### Data issues

- `nv/carson-city/county-court-clerk` is filed as a municipal page and holds a
  recorder race; it is an office, not a place.
- `nv/clark-county/clark` is a municipal page with no matching city.

## Writing rules

1. Never name an officeholder or a candidate.
2. **Sheriff, city, school and judicial races are nonpartisan; county commission
   and other county offices are partisan.**
3. **Primaries are closed** for party offices. Do not say independents can vote in
   a party primary.
4. Do not describe an unincorporated community as a city.
5. Carson City is both a city and a county; do not place it inside another county.
6. Avoid anything that changes within a year: who has filed, whether a race is
   contested, filing deadlines, current ballot measures.

Our data has no Nevada place names that collide with a county name in a different
county.

## Sources

- **Nevada Revised Statutes:** whole chapters at
  `https://www.leg.state.nv.us/NRS/NRS-<chapter>.html` (293 elections, 293C city
  elections, 244 counties, 266 general law cities, 386 school districts, 218D
  Legislature). The pages carry their revision stamp (revised April 2026, with the
  2025 session). Plain scripts can fetch them; two seconds per request was fine.
  The text uses en-spaces and paragraph marks, so decode as UTF-8 before reading.
- **Constitution:** `https://www.leg.state.nv.us/Const/NvConst.html`.
- **Page data:** goodparty.org sitemap shard 29, 28 October 2026.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
