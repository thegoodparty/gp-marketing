# Virginia: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Virginia so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which offices
are actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/virginia.json`](./research/virginia.json).

**The one thing to know first:** Virginia has three kinds of local government:
counties, independent cities and towns. An independent city is not part of any
county. It has its own sheriff, its own Commonwealth's attorney and its own school
board, and in our data it sits at the same level as a county. A town is inside a
county, and its voters also vote in that county's elections. Every local election
has been in November since 2022, even where an older statute or charter still says
May. Parties can nominate local candidates, but no local race shows a party label
on the ballot.

## Legislative calendar

Next regular session: convenes 13 January 2027 (the second Wednesday in January,
Va. Const. art. IV, § 6). A session in an odd-numbered year is limited to 30 days
and one in an even-numbered year to 60, and either can be extended by up to 30
days with two-thirds of each house (art. IV, § 6). During the session the governor
has seven days to act on a bill. For bills that reach the governor with fewer than
seven days left, the governor has 30 days after adjournment to sign, veto or send
back amendments (art. V, § 6(b), (c)). The General Assembly then reconvenes on the
sixth Wednesday after adjournment, for three days unless extended by up to seven
more, to take up only those vetoes and amendments (art. IV, § 6). A bill sent back
to the governor from the reconvened session becomes law without a signature if the
governor does not act within 30 days after that session adjourns (art. V, § 6(c)).
New laws from a regular session take effect on 1 July unless the act sets a later
date (art. IV, § 13; Va. Code § 1-214).

Re-check this doc: July 2027, when the session's laws take effect and after the
last day for the governor to act on bills returned from the reconvened session.
Also re-check after the 3 November 2026 election: several voter registration
sections in Title 24.2 have two versions, one of which takes effect only if a
condition in Acts 2026, chapters 992 and 1081, is met. Last researched: October 2026.
Reviewed by Emily: 2 November 2026.

## How elections work in Virginia

Safe on any Virginia page, at the tier named.

### Election days

**Every local election is in November.** Since 1 January 2022, elections for
mayor, for any county, city or town governing body and for any elected school
board are held at the November general election, with terms starting 1 January.
The law says this applies whatever a charter or any other law says.

*Va. Code § 15.2-1400(E) · statutory · read in statute*

**Watch out:** older sections still describe May city and town elections and a
March primary for them (§§ 24.2-222(B), 24.2-515), and the definition of "general
election" still names the first Tuesday in May (§ 24.2-101). Section 15.2-1400(E)
overrides all of them. Never write that a Virginia city or town votes in May or in
the spring.

*Va. Code §§ 24.2-222(B), 24.2-101 · statutory · read in statute*

**Counties** elect their boards of supervisors every four years, counting from
November 1995, for four-year terms. That puts them in odd-numbered years. A county
may instead stagger its board so that about half
the seats are up every two years, by ordinance or by a voter petition and
referendum.

*Va. Code §§ 24.2-218(A), 24.2-219(A) · usual case · read in statute*

**Constitutional officers** (below) are elected on fixed four-year cycles: in
counties counting from November 1995 and in cities from November 1997, unless a
city's charter says otherwise. Circuit court clerks serve eight years. Where a
county and a city share one of these officers, the city votes on the county's
schedule.

*Va. Const. art. VII, § 4; Va. Code § 24.2-217 · usual case · read in statute*

**Cities and towns** elect their councils, and their mayors where the charter
provides for an elected mayor, for the terms set in their charters. A council
chooses its November cycle by ordinance, so one city may vote in even years and
its neighbour in odd years.

*Va. Code §§ 24.2-222(A), 24.2-222.1(A) · varies by place · read in statute*

**Watch out:** never state the year a city or town votes, or how long its terms
are, unless race data gives it.

**School boards** that are elected vote at the same election as the governing body
of their county, city or town, and serve the same terms (see School boards, below).

*Va. Code §§ 22.1-57.3(A)-(B), 24.2-223 · statutory · read in statute*

**Soil and water conservation district directors** are elected only at the
November general election every four years, counting from 2003, which puts them on
the county cycle. A district covering one county or city elects three directors,
and one covering several elects two from each county or city. The state soil and
water board appoints the remaining members.

*Va. Code §§ 10.1-515, 10.1-523(D), 10.1-527 · statutory · read in statute*

**Can a place move its own election date?** Not out of November. A city or town
council can pick which November cycle it uses, but the month is fixed by state law
for every locality. County elections follow the state's four-year cycle.

*Va. Code §§ 15.2-1400(E), 24.2-222.1(A), 24.2-218(A) · statutory · read in statute*

### Primary type

Virginia voters do not register by party: the registration form asks for no party.
Any registered voter may vote in a party primary, but only in one party's primary
on the same day. Primaries for November offices are on the third Tuesday in June.

*Va. Code §§ 24.2-418, 24.2-515, 24.2-530 · statutory · read in statute*

A party does not have to hold a primary. The local party committee for a county,
city, town or district office chooses how it nominates: a state-run primary or a
method the party runs itself, such as a convention or a party-run primary. There
is one limit: if the party's incumbent was nominated in a primary and then won, the
party must use a primary again unless the incumbent agrees to another method.

*Va. Code § 24.2-509 · statutory · read in statute*

The candidate with the most votes wins a primary. There is no primary runoff. A
candidate who loses a primary may not then appear on the November ballot for the
same office.

*Va. Code §§ 24.2-520, 24.2-532 · statutory · read in statute*

**Watch out:** do not write that a local race "will have a primary". Whether a
party nominates by primary is the party's choice each time. Take it from race data.

### Partisanship

The rule that matters most: **party labels appear on the ballot only for federal,
statewide and General Assembly offices.** County, city, town and school board
candidates appear with no party name, even when a party nominated them.

*Va. Code § 24.2-613(B) · statutory · read in statute*

By type of local government:

- **Counties** (board of supervisors and constitutional officers): parties may
  nominate, and often do. No label on the ballot.
- **Independent cities** (council, mayor and constitutional officers): parties may
  nominate. No label on the ballot.
- **Towns** (council and mayor): parties may nominate. No label on the ballot.
- **Elected school boards:** no party nominations at all. Every candidate gets on
  the ballot by petition.
- **Soil and water district directors:** candidates file nominating petitions with
  the general registrar.

*Va. Code §§ 24.2-509(A), 24.2-613(B), 22.1-57.3(E), 10.1-523(A) · statutory · read in statute*

**Watch out:** do not call a county, city or town race "nonpartisan". The ballot
has no labels, but parties can and do nominate. Say the ballot carries no party
labels. School board races are the one local office where the law bars party
nominations.

### Winning an election

The candidate with the most votes wins. There is no runoff. A tie for a local
office is broken by lot by the electoral board.

*Va. Code §§ 24.2-673(A), 24.2-674 · statutory · read in statute*

A county, city or town governing body may choose, by majority vote, to elect its
own members by ranked choice voting. Where it does, results are counted in rounds.

*Va. Code § 24.2-673.1(B) · varies by place · read in statute*

**Watch out:** do not describe how a race will be counted unless race data says it
uses ranked choice voting.

### Running as an independent

A candidate for a local office who is not a party nominee files a declaration of
candidacy with the general registrar where they live, plus a petition signed by
qualified voters who are registered and entitled to vote for that office. Each
signature must be witnessed by someone who is not a minor and not a felon whose
voting rights have not been restored. Candidates for council or school board in a
town with fewer than 1,500 registered voters need no petition. Someone who lost a
primary for the office cannot run for it as an independent in the same year.

*Va. Code §§ 24.2-101, 24.2-505(C), 24.2-506(A), 24.2-520 · statutory · read in statute*

**Watch out:** an independent's name appears on a local ballot with no label at
all. The word "Independent" is printed only for federal, statewide and General
Assembly races.

## County government

Our data has 133 county-level pages: 95 counties and 38 independent cities. The
cities are covered under City and town government, below.

There is no home rule. The Constitution has the General Assembly provide for every
county, city and town by general law, and it may grant one place a charter by
special act, which needs two-thirds of each house. A charter is granted or amended
only by the General Assembly, after a local election or public hearing asks for it.

*Va. Const. art. VII, §§ 1, 2; Va. Code §§ 15.2-200, 15.2-201 · statutory · read in statute*

Every county is governed by a **board of supervisors** of 3 to 11 members, elected
by district or at large as the county decides by ordinance. A supervisor elected
from a district is elected by that district's voters only. The board normally picks
its own chair from its members. Where the voters have chosen to elect the chair
at large, the chair is a separate race; our data shows one in 10 counties,
including Fairfax, Loudoun and Prince William.

*Va. Code §§ 15.2-102, 15.2-1400(B), (F), 15.2-1422, 24.2-304.1(A) · varies by place · read in statute*

From elections after 1 July 2026, any locality of 400,000 people or more must elect
its governing body from single-member districts, though the presiding officer may
still be elected at large.

*Va. Code § 15.2-1400(G) · statutory · read in statute*

**Optional forms.** A county can adopt one of five optional forms of government,
only by referendum. They change the board's name, size or chair:

- **County board form:** one member elected at large plus one per district.
- **County executive form:** 3 to 9 supervisors; voters may choose by referendum to
  elect the chair at large.
- **County manager form:** 3 to 9 supervisors, plus one elected at large if the
  voters chose that in the referendum.
- **Urban county executive form:** one supervisor per district plus a county
  chairman elected by all the county's voters.
- **County manager plan:** a five-member **county board** that elects its chair
  every year. The Code's chapter on this plan includes a section written for
  Arlington County.

*Va. Code §§ 15.2-301(A), 15.2-402(B), 15.2-502(A), 15.2-503, 15.2-602, 15.2-700, 15.2-702, 15.2-709.1, 15.2-802 · varies by place · read in statute*

**Watch out:** in Arlington the governing body is the County Board, not a board of
supervisors.

**Constitutional officers.** The Constitution requires every county and every city
to elect five officers, for four-year terms except the clerk:

- a **sheriff**,
- a **Commonwealth's attorney** (the local prosecutor),
- a **treasurer**,
- a **commissioner of the revenue**,
- a **clerk of the circuit court**, for eight years.

A county or city can share these officers with a neighbour, or a form of government
can drop some of them, but only with the approval of local voters. Our data has
these races in almost every county and in most cities.

*Va. Const. art. VII, § 4; Va. Code §§ 15.2-1600(A), 15.2-1602 · usual case · read in statute*

**Watch out:** Virginia has no district attorney. Our data labels the Commonwealth's
attorney "district attorney". Always write "Commonwealth's attorney".

### Townships

Virginia has no townships. The only general local governments are counties, cities
and towns. Counties are divided into magisterial or election districts, which elect
supervisors but are not governments.

*Va. Code §§ 15.2-102, 15.2-502(A) · statutory · read in statute*

## City and town government

Virginia has two kinds of municipality, and the difference is not size:

- A **city** is independent. It has 5,000 people or more (or was a city before
  1971), belongs to no county, and elects its own constitutional officers.
- A **town** has 1,000 people or more (or was a town before 1971) and sits inside
  one or more counties. Its residents vote in the county's elections and are
  served by the county's constitutional officers.

*Va. Const. art. VII, §§ 1, 4 · statutory · read in statute*

Class does not follow population. A town stays a town as it grows. It becomes a
city only by court order, and only with at least 5,000 people. Until July 2032 at
the latest, no new city charter can be granted except for a city formed by
consolidation. A city can also give up city status and become a town.

*Va. Code §§ 15.2-3201, 15.2-3800, 15.2-3807(A), 15.2-4100 · statutory · read in statute*

**Watch out:** the same name can be a city and a county that are entirely separate
governments. Richmond city and Richmond County, Fairfax city and Fairfax County,
Franklin city and Franklin County, and Roanoke city and Roanoke County are four
pairs in our data. James City County and Charles City County are counties, not
cities. Always take the place type from the page.

### What a city or town elects

Every city and town elects a **council** of 3 to 11 members, and a **mayor** if its
charter provides for an elected one. Otherwise the council chooses a mayor from its
own members. Either way, the mayor presides, heads the city or town for official
purposes, and has a vote but no veto. Our data has a mayor race in 19 of the 38
cities and most towns. A few towns also elect a town recorder.

*Va. Code §§ 15.2-1400(B), 15.2-1422, 15.2-1423, 24.2-222(A) · varies by place · read in statute*

**Watch out:** if a city or town page has no mayor race, the council may choose the
mayor. Do not write that voters elect a mayor unless race data has one.

### Home rule and charters

There is no home rule threshold. Charters are granted and amended by the General
Assembly, and cities and towns automatically hold a set of uniform charter
powers. A council decides by ordinance whether members are elected at large, by
ward, or both, and picks its November cycle. Council size (within 3 to 11) and
terms are set by the charter or other state law, which only the General Assembly
can change. No charter can move an election out of November.

*Va. Code §§ 15.2-200, 15.2-204, 15.2-1400(A), (B), (E), 24.2-222(A), 24.2-222.1(A), 24.2-304.1(A) · statutory · read in statute*

## School boards

The default is an **appointed** school board: the city or town council or the
county board of supervisors appoints it, and some counties use a school board
selection commission. Voters can switch to an **elected** board by petition and
referendum, and switch back the same way, with no new referendum for four years
afterwards. Elected members come from the governing body's districts, at large, or
both, and some elected boards also elect a tie breaker. No school board employee
may sit on the board that employs them.

*Va. Const. art. VIII, § 7; Va. Code §§ 22.1-35, 22.1-57.2, 22.1-57.3(B), (G), (H), 22.1-57.4, 22.1-57.5 · varies by place · read in statute*

Our data has 106 school division pages, named for their county or city
(`va/fairfax-county-public-schools`, `va/richmond-city-public-schools`) or, in two
cases, a town (`va/colonial-beach-town-public-schools`,
`va/west-point-town-public-schools`). Williamsburg's school board members are
appointed under a section of their own.

*Va. Code § 22.1-57.3:2.1 · statutory · read in statute*

**Watch out:** never say a Virginia school board is elected or appointed unless
race data shows a school board race.

## Metro and major-place exceptions

The biggest exceptions are structural: the 38 independent cities, and the counties
with optional forms. Some of our largest localities:

`va/fairfax-county`, `va/prince-william-county`, `va/loudoun-county`,
`va/virginia-beach-city`, `va/chesterfield-county`, `va/henrico-county`,
`va/chesapeake-city`, `va/arlington-county`, `va/norfolk-city`,
`va/richmond-city`, `va/newport-news-city`, `va/alexandria-city`

For each, take the election cycle, the district map and whether the chair or mayor
is elected at large from race data. Our data has a separate chair race in
Fairfax, Loudoun and Prince William counties. Arlington has a five-member County
Board.

### Data issues

These are problems in our data, noted for the data team. Never write copy around
them.

- `va/fairfax-county/belle-haven` holds a town mayor, council and recorder. The
  Fairfax County Belle Haven is not a town; the town of Belle Haven is on the
  Eastern Shore, in Accomack County.
- `va/bland-county/district-1` to `district-4` are filed as towns but hold only
  school board seats for Bland County's election districts.
- Our labels give independent cities county offices ("county legislature",
  "county executive"), give towns city offices, and call the Commonwealth's
  attorney a "district attorney".

### Larger towns

Towns can be large. `va/loudoun-county/leesburg`, `va/montgomery-county/blacksburg`
and `va/fairfax-county/herndon` are towns, not cities. Copy for a town page must
say it is in the county on its page, and that the county elects the sheriff and
other constitutional officers for its residents.

## Writing rules

These are the ways Virginia copy goes visibly wrong.

1. **A city is not in a county.** Never write that Richmond, Norfolk or any other
   independent city lies in a county. On a town page, the town is in the county
   on the page.
2. **Never infer a county from a place name.** Three of our Virginia town pages
   share a name with a different Virginia county: Buchanan is in Botetourt County,
   Shenandoah in Page County, and Washington in Rappahannock County. Same-name
   cities and counties (Richmond, Fairfax, Franklin, Roanoke) are separate places.
   Always take the county from the page data.
3. Never name an officeholder or a candidate.
4. **Every local election is in November.** Never write May or spring. Do not state
   whether a city or town votes in even or odd years unless race data gives the date.
5. **No local race shows a party label on the ballot,** but do not call county,
   city or town races nonpartisan. School board races are the ones where parties
   cannot nominate.
6. Say **Commonwealth's attorney**, never district attorney.
7. Say **board of supervisors** for a county, **County Board** for Arlington, and
   **council** for a city or town. Our labels call a city council a "county
   legislature" and a city mayor a "county executive". Write council and mayor.
8. Say **town** for a town. Our labels call town offices "city" offices.
9. Do not say a school board is elected or appointed unless race data shows it.
10. Avoid anything that changes within a year: who has filed, whether a race is
    contested, filing deadlines, current ballot measures.

## Sources

- **Code of Virginia and Constitution**, from the Division of Legislative Services
  at law.lis.virginia.gov. Whole titles download in one request:
  `https://law.lis.virginia.gov/vacodefull/title<n>/` (Title 15.2 is about 4 MB),
  and whole chapters at `https://law.lis.virginia.gov/vacodefull/title<n>/chapter<m>/`.
  The full Constitution is at `https://law.lis.virginia.gov/constitutionfull/`.
  Single sections are at `.../vacode/title<n>/chapter<m>/section<s>/`. Plain
  scripts can fetch all of these with no terms, sign-in or bot check; the ledger
  cites chapter pages so the checker makes about 20 requests. Each section ends
  with its session-law history, and sections with a pending change show each
  version with its effective date.
- **Read for currency:** every cited section's history. 2026 acts touched
  § 15.2-1400 (single-member districts for localities of 400,000 or more), the
  ranked choice voting section § 24.2-673.1, and the at-large and district section
  § 24.2-304.1. Several voter registration sections have versions that depend on a
  condition in Acts 2026, chapters 992 and 1081. A 2021 special session act made the
  move to November elections (§ 15.2-1400(E)).
- **Page data:** goodparty.org sitemap shard 47, 28 October 2026, and
  `research/pages-by-state.csv` and `research/places-named-after-another-county.json`
  (27 October 2026).

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
