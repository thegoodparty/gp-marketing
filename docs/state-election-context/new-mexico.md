# New Mexico: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across New Mexico so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which offices
are actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/new-mexico.json`](./research/new-mexico.json).

**The one thing to know first:** New Mexico splits cleanly by tier. County offices
are partisan and on the November ballot in even-numbered years, after a June party
primary. Everything else local (school boards, special districts and most
municipalities) votes at a nonpartisan "regular local election" in November of
odd-numbered years, with no party names on the ballot. Municipalities that have not
opted in to that election vote instead on the first Tuesday in March of
even-numbered years, still without party labels.

## Legislative calendar

Next regular session: convenes 19 January 2027 (noon on the third Tuesday of
January, N.M. Const. art. IV, § 5). An odd-year session lasts up to 60 days
(ending by 20 March 2027); even-year sessions last 30 days and are limited to
budget matters, bills the governor asks for, and vetoed bills. The governor has 20
days after adjournment to sign bills passed in the last three days, and a bill not
signed by then does not become law (art. IV, § 22). Laws take effect 90 days after
adjournment, except appropriations and emergency acts (art. IV, § 23).

Re-check this doc: May 2027. Last researched: October 2026.

## How elections work in New Mexico

Safe on any New Mexico page, at the tier named.

### Election days

**County offices** are elected at the general election on the Tuesday after the
first Monday in November of even-numbered years. All county elected officials serve
four-year terms, and county commission terms are staggered.

*N.M. Const. art. XX, § 6; art. X, § 2 · statutory · read in statute*

**School boards and special districts** are elected at the **regular local
election**, on the first Tuesday after the first Monday in November of each
odd-numbered year. Counties are not part of it. Terms begin 1 January after the
election.

*NMSA 1978, §§ 1-22-2(C), 1-22-3(A), 1-22-18 · statutory · read in statute*

**Municipalities** vote on the "municipal officer election day", the first Tuesday
in March of even-numbered years, unless they have opted in by ordinance to the
November regular local election. A municipality that opted in may opt back out
after two November elections. A home rule city whose charter sets its own voter ID
rule may not use the November election.

*NMSA 1978, § 1-22-3.1(A)-(C) · varies by place · read in statute*

**Watch out:** never state whether a New Mexico city votes in March or November
unless race data gives the date.

### Primary type

Party primaries are on the first Tuesday after the first Monday in June of
even-numbered years and nominate major-party candidates. A voter registered with a
party votes only in that party's primary. A voter who declined to state a party may
ask for one major party's primary ballot and vote it.

*NMSA 1978, §§ 1-8-11, 1-8-12(B), 1-12-7(B) (amended 2025, ch. 54) · statutory · read in statute*

**Watch out:** the rule letting voters without a party choose a primary ballot is
recent (2025). Do not describe New Mexico primaries as closed to them.

### Partisanship

- **County races are partisan:** county commissioners, clerk, treasurer, assessor,
  sheriff and probate judge are nominated in party primaries.
- **School board, special district and municipal races are nonpartisan.** The
  regular local election lists every candidate with no party or slate designation,
  and municipalities voting in March follow the same Local Election Act.

*NMSA 1978, §§ 1-8-12(B), 1-22-3(B), 1-22-3.1(D)(1); N.M. Const. art. X, § 2 · statutory · read in statute*

### Winning an election

The candidate with the most votes wins, except in municipalities whose own laws
require a set percentage. Those hold either a separate top-two runoff after the
regular local election or a ranked-choice count on the same ballot.

*NMSA 1978, § 1-22-16(A) · varies by place · read in statute*

**Watch out:** do not mention a runoff for a city race unless race data shows one.

### Running as an independent

An independent candidate for a county office must be registered with no qualified
party on the date of the Secretary of State's general election proclamation and
must file nominating petitions.

*NMSA 1978, §§ 1-8-45(A), 1-8-51 · statutory · read in statute*

## County government

Our data has a page for each of New Mexico's 33 counties.

Each county is governed by a **board of county commissioners** of three or five
members; larger counties must have five, and a board can grow to five by unanimous
ordinance. Commissioners are elected from districts and serve staggered four-year
terms.

*NMSA 1978, §§ 4-38-2, 4-38-6; N.M. Const. art. X, §§ 2(C), 7 · varies by place · read in statute*

Every county also elects a **clerk**, **treasurer**, **assessor**, **sheriff** and
**probate judge**, all for four years. A county officer who has served two
consecutive terms cannot hold any county office for two years afterwards.

*N.M. Const. art. X, § 2 · statutory · read in statute*

**Watch out:** the two-term limit applies to every county office, not just the one
held. Do not describe a term-limited officer moving to another county office.

The Municipal Code also counts incorporated counties and "H class" counties as
municipalities, governed by a council or by the county commission. The
constitution also allows "city and county" consolidations of
50,000 people or more.

*NMSA 1978, § 3-1-2(F)-(G); N.M. Const. art. X, § 4 · varies by place · read in statute*

New Mexico has no townships.

## City, town and village government

Municipalities are **cities**, **towns** and **villages** (plus incorporated
counties). A city is governed by a city council or commission; a town or village
by a board of trustees. Most have an elected mayor. Our data has 107 municipal
pages, most with a mayor, a council and a municipal judge.

*NMSA 1978, § 3-1-2(F)-(G) · usual case · read in statute*

**Home rule.** Voters may adopt a charter, and a charter municipality may exercise
any power not expressly denied by general law or its charter. Where a charter's
procedures conflict with the general mayor-council provisions, the charter
governs. Council members elected by district must live in and be elected by their
district.

*N.M. Const. art. X, § 6; NMSA 1978, § 3-11-1(B) · statutory · read in statute*

## School boards

A local school board has five members, or seven if the board adopts numbered
positions by resolution. Districts over 16,000 people elect members from
single-member districts. Our data has 89 school district pages.

*NMSA 1978, §§ 22-5-1, 22-5-1.1, 22-5-3 · varies by place · read in statute*

## Metro and major-place exceptions

`nm/bernalillo-county/albuquerque`, `nm/doa-ana-county/las-cruces`,
`nm/sandoval-county/rio-rancho`, `nm/santa-fe-county/santa-fe`,
`nm/san-juan-county/farmington`, `nm/chaves-county/roswell`, `nm/los-alamos-county`

For each, take the election date, runoff rule and council size from race data.
`nm/los-alamos-county` holds county offices; do not describe it as a city.

### Data issues

- The Doña Ana County slug is `nm/doa-ana-county` (the ñ is dropped). Write the
  county's name with the ñ.
- Our "county court judge" label on county pages needs checking: New Mexico's
  county-level elected judges are magistrates and the probate judge.

## Writing rules

1. **Never infer a county from a place name.** The town of Bernalillo is in
   Sandoval County, not Bernalillo County. Always take the county from the page.
2. Never name an officeholder or a candidate.
3. **County races are partisan; municipal, school and district races are not.**
4. Do not state whether a city votes in March (even years) or November (odd years)
   unless race data gives the date.
5. Write "Doña Ana" with the ñ, whatever the slug says.
6. Avoid anything that changes within a year: who has filed, whether a race is
   contested, filing deadlines, current ballot measures.

## Sources

- **Statutes and constitution:** NMOneSource, the New Mexico Compilation
  Commission's official site. **Browser only** (HTTP 403 to scripts). Each chapter
  of the unannotated statutes is one PDF:
  `https://nmonesource.com/nmos/nmsa-unanno/en/<id>/1/document.do`, with item ids
  from `https://nmonesource.com/nmos/nmsa-unanno/en/nav_alpha.do?iframe=true`
  (Chapter 1 Elections is 18502, 3 Municipalities 18504, 4 Counties 18505, 22 Public
  Schools 18522). The constitution is `/nmos/c/en/5916/1/document.do`. No terms,
  sign-in or captcha. Text was extracted in the in-app browser with pdf.js loaded
  from cdnjs (about two minutes for all six PDFs, kept in a page variable, so do not
  navigate that tab away). Every ledger entry is marked manual because the checker
  cannot read PDFs; all 42 quotes were matched against the extracted text with the
  checker's own normalization, 42 found.
- **Page data:** goodparty.org sitemap shard 32, 28 October 2026.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
