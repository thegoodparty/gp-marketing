# Kentucky: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Kentucky so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which
offices are actually on this ballot and how many seats, come from our own race
data, which always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/kentucky.json`](./research/kentucky.json).

**The one thing to know first:** every Kentucky local election is held in
November of an even-numbered year, after a closed party primary in May. County
offices are partisan everywhere. City races are partisan unless the city has
chosen nonpartisan elections by ordinance, so the label varies from city to city.
School board races are always nonpartisan. Louisville and Lexington are merged
city-county governments with no city page of their own: their mayor and council
sit on the Jefferson County and Fayette County pages.

## Legislative calendar

Next regular session: convenes 5 January 2027 (the first Tuesday after the first
Monday in January of odd-numbered years, Ky. Const. § 36), adjourns, and
reconvenes on 2 February 2027 (the first Tuesday in February). The odd-year
session is limited to 30 legislative days and cannot run past 30 March (Ky.
Const. §§ 36, 42). The governor has ten days, Sundays excepted, to act on a bill.
When the session's adjournment prevents a veto from being returned, the bill
becomes law unless the governor vetoes it within ten days after adjournment
(Ky. Const. § 88), so every 2027 bill is settled by mid-April. New laws take effect
ninety days after the session adjourns, unless passed as emergency legislation
(Ky. Const. § 55), so most 2027 changes take effect by late June. The 2028 session
convenes the first Tuesday after the first Monday in January and is capped at
sixty legislative days and 15 April (Ky. Const. §§ 36, 42).

Re-check this doc: May 2027. Last researched: October 2026. Reviewed by Emily:
2 November 2026.

## How elections work in Kentucky

Safe on any Kentucky page, at the tier named.

### Election days

Every regular election of state, county, city and district officers is held on
the first Tuesday after the first Monday in November. The Constitution allows no
more than one election a year in any county, city or district, except as it
provides itself.

*Ky. Const. § 148; KRS 118.025(4) · statutory · read in statute*

The primary is held on the first Tuesday after the third Monday in May.

*KRS 118.025(3) · statutory · read in statute*

**County offices** are elected every four years, in the even-numbered year
between presidential elections (the cycle began in 1998). That covers the county
judge/executive, county clerk, county attorney, sheriff, jailer, coroner,
surveyor, every justice of the peace and every constable, and the property
valuation administrator, which replaced the elected county assessor. All serve
four years.

*Ky. Const. § 99; KRS 132.370 · statutory · read in statute*

The **circuit court clerk** (one per county) and the **Commonwealth's attorney**
(one per judicial circuit) are elected for six-year terms, on their own six-year
cycle that began in 2000.

*Ky. Const. § 97 · statutory · read in statute*

**City offices** are elected at the November election in even-numbered years.
Mayors serve four years and council or commission members serve two, so most
cities vote every even year, with the mayor on the ballot every other time.

*Ky. Const. §§ 160, 167; KRS 83A.040(1), (4) · statutory · read in statute*

**Watch out:** do not say which even year a city's mayor is elected in. Take it
from race data.

**School boards** are elected in even-numbered years for four-year terms, normally
at the November election. Independent districts in cities that were fifth class
under the old system may instead hold their board election on the first Saturday
in May.

*KRS 160.200(1), (3) · usual case · read in statute*

**Special districts.** Soil and water conservation district supervisors are on
the November ballot, nominated by petition, for four-year terms. Fire protection
district trustees are not elected by the public: firefighters and property owners
each elect two trustees at the fire house on the fourth Saturday in June, and
three more are appointed.

*KRS 262.240(1), 118.305(1)(j), 75.031(1)-(2) · statutory · read in statute*

**Can a place move its own election date?** No. The dates are set in the
Constitution, and city elections follow the state election calendar. The only
local switch is the May option for some independent school districts.

*Ky. Const. §§ 148, 167; KRS 83A.043(2) · statutory · read in statute*

**Watch out:** Kentucky elects its governor and other statewide officers in
odd-numbered years. That is not a local election year. Never say a regular
Kentucky local race is on an odd-year ballot. (A vacancy can bring a special
election in any year; take that only from race data.)

*Ky. Const. § 95 · statutory · read in statute*

### Primary type

Kentucky's primary is **closed**. To vote in a party's primary, a voter must have
been registered with that party on 31 December before the primary, and may vote
only for that party's candidates. Any registered voter, including independents,
may vote in the nonpartisan races (city and judicial) on the primary ballot.

*KRS 116.055(1), (4), (5) · statutory · read in statute*

Only a party whose presidential candidate won at least 10% statewide counts as a
political party, and a party must nominate all its candidates in the primary.

*KRS 118.015(1), 118.105(1) · statutory · read in statute*

### Partisanship

This splits by type of local government.

- **County offices: partisan**, with a party primary. The party-primary rule
  covers every elective office except school boards, nonpartisan races and
  presidential electors.

  *KRS 118.105(1), (6) · statutory · read in statute*

- **Cities: partisan by default, nonpartisan by choice.** City elections follow
  the general (partisan) election law unless the city council adopts nonpartisan
  elections by ordinance. A city can switch at most once every five years.

  *KRS 83A.050(1)-(2) · varies by place · read in statute*

  A nonpartisan city shows no party label in its primary, and the primary sends
  the top two candidates for each seat to November (or twice the number of seats
  for at-large councils). Where no more than two people run per seat, there is no
  primary for that office. A home rule class city can also drop the nonpartisan
  primary entirely, in which case the top vote-getters in November win.

  *KRS 83A.170(6), (10), (13), 83A.045(2)(b) · varies by place · read in statute*

- **Louisville Metro: nonpartisan by statute** since 1 January 2025, for both the
  mayor and the Metro Council.

  *KRS 67C.103(5), 67C.105(2)(a); 2024 Ky. Acts ch. 181 · statutory · read in statute*

- **Lexington-Fayette Urban County Government:** the urban county's officers are
  set by its own plan, not by statute. Take partisanship from race data.

  *KRS 67A.020 · varies by place · read in statute*

- **School boards: nonpartisan, with no primary.** Candidates file by petition and
  appear under the words "School Candidates" with no party emblem.

  *KRS 160.220, 160.230, 118.105(6) · statutory · read in statute*

- **Judges** run on a separate nonpartisan judicial ballot.

  *KRS 118A.060(8) · statutory · read in statute*

**Watch out:** never call a Kentucky city race partisan or nonpartisan unless race
data shows party labels (or their absence). Avoid "nonpartisan city elections" as
a statewide statement: it is a local option.

### Winning an election

**Plurality.** The candidate with the most votes in a primary is the nominee, and
the candidate with the most votes in November wins. A tie is decided by lot.
Kentucky has no runoffs. The two-candidate nonpartisan city primary is a
narrowing round, not a runoff.

*KRS 118.245(1), 118.425(2), 83A.170(15), 160.260 · statutory · read in statute*

### Running as an independent

Any candidate can reach the November ballot by a petition of registered voters
from the district. A voter may sign more than one candidate's petition, and the
law does not bar primary voters from signing.

*KRS 118.315(1)-(2) · statutory · read in statute*

Someone registered with a party on 1 January of the election year cannot run as
an independent. That bar does **not** apply to mayor and council races in home
rule class cities, school board, soil and water district, or nonpartisan races.

*KRS 118.315(1) · statutory · read in statute*

A candidate who loses a primary cannot then appear on the November ballot for the
same office. Independent city candidates skip the primary altogether.

*KRS 118.345(1), 83A.045(1)(b) · statutory · read in statute*

## County government

Our data has a page for each of Kentucky's 120 counties. Each county is divided
into justices' (magisterial) districts, not townships, so there are no township
pages. Two counties have merged city-county governments (Jefferson and Fayette,
below).

*Ky. Const. § 142 · statutory · read in statute*

### Fiscal court and county judge/executive

Every county is governed by a **fiscal court**. The **county judge/executive** is
the county's chief executive and presides over the fiscal court. Despite the
title, the judge/executive is not a judge.

*Ky. Const. § 144; KRS 67.040, 67.705(1) · statutory · read in statute*

A fiscal court takes one of two forms:

- **Magistrate counties (most counties):** the county judge/executive plus the
  justices of the peace, one from each of three to eight districts. In practice
  these justices are called **magistrates**.
- **Commissioner counties:** the county judge/executive plus **three county
  commissioners**, elected countywide, one living in each of three districts.
  Party primaries for commissioner are voted by district. A county adopts or drops
  this form by referendum.

*Ky. Const. §§ 142, 144; KRS 67.040(1), 67.050, 67.060(1), (3), 67.705(3) · usual case · read in statute*

Our data labels the fiscal court seats "County Magistrate" in 104 counties and
"County Commission" in 14 (Bath, Boone, Boyd, Campbell, Daviess, Graves, Greenup,
Johnson, Kenton, Marshall, Mason, McCracken, Montgomery, Pike). Follow the
label on the page rather than deciding the form yourself.

**Commissioner counties still elect justices of the peace**, in districts matching
the commissioner districts, but those justices do not sit on the fiscal court.

*KRS 67.045(3) · statutory · read in statute*

**Watch out:** in Kentucky a "magistrate" is a fiscal court member, not a judicial
officer. And on a commissioner county's page, never describe the justice of the
peace or "magistrate" as a member of the county's governing body.

### Other county offices

Every county elects a county clerk, county attorney, sheriff, coroner, surveyor,
property valuation administrator, a constable in each district and, in most
counties, a jailer, all for four years. All are partisan. Each county also elects
a circuit court clerk for six years, and each judicial circuit (often several
counties) elects a Commonwealth's attorney.

*Ky. Const. §§ 97, 99; KRS 132.370 · usual case · read in statute*

### County charters and mergers

Kentucky counties have no home rule charters of their own. The only routes to a
different structure are voter-approved mergers with their cities: an urban-county
government, a consolidated local government, a charter county, or a unified local
government. Each is created by referendum under a statute, and the election dates
in the Constitution apply to all of them.

*KRS 67A.010, 67C.101, 67.825, 67.840, 67.900; Ky. Const. § 148 · statutory · read in statute*

## City government

Kentucky law organizes its municipalities as **cities**. Names like Beechwood
Village, Coal Run Village or Jeffersontown are the city's name, not a different
kind of government.

### Classes

Since 2015, cities fall into **two classes, set by form of government rather
than population**:

- **First class:** cities under the mayor-alderman plan (KRS Chapter 83).
  Louisville, the first class city, was replaced by Louisville Metro.
- **Home rule class:** every city under the mayor-council, commission, or city
  manager plan.

*KRS 81.005(1)-(2), 67C.101(1) · statutory · read in statute*

A city changes class only by changing its form of government, which takes a
popular vote and can happen at most once every five years. Population does not
move a city between classes, and a city keeps population-based powers it has used
even if its population later drops.

*KRS 81.005(4), 83A.160(1), (5), 83A.022 · statutory · read in statute*

**Watch out:** older sources rank Kentucky cities from first to sixth class by
population. That system ended on 1 January 2015. Never call a city "fourth class"
or "fifth class". The old classes survive only in a few narrow lists, such as
which school districts count as independent.

*KRS 160.020(2), 83A.024 · statutory · read in statute*

### What a city elects

Every city elects a **mayor** for four years. What the elected body is called
depends on the plan:

- **Mayor-council plan:** a **city council** of six to twelve members, set by
  ordinance. The mayor is the executive.
- **Commission plan:** the mayor and **four city commissioners**, who together
  form the **city commission**.
- **City manager plan:** the mayor and **four city commissioners**, who together
  form the **board of commissioners** and hire a city manager.

Council and commission members serve two years.

*KRS 83A.030, 83A.040(1), (4), 83A.130(2), 83A.140(2), 83A.150(2) · usual case · read in statute*

**Watch out:** do not call every city's governing body a "city council". In
commission and city manager cities it is a commission or board of commissioners.
Use the label in race data.

Members are elected at large unless the city has created wards, or a mix of ward
and at-large seats, by ordinance. In a ward city, candidates must live in their
ward, but the whole city votes in November.

*KRS 83A.040(4), 83A.100(1), (4)(a) · varies by place · read in statute*

### Home rule

A Kentucky city may exercise any power for a public purpose that does not
conflict with the Constitution or a statute, and a power conflicts with a statute
wherever a comprehensive scheme of legislation covers the subject. City elections
are governed by the state election chapters. So the election date, plurality rule
and term lengths are flat-assertable for every city. Partisanship, wards, council
size and the nonpartisan primary are local options the statutes themselves offer.

*Ky. Const. § 156B; KRS 82.082, 83A.043(1) · statutory · read in statute*

### School districts

Kentucky has **county school districts** and **independent school districts**
(usually serving a city). County districts elect five board members, one from
each of five divisions. Independent districts elect their board at large.

*KRS 160.020(1), 160.210(1)-(2) · statutory · read in statute*

Our data has 173 school district pages: 120 county districts and 53 independent
districts.

## Metro and major-place exceptions

### Louisville Metro (Jefferson County)

`ky/jefferson-county`

Louisville and Jefferson County merged into one consolidated local government,
which replaced both the city and the county government and covers the whole
county. It is legally neither a city nor a county.

*KRS 67C.101(1), (2)(d), (5) · statutory · read in statute*

- A **mayor**, elected countywide for four years in a nonpartisan election, limited
  to two consecutive terms.
- A **Metro Council** of 26 members, one per district, elected for four years in
  nonpartisan elections.

*KRS 67C.103(1)-(5), 67C.105(2) · statutory · read in statute*

The county's constitutional offices (county clerk, sheriff, county attorney and
the rest, and the fiscal court seats) still exist and are still elected, but their
county-government powers pass to Louisville Metro, which sets the duties of the
county judge/executive and the magistrates or commissioners by ordinance.

*KRS 67C.121, 67.705(4) · statutory · read in statute*

The other cities in Jefferson County stay incorporated and elect their own
governments. Our data has 82 city pages in Jefferson County, far more than any
other county (Kenton has 17).

*KRS 67C.111(1) · statutory · read in statute*

**Watch out:** our data has no Louisville page. The Metro mayor and council appear
on the Jefferson County page. Copy there must describe the merged government, not
a separate county fiscal court, and must not call Metro races partisan.

### Lexington-Fayette Urban County Government (Fayette County)

`ky/fayette-county`

Lexington and Fayette County merged into an urban-county government, which took
over all city and county government in the county. Its form, officers and their
duties are set by its own plan, not by statute.

*KRS 67A.010, 67A.020, 67A.030 · statutory · read in statute*

**Watch out:** our data has no Lexington page and no city pages in Fayette County.
The urban county council and executive appear on the Fayette County page. Do not
describe a separate city of Lexington government or a county fiscal court there,
and take seat counts and partisanship from race data.

### Cities in more than one county

A city that crosses a county line files candidates with the clerk of the county
where each candidate lives, and each county clerk certifies its vote totals to
the other. Our pages
file each city under one county. Do not write that a city lies wholly within the
county on its page.

*KRS 83A.047 · statutory · read in statute*

## Writing rules

These are the ways Kentucky copy goes visibly wrong.

1. **Never infer a county from a place name.** 16 of our Kentucky city pages share
   a name with a different Kentucky county. Jackson is in Breathitt County, Union
   is in Boone County, Franklin is in Simpson County, Hardin is in Marshall
   County, and Martin and Allen are both in Floyd County. The full list is in
   [`research/places-named-after-another-county.json`](./research/places-named-after-another-county.json).
   Always take the county from the page data.
2. Never name an officeholder or a candidate.
3. **Never write about Louisville or Lexington as separate city governments.**
   Their governments are on the Jefferson and Fayette county pages.
4. **Do not call a city race partisan or nonpartisan** unless race data shows it.
   County races are partisan, school board races are nonpartisan, and Louisville
   Metro is nonpartisan.
5. **Never describe a city by its pre-2015 class** ("fourth class city"). Cities
   are first class or home rule class.
6. **Do not call every city governing body a city council.** Commission and city
   manager cities have commissioners.
7. **The county judge/executive is not a judge, and a magistrate is not a judicial
   officer.** Both are county government.
8. In a commissioner county, the justices of the peace are not part of the fiscal
   court.
9. Do not call Kentucky's primary open. It is closed, and only nonpartisan races
   are open to every voter.
10. Never put a regular Kentucky local race in an odd-numbered year.
11. Do not state which even year a mayor or a given school board seat is elected
    in unless race data gives the date.
12. Avoid anything that changes within a year: who has filed, whether a race is
    contested, filing deadlines, current ballot measures.

### What search results commonly get wrong

- Louisville Metro races described as partisan. They have been nonpartisan since
  2025.
- Kentucky cities ranked first to sixth class. That system was replaced in 2015.
- "Kentucky city elections are nonpartisan." Only where the city chose it.
- The county judge/executive described as a judicial office. By statute it is
  the county's chief executive officer.
- Kentucky's odd-year statewide elections presented as the local election year.

## Sources

- **Statutes:** Kentucky Revised Statutes, read from the Legislative Research
  Commission at `https://apps.legislature.ky.gov/law/statutes/`. There is no bulk
  download (the LRC points to the commercial editions for that). Each chapter's
  table of contents is `chapter.aspx?id=<n>` (ids are on the statutes index page),
  and each section is a one-page PDF at `statute.aspx?id=<n>`, showing its
  effective date and full amendment history. Chapters read: 67, 67A, 67C, 75, 81,
  82, 83A, 116, 118, 118A, 132, 160, 262.
- **Constitution:** one PDF per section at
  `https://apps.legislature.ky.gov/Law/Constitution/Constitution/ViewConstitution?rsn=<n>`.
  The `rsn` is not the section number (§ 36 is `rsn=40`); take it from the links on
  `https://apps.legislature.ky.gov/law/constitution/`.
- **How the quotes were checked:** plain curl works with a browser user agent, no
  rate limit was hit at one request a second, and no terms or sign-in are needed.
  But every page is a PDF, which `verify-ledger.ts` (and its `--browser` snippet)
  reads as raw bytes, so a correct quote shows as missing. Every ledger entry is
  therefore marked `manual`, and all 121 quotes were machine-checked against fresh
  downloads of the cited PDFs on 27 October 2026, twice: with a small script that
  decodes the PDF text streams (plain WinAnsi text, no font tricks) and applies the
  checker's own `normalize()`, and again with macOS PDFKit. Both found all 121.
- **Session law read for changes:** 2024 Ky. Acts ch. 181 (Louisville Metro
  nonpartisan from 2025), 2026 Ky. Acts ch. 175 (election administration,
  including KRS 83A.040, 83A.170, 118.015, 118.315, 160.200), 2026 Ky. Acts ch. 165
  (Metro Council).
- **Page data:** goodparty.org sitemap shard 18, 27 October 2026.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
