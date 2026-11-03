# Alaska: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Alaska so you do not have to research the same ground
on every page. It is not an authority: per-page specifics, like which offices are
actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/alaska.json`](./research/alaska.json).

**The one thing to know first:** Alaska has **no counties**. Local government is
boroughs and cities. Much of the state is in no organized borough at all: it forms
one "unorganized borough" with no local government of its own. Local elections
are run by each borough and city under its own ordinances, usually on the first
Tuesday of October **every year**, not in November. The state's top-four primary
and ranked-choice general election apply to state and federal offices, not to
borough, city or school board races. Most of our Alaska pages (52 of 84) are
school districts.

## Legislative calendar

Next regular session: convenes 19 January 2027 (the third Tuesday in January,
every year, AS 24.05.090; the constitution lets law set the date, Alaska Const.
art. II, § 8). The constitution caps a regular session at 120 days (with one
10-day extension), and a statute sets a 90-day limit. A bill the governor neither
signs nor vetoes becomes law after 15 days (Sundays excepted) while the
Legislature is in session, or 20 days (Sundays excepted) after delivery once it
has adjourned (art. II, § 17). Bills are often delivered to the governor over the
weeks after adjournment, so the last ones are settled in early summer.

New laws take effect ninety days after enactment unless two-thirds of each house
set another date (Alaska Const. art. II, § 18; AS 01.10.070).

Re-check this doc: June 2027, including the result of any 2026 vote on the
state primary system and the 2026 session laws. Last researched: October 2026.
Reviewed by Emily: 3 November 2026.

## How elections work in Alaska

Safe on any Alaska page, at the tier named.

### Who runs local elections

All local government powers are vested in boroughs and cities. Each borough or
city **sets its own election rules** by ordinance, including how candidates are
nominated (a declaration, a petition of no more than 10 voters, or both).

*Alaska Const. art. X, § 2; AS 29.26.010(a), 29.26.020(a) · statutory · read in statute*

### Election days

**Boroughs, cities and their school boards** hold their regular election on the
**first Tuesday of October, every year**, unless an ordinance sets a different
date or interval, and any municipality may do so. Take the date from race data.

*AS 29.26.040 · usual case · read in statute*

**Regional school boards** (in the unorganized borough) are elected every year on
the first Tuesday in October, supervised by the state Division of Elections.

*AS 14.08.071(b) · statutory · read in statute*

**State and federal offices** are elected in November of even-numbered years,
after an August primary (third Tuesday in August). These are not local races.

*AS 15.15.020, 15.25.020 · statutory · read in statute*

**Watch out:** never put an Alaska borough, city or school board race on the
November ballot by default, and never say they happen every other year. The
default is every October.

### Primaries and partisanship

**Borough, city and school board races have no party primary in state law.**
Candidates are nominated by declaration or petition under local ordinance. Do not
describe a party nomination for these offices.

*AS 29.26.020(a) · statutory · read in statute*

**State offices** use a different system: a top-four primary open to every voter,
which only narrows the field and does not choose party nominees, then a
ranked-choice general election. This applies to state executive, legislative and
congressional offices only.

*AS 15.15.025, 15.25.010, 15.15.350(c) · statutory · read in statute*

**Watch out:** do not describe Alaska's top-four primary or ranked-choice voting
on a borough, city or school board page. They do not apply there.

### Winning an election

**Runoffs are the default for local races.** Unless an ordinance says otherwise,
a runoff is held when no candidate for mayor, or for a designated council,
assembly or school board seat, gets over 40 percent. The runoff is between the top
two, within three weeks after certification. Any municipality may change this by
ordinance, and a regional school board may opt out, so never assume a runoff
happened.

*AS 29.26.060(a), (c), 14.08.071(b) · varies by place · read in statute*

## Borough government (instead of counties)

The whole state is divided into boroughs, organized or unorganized. Areas outside
any organized borough form a single **unorganized borough**, where the Legislature
provides services; it has no borough government or assembly. Our data
has 19 borough pages and no page for the unorganized borough.

*Alaska Const. art. X, §§ 3, 6; AS 29.03.010 · statutory · read in statute*

An organized borough is governed by an **assembly**, whose size and districts are
set by its incorporation petition, charter or ordinance. Members usually serve
three-year terms (up to four by charter or ordinance). Borough mayors are elected
at large, usually for three years (up to four by ordinance).

*Alaska Const. art. X, § 4; AS 29.20.050(a), 29.20.060(b), 29.20.150(a), 29.20.230(a) · usual case · read in statute*

Our pages list borough offices under county-style labels ("county executive",
"county legislature"). In copy, say **borough mayor** and **borough assembly**.

### Borough classes and home rule

Borough types are **home rule** (chartered), **unified municipalities**, and
general law **first, second and third class** boroughs. No new third class borough may be created.

*AS 29.04.010, 29.04.030, 29.05.031(b) · statutory · read in statute*

Voters of a first class borough or city may adopt a **home rule charter**, and a
home rule borough or city may exercise any legislative power not prohibited by law
or charter. Only a listed set of state municipal statutes binds home rule
governments, so most structure (assembly size, terms, election dates, runoffs)
varies by place.

*Alaska Const. art. X, §§ 9, 11; AS 29.10.010(a), 29.10.200 · varies by place · read in statute*

## City government

Cities are part of the borough they sit in, and each is governed by a **council**.

*Alaska Const. art. X, §§ 7, 8 · statutory · read in statute*

- **Home rule city:** has adopted a charter.
- **First class city:** at least 400 permanent residents at incorporation; a
  council of six elected at large; a mayor elected at large, usually for three
  years.
- **Second class city:** a council of seven elected at large; the mayor is chosen
  by and from the council, unless an ordinance lets voters elect the mayor from
  the council.

*AS 29.05.011, 29.20.130, 29.20.230(a)-(b), (d) · usual case · read in statute*

A city may change class by petition and vote, and may move off at-large council
elections by ordinance. Without a manager plan, the mayor is the chief
administrator.

*AS 29.04.040(a), 29.20.130, 29.20.250(a) · varies by place · read in statute*

## School districts

Every organized borough is a borough school district. A home rule or first class
city in the unorganized borough is its own city school district. The rest of the
unorganized borough is divided into **regional educational attendance areas
(REAAs)**, each with an elected regional school board of 5 to 11 members.

*AS 14.12.010, 14.08.041 · statutory · read in statute*

Borough and city school boards have five members in districts of 5,000 students
or fewer (seven by ordinance), and seven, nine or eleven in larger districts.
Members are elected at the regular municipal election for three-year terms, at
large unless voters approved another method. In a third class borough the
assembly is the school board.

*AS 14.12.030(a)-(b), 29.20.300 · usual case · read in statute*

## Metro and major-place exceptions

### Anchorage, Juneau, Sitka, Wrangell, Yakutat and Skagway

`ak/anchorage-municipality`, `ak/juneau-city-and-borough`,
`ak/sitka-city-and-borough`, `ak/wrangell-city-and-borough`,
`ak/yakutat-city-and-borough`, `ak/skagway-municipality`

Our data gives each of these one page, with borough-level races (an assembly and
a mayor) and no separate city page. Write each as a single government; do not
describe a separate city council alongside a borough assembly. Unified
municipalities and home rule boroughs run under their own charters, so their
election dates, terms and runoff rules were not read for this doc; take them from
race data.

*AS 29.04.010 · varies by place · read in statute*

### Cities inside boroughs

`ak/fairbanks-north-star-borough/fairbanks`, `ak/matanuska-susitna-borough/wasilla`,
`ak/kenai-peninsula-borough/kenai` and the other city pages

A city and its borough are separate governments with separate elections. A city
page should describe the city council and mayor; the borough page, the assembly
and borough mayor.

### Pages in the unorganized borough

School district pages such as `ak/lower-kuskokwim-school-district` or
`ak/bering-strait-school-district` cover REAAs or city districts in the
unorganized borough. There is no borough government above them. Do not mention a
borough assembly or mayor on these pages.

## Writing rules

These are the ways Alaska copy goes visibly wrong.

1. **Never say "county".** Alaska has boroughs, a unified municipality, or the
   unorganized borough. Our position labels say "county"; copy must not.
2. **Local elections are annual, usually the first Tuesday of October.** Do not
   put local races on the November ballot or describe them as every other year,
   unless race data shows it.
3. **Do not describe the top-four primary or ranked-choice voting on local
   pages.** They apply only to state and federal offices.
4. **Do not describe party nominations for local races.** Local candidates file by
   declaration or petition.
5. A local runoff may happen at 40 percent, but many municipalities have changed
   that. Do not say a runoff will or will not happen.
6. A city and the borough around it are separate governments. Pages with only
   borough-level races (Anchorage, Juneau, Sitka and similar) are one government.
7. Never name an officeholder or a candidate.
8. Avoid anything that changes within a year: who has filed, whether a race is
   contested, filing deadlines, current ballot measures.

## Sources

- **Statutes:** Alaska Legislature, whole chapters in one request:
  `https://www.akleg.gov/basis/statutes.asp?media=print&secStart=<title>.<chapter>&secEnd=<title>.<chapter>`
  (e.g. `29.20`). A single section works the same way (`secStart=29.20.050&secEnd=29.20.050`).
  The normal statutes page is a JavaScript app; the `media=print` form returns
  plain HTML to scripts. The site serves Windows-1252 text, so curly quotes and
  section signs arrive garbled; quote plain-ASCII passages only. Read: AS 01.10;
  14.08; 14.12; 15.10; 15.13; 15.15; 15.20; 15.25; 15.30; 24.05; 29.03; 29.04;
  29.05; 29.10; 29.20; 29.26.
- **Constitution:** the Lieutenant Governor's full text,
  `https://ltgov.alaska.gov/information/alaskas-constitution/`, one page. Read
  articles II and X.
- **Currency check:** the statute site labels its text "Alaska Statutes 2025".
  2026 session laws were not separately checked.
- **Page data:** goodparty.org sitemap shard 2, 28 October 2026, read in the
  in-app browser; counts from `research/pages-by-state.csv`.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
