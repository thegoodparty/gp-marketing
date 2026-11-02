# Wyoming: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Wyoming so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which offices
are actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/wyoming.json`](./research/wyoming.json).

**The one thing to know first:** almost every Wyoming local race is on the same
even-year calendar as the state: an August primary and a November general election.
County offices are partisan. City and town offices are nonpartisan by law, and
their candidates still go through the August primary, on a separate nonpartisan
ballot. School trustees skip the primary and appear only in November. Special
districts set their own dates.

## Legislative calendar

Next regular session: convenes 12 January 2027 (noon on the second Tuesday of
January in odd-numbered years, for a general and budget session, Wyo. Const.
art. 3, § 7). Even-year sessions are budget sessions. The legislature may meet no
more than 40 legislative working days in a calendar year outside special sessions
(art. 3, § 6). The governor has three days, Sundays excepted, to return a bill;
after adjournment, 15 days to file objections (art. 4, § 8).

Re-check this doc: April 2027. Last researched: October 2026.

## How elections work in Wyoming

Safe on any Wyoming page, at the tier named.

### Election days

The **primary** is on the first Tuesday after the third Monday in August of
even-numbered years, for both partisan and nonpartisan offices. The **general
election** is on the Tuesday after the first Monday in November of even years.

*Wyo. Stat. § 22-2-104(a)-(b) · statutory · read in statute*

**County offices.** Clerks, treasurers, assessors, coroners, county and
prosecuting attorneys, sheriffs and clerks of district court serve four-year terms
on the cycle counted from 1974. County
commissioners are elected at every general election on staggered four-year terms.

*Wyo. Stat. §§ 22-2-105(a)(ii), 18-3-501(a) · statutory · read in statute*

**Cities and towns** vote at the same August primary and November general election
as the state, unless a town has adopted a charter ordinance to hold its own
election on the Tuesday after the first Monday in May every two years.

*Wyo. Stat. §§ 22-23-201(a), 22-23-202(a) · usual case · read in statute*

**School and community college trustees** are elected in November of general
election years for four-year terms starting in December, with no more than a
simple majority of a board elected at once.

*Wyo. Stat. §§ 22-2-104(e), 22-22-102 · statutory · read in statute*

**Special districts** (hospital, fire, cemetery, conservation, water and others)
elect directors in March, May or November, as each district decides.

*Wyo. Stat. § 22-29-112(a) · varies by place · read in statute*

**Watch out:** never state a special district's or May town's election date
unless race data gives it.

### Primary type

A voter who wants a party's primary ballot declares that party when asking for it;
asking for a party ballot is itself a declaration of affiliation. A voter can
instead take only the nonpartisan ballot without declaring a party. A change of
party for the primary must be filed before the candidate filing period opens.

*Wyo. Stat. §§ 22-5-212, 22-5-214(a) · statutory · read in statute*

The candidates with the most votes on each party ballot are nominated. There is no
primary runoff.

*Wyo. Stat. § 22-5-215 · statutory · read in statute*

**Watch out:** Wyoming voters cannot switch parties at the primary polls. Do not
describe the primary as open.

### Partisanship

- **County races are partisan.** Candidates are nominated in the party primary,
  by petition as independents, or by convention.
- **City and town races are nonpartisan by law.** "All municipal offices are
  nonpartisan." Every municipal candidate runs in the municipal primary on a
  nonpartisan ballot, and twice as many candidates as seats advance to November.
- **School and community college boards are nonpartisan.** Candidates file an
  application and appear on the nonpartisan ballot in November only.
- **Special districts** are outside the party nomination rules.

Nonpartisan ballots carry no party designations.

*Wyo. Stat. §§ 22-5-101, 22-6-123, 22-22-202, 22-23-102, 22-23-301, 22-23-307 · statutory · read in statute*

### Winning an election

The candidates with the most votes win, in primaries, general elections and
special district elections. There are no runoffs.

*Wyo. Stat. §§ 22-5-215, 22-23-307, 22-29-113(b)(ii) · statutory · read in statute*

### Running as an independent

A candidate for a partisan county office who is not a party nominee files a
petition signed by registered electors of the county who are eligible to vote for
the candidate. A candidate who lost the party primary may not then run by petition
for the same office.

*Wyo. Stat. §§ 22-5-302, 22-5-304(b) · statutory · read in statute*

## County government

Our data has a page for each of Wyoming's 23 counties.

Each county is governed by a **board of county commissioners** of three members,
or five if the county's voters approved the increase.

*Wyo. Stat. § 18-3-501 · varies by place · read in statute*

Each county also elects a **clerk**, **treasurer**, **assessor**, **coroner**,
**county and prosecuting attorney**, **sheriff** and **clerk of district court**,
all for four years.

*Wyo. Stat. § 22-2-105(a)(ii) · statutory · read in statute*

**Watch out:** Wyoming's local prosecutor is usually the **county and prosecuting
attorney**. Our data has a "district attorney" race only in Natrona County; do not
call the county attorney a district attorney elsewhere.

### Townships

The constitution lets a county adopt township government by a vote of its
citizens, but our data has no Wyoming township pages.

*Wyo. Const. art. 12, § 4 · statutory · read in statute*

## City and town government

Wyoming has cities and towns, in no more than four classes. A **first class city**
has 4,000 people or more and has been proclaimed one. The governing body is a
council (or commission) including the **mayor**, who is elected by voters or by
the council.

*Wyo. Const. art. 13, § 1(b); Wyo. Stat. § 15-1-101(a)(iv), (viii) · usual case · read in statute*

**Home rule.** Every city and town may decide its local affairs by ordinance,
subject to statutes that apply to all cities and towns, and may exempt itself from
other statutes by charter ordinance.

*Wyo. Const. art. 13, § 1(b) · statutory · read in statute*

Our data has 83 municipal pages, nearly all with a mayor and council race.

## Metro and major-place exceptions

`wy/laramie-county/cheyenne`, `wy/natrona-county/casper`,
`wy/albany-county/laramie`, `wy/campbell-county/gillette`,
`wy/sweetwater-county/rock-springs`, `wy/sheridan-county/sheridan`,
`wy/teton-county/jackson`

Take each one's ward structure and council size from race data.

### School districts

Our 48 school district pages are numbered county districts
(`wy/laramie-county-school-district-1`, `wy/park-county-school-district-16`).

## Writing rules

1. **Never infer a county from a place name.** Laramie (the city) is in Albany
   County, not Laramie County, and Cheyenne is in Laramie County. Always take the
   county from the page.
2. Never name an officeholder or a candidate.
3. **County races are partisan; city, town, school and special district races are
   not.**
4. Local elections are in **August and November of even years**, except special
   districts and towns that chose May.
5. Say **county and prosecuting attorney**, not district attorney, unless race data
   says otherwise.
6. Avoid anything that changes within a year: who has filed, whether a race is
   contested, filing deadlines, current ballot measures.

## Sources

- **Statutes and constitution:** the Legislative Service Office publishes each
  title as one PDF at `https://wyoleg.gov/statutes/compress/title<nn>.pdf`
  (Title 22 Elections, 18 Counties, 15 Cities and towns). The constitution is
  `title97.pdf`; `constitution.pdf` returns the web app instead. Plain scripts can
  download them, with no terms or sign-in. The checker cannot read PDFs, so every
  ledger entry is manual; all 35 quotes were matched in the in-app browser against
  text extracted with pdf.js (loaded from cdnjs) using the checker's normalization,
  35 found. The PDFs carry no compilation date; the Folio viewer at
  `statutes.wyoleg.gov` lists 2026 Wyoming Statutes as the current set.
- **Page data:** goodparty.org sitemap shard 51, 28 October 2026.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
