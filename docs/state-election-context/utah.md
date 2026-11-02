# Utah: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Utah so you do not have to research the same ground
on every page. It is not an authority: per-page specifics, like which offices are
actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/utah.json`](./research/utah.json).

**The one thing to know first:** Utah runs two calendars. County offices and
school boards are on the November ballot in even-numbered years, after a June
primary. Cities and towns elect in November of odd-numbered years, after an
August primary only when a race is crowded. Partisanship splits by tier: county
races are always partisan and can never become nonpartisan, school board races
are nonpartisan, and city races are nonpartisan unless a smaller city or town has
chosen party conventions. Three-quarters of our Utah pages are cities and towns,
so the odd-year calendar is the right one for most pages.

## Legislative calendar

Next regular session: convenes 19 January 2027 (the first Tuesday after the third
Monday in January, every year, Utah Code § 36-3-201; Utah Const. art. VI, § 2). A
general session may last no more than 45 calendar days, not counting holidays
(Utah Const. art. VI, § 16), so it ends in early March. The Legislature can also convene itself when
two-thirds of each house agree. During the session a bill the governor does not return within ten
days (Sundays and the day received excepted) becomes law. After adjournment the
governor has twenty days to file objections (Utah Const. art. VII, § 8), so the
session's bills are settled by late March.

New laws take effect sixty days after the session adjourns, which falls in early
May, unless two-thirds of each house set another date (Utah Const. art. VI, § 25).

Re-check this doc: April 2027. Last researched: October 2026.

## How elections work in Utah

Safe on any Utah page, at the tier named.

### Election days

**County offices and school boards** are on the regular general election ballot,
the first Tuesday after the first Monday in November of even-numbered years. The
regular primary is the fourth Tuesday of June in even-numbered years.

*Utah Code §§ 20A-1-201, 20A-1-201.5 · statutory · read in statute*

**Cities and towns** hold their general election on the first Tuesday after the
first Monday in November of odd-numbered years. A municipal primary, held only if
needed, is the second Tuesday after the first Monday in August. Municipal
officers serve four-year terms starting the first Monday in January.

*Utah Code §§ 20A-1-202, 20A-1-201.5, 10-3-201 · statutory · read in statute*

In council-form cities, about half the council (and usually the mayor) is
elected in the year after a presidential election, and the rest two years later.

*Utah Code § 10-3-205 · usual case · read in statute*

**Special districts** (water, improvement, fire, recreation and similar boards)
elect their boards at either the odd-year municipal election or the even-year
general election, depending on the district. Terms are usually four years.

*Utah Code §§ 20A-1-202, 17B-1-306, 17B-1-303 · varies by place · read in statute*

**Watch out:** never put a Utah city race in an even year, or a county or school
board race in an odd year.

### Primary type

For county and other even-year partisan offices, each party nominates in the June
primary and **decides for itself who may vote in it**: it names which other
parties' members, if any, may vote, and whether unaffiliated voters may. So one
party's primary may be closed while another's is open to unaffiliated voters. A
candidate may appear for only one party.

*Utah Code §§ 20A-9-403, 20A-9-201 · statutory · read in statute*

Local school board candidates also run in the June primary, without party.

*Utah Code § 20A-1-102 · statutory · read in statute*

**Watch out:** do not call Utah primaries simply open or closed. It depends on
each party's choice for that year.

### Partisanship

**County races are partisan, everywhere and permanently.** A county's plan of
government may not provide for nonpartisan elections, and a county with partisan
elections may not switch to nonpartisan ones.

*Utah Code § 17-62-404 · statutory · read in statute*

**School board races are nonpartisan.**

*Utah Code § 20A-1-102 · statutory · read in statute*

**City and town races are nonpartisan by default.** All municipal candidates are
nominated at a nonpartisan municipal primary, and there is no primary when
candidates do not exceed twice the number of seats. But a third, fourth or fifth
class city, or a town, may instead nominate through municipal party conventions,
and then the party name appears on the ballot next to the candidate's name.

*Utah Code §§ 20A-9-404, 20A-6-402 · varies by place · read in statute*

**Special district races are nonpartisan**; their candidates go in the
nonpartisan section of the ballot.

*Utah Code § 17B-1-306 · statutory · read in statute*

**Watch out:** "local races in Utah are nonpartisan" is wrong for every county
office and not reliable for small cities and towns. "Utah county races could be
nonpartisan" is also wrong: state law forbids it.

### Winning an election

Plurality: the candidate with the most votes is elected or nominated, and in
multi-seat races the top vote-getters win. Utah's municipal ranked-choice pilot
has been repealed, so do not mention ranked-choice voting. No local runoff
exists in the law read for this doc.

*Utah Code §§ 20A-1-303, 20A-1-102 · statutory · read in statute*

### Running as an unaffiliated candidate

Utah calls independents **unaffiliated candidates**. They reach the even-year
ballot by filing a certificate of nomination with a signature petition, not
through the primary. A candidate who filed a declaration of candidacy for a party
may not switch to unaffiliated in the same year, and signing an unaffiliated
petition more than once for the same candidate is a crime. In a party's
signature route, a voter may sign only one candidate's petition per office.

*Utah Code §§ 20A-9-501, 20A-9-502, 20A-9-411 · statutory · read in statute*

City, school and special district candidates file without party, so there is no
separate independent route for those races.

## County government

Utah's counties are recognized by the constitution and our data has 29 county
pages. Counties are classed by population into six classes.

*Utah Const. art. XI, § 1; Utah Code § 17-60-104 · statutory · read in statute*

**Watch out:** Utah renumbered its county code in a 2025 special session. County
law now sits in Title 17 chapters 60-81, and older sources use different
numbers. Cite the new ones.

*Utah Code § 17-62-102 (history note) · statutory · read in statute*

Each county uses one of four forms, chosen by its voters:

- **County commission** (the default): three commissioners who are both the
  legislative body and the executive, elected at large for staggered four-year
  terms unless a court orders otherwise.
- **Expanded county commission:** five or seven commissioners.
- **County executive and council**, and **council-manager**, with a separate
  council and county executive. Only first to fourth class counties may adopt
  these.

*Utah Const. art. XI, § 4; Utah Code §§ 17-62-102, 17-62-201, 17-62-202, 17-62-404 · varies by place · read in statute*

Our Salt Lake County and Cache County pages carry a county executive race, which
fits the executive-council form. Take each county's commission or council from
race data.

Counties also elect, every four years, an **assessor, county attorney, auditor,
clerk, recorder, sheriff, surveyor and treasurer**, but a county may consolidate
offices by ordinance (many of our pages show a combined clerk-auditor or similar
"joint" office).

*Utah Code §§ 17-66-102, 17-66-202, 17-66-104 · usual case · read in statute*

## City and town government

Utah classifies municipalities by population. A municipality keeps its class
until a change is certified through the lieutenant governor.

*Utah Code §§ 10-2-301, 10-2-302 · statutory · read in statute*

- **First class city:** 100,000 or more.
- **Second class:** 65,000 to 99,999. **Third class:** 30,000 to 64,999.
  **Fourth class:** 10,000 to 29,999.
- **Fifth class city:** 1,000 to 9,999.
- **Town:** under 1,000.

*Utah Code § 10-2-301 · statutory · read in statute*

Forms of government are **council-mayor** (two separate branches, with the mayor
as executive; adopted only with voter approval), **six-member council** and
**five-member council**. City officers are
elected at large unless the city has created council districts by ordinance.
Candidates must have lived in the municipality for 12 months.

*Utah Code §§ 10-3b-102, 10-3-205.5, 20A-9-203 · varies by place · read in statute*

Any city or town may adopt its own **charter** through an elected charter
commission.

*Utah Const. art. XI, § 5 · varies by place · read in statute*

## School districts

41 of our 303 Utah pages are school districts, mostly county-wide districts plus
some city districts. Boards have five, seven or nine members depending on
enrollment, elected from board districts for four-year staggered terms at the
even-year general election.

*Utah Code §§ 20A-14-201, 20A-14-202, 20A-14-203 · usual case · read in statute*

## Metro and major-place exceptions

### Salt Lake City and other first class cities

`ut/salt-lake-county/salt-lake-city`

Utah's largest cities elect a mayor and council in odd years like every city.
Their form (council-mayor or council) and districts were not read for this doc.
Take offices from race data.

### Salt Lake County

`ut/salt-lake-county`

Has a county executive race in our data, consistent with a county
executive-council form. Do not describe a three-member commission.

### Places that are not cities

`ut/davis-county/north-davis`, `ut/davis-county/south-davis`,
`ut/salt-lake-county/emigration`, `ut/salt-lake-county/cottonwood`,
`ut/uintah-county/uintah-and-ouray`, `ut/weber-county/northwest-weber`,
`ut/kane-county/alton`

These pages hold only special district races (water, sewer, improvement,
general services), or in Alton's case a school board seat. Do not describe a
mayor or council on them.

## Writing rules

These are the ways Utah copy goes visibly wrong.

1. **Never infer a county from a place name.** **Uintah** (`ut/weber-county/uintah`)
   is in Weber County, not Uintah County. The full list is in
   [`research/places-named-after-another-county.json`](./research/places-named-after-another-county.json).
   Always take the county from the page data.
2. **Use the right calendar for the tier.** Counties and school boards: November
   of even years, June primary. Cities and towns: November of odd years, August
   primary only if needed.
3. **County races are partisan; school board and special district races are
   not.** City races are nonpartisan unless race data shows party labels.
4. Do not call Utah primaries simply open or closed.
5. Do not mention runoffs or ranked-choice voting.
6. Call independents "unaffiliated candidates" when describing Utah's process.
7. Do not describe a three-member commission without checking the county's form
   in race data.
8. Never name an officeholder or a candidate.
9. Avoid anything that changes within a year: who has filed, whether a race is
   contested, filing deadlines, current ballot measures.

## Sources

- **Statutes and constitution:** Utah Legislature, `https://le.utah.gov/xcode/`.
  Section pages are a JavaScript shell, but every chapter has a **whole-chapter
  XML download**: `https://le.utah.gov/xcode/Title<t>/Chapter<c>/C<t>-<c>_<version>.xml`,
  where the version string comes from the title page
  (`/xcode/Title<t>/<t>.html` sets `versionDefault`, and that file lists each
  chapter's `?v=` version). The constitution is one XML file,
  `https://le.utah.gov/xcode/UC_1800010118000101.xml`. Plain requests work and
  the checker reads the XML directly. Each section carries its latest amending
  act. The version string changes when a chapter is amended, so a ledger URL
  that starts returning 404 means the law changed. Read: Titles 10 chapters 2,
  3, 3b; 17 chapters 60, 62, 64-66; 17B chapter 1; 20A chapters 1, 4, 6, 9, 14;
  36 chapter 3; Constitution articles VI, VII, XI.
- **Currency check:** the XML includes the 2026 General Session (for example
  20A-9 and 17-62 amended by 2026 chapters 97, 102, 329) and the 2025 special
  session that renumbered Title 17.
- **Page data:** goodparty.org sitemap shard 45, 28 October 2026, read in the
  in-app browser; counts from `research/pages-by-state.csv`.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
