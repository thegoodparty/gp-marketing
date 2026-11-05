# Missouri: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Missouri so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which
offices are actually on this ballot and how many seats, come from our own race
data, which always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/missouri.json`](./research/missouri.json).

**The one thing to know first:** Missouri runs two election calendars and splits
party labels by tier. County offices are partisan, nominated at the August
primary of even-numbered years and elected in November. Cities, villages,
townships, school boards and other districts elect on general municipal election
day in **April, every year**, and state law gives them no party primary. Kansas
City and St. Louis City each run their own nonpartisan top-two system under
their charters. Our Missouri data has 115 county-level pages (114 counties plus
St. Louis City), 510 district pages (almost all school districts) and 1,024
place pages, 89 of them in St. Louis County.

## Legislative calendar

Next regular session: convenes 6 January 2027 (the first Wednesday after the
first Monday in January, every year, Mo. Const. art. III, § 20). Bills still on
the calendar at 6 p.m. on the first Friday after the second Monday in May are
tabled, and the session adjourns at midnight on 30 May (art. III, § 20(a)).
After adjournment the governor has 45 days to act on bills, so they are settled
by about mid-July (art. III, § 31). Vetoes can be overridden at a veto session
that starts on the first Wednesday after the second Monday in September
(art. III, § 32).

New laws usually take effect 90 days after the session adjourns, which is
28 August, unless the act carries an emergency clause (Mo. Const. art. III,
§ 29).

Re-check this doc: September 2027, after the veto session. Last researched:
November 2026. Reviewed by Emily: 4 November 2026.

*Mo. Const. art. III, §§ 20, 20(a), 29, 31, 32 · statutory · read in statute*

## How elections work in Missouri

The timing rules below hold on any Missouri page unless a charter says
otherwise. Partisanship depends on the tier: read that section before writing
anything about party labels.

### Election days

**Cities, villages, townships, school boards and other districts** elect on
general municipal election day, the first Tuesday after the first Monday in
April. This happens **every year**, not only in odd years. Most local terms are
staggered, so part of a board is usually up each spring.

*§§ 115.121.3, 115.013 RSMo · statutory · read in statute*

**County offices** are nominated at the primary, the first Tuesday after the
first Monday in August of even-numbered years, and elected at the general
election, the first Tuesday after the first Monday in November of even-numbered
years.

*§§ 115.121.1, 115.121.2, 115.341 RSMo · statutory · read in statute*

The Election Code applies to every public election in Missouri, whatever other
law says, except elections where only property owners vote. A city or county
charter may set its own election day, and a charter that provided for a March
primary before 1999 may keep it.

*§§ 115.005, 115.123.1, 115.123.3 RSMo · statutory · read in statute*

**Watch out:** Kansas City and St. Louis City use the charter route (see Metro
exceptions). Some third class cities run a commission form with a nominating
primary in **February** unless they have dropped it (§ 78.090 RSMo). Say "the
April municipal election" only where race data agrees.

**Uncontested local races are often cancelled.** In a nonpartisan election for a
township, school board or other district, if the number of candidates equals
the number of seats, no election is held and the candidates take office. Cities
over 2,000 are excluded. A city of 2,000 or fewer can opt in by a vote, for six
years at a time. So "voters will choose" can be wrong for an uncontested seat.
Take it from race data.

*§ 115.124.1, .3 RSMo · usual case · read in statute*

**School boards.** Most districts are seven-director districts: seven members,
three-year terms, elected on the April municipal election day. Urban districts
also vote with municipal elections. A board may divide its district into
subdistricts.

*§§ 162.261.1, 162.341, 162.481.1, 162.563.2 RSMo · usual case · read in statute*

Three exceptions by statute:

- **St. Charles County** (districts mostly in a county of 400,000 to 500,000):
  from 2028, board elections move to **November of even-numbered years** with
  four-year terms, and a candidate may choose to have a party affiliation
  printed beside their name (2026 law).
- **Springfield's** district elects every year, with three-year terms.
- **Kansas City's** district elects on the Kansas City charter election date,
  with two at-large and five subdistrict directors serving four-year terms.

*§§ 162.082, 162.481.3, 162.492.2 RSMo · statutory · read in statute*

St. Louis City's district is covered under Metro exceptions.

### Primary type

A voter picks one party's ballot at the polls. A voter who wants no party ballot
can still vote on ballot questions and nonpartisan races at the primary.

*§ 115.397 RSMo · statutory · read in statute*

Missouri's registration form has an *optional* party affiliation field, and a
voter who leaves it blank is unaffiliated. Nothing in the primary law ties the
ballot a voter picks to that field.

*§§ 115.155, 115.397 RSMo · statutory · read in statute*

**Watch out:** the optional party field makes it easy to describe Missouri as a
closed-primary state. It is not. Say voters choose a party's ballot at the
primary.

### Partisanship

**County: partisan.** County candidates are nominated at the party primary on a
party ticket and run with a party label in November.

*§§ 115.339, 115.349.3 RSMo · statutory · read in statute*

**City, village, township, school board and special district: no party
primary.** The state's party nomination rules expressly do not apply to these
offices, and candidates file a declaration of candidacy with the local
government or district.

*§§ 115.308, 115.127.5 RSMo · statutory · read in statute*

Third and fourth class cities may hold a nominating primary by ordinance, but it
is the city's own primary, not a party primary.

*§§ 77.040, 79.035.1 RSMo · usual case · read in statute*

**The one statutory exception:** in St. Charles County, school board candidates
may have their party affiliation printed on the ballot.

*§ 162.082.4 RSMo · statutory · read in statute*

**Watch out:** "local races here are typically nonpartisan" is safe on a city,
township or school page, except a St. Charles County school page. "Missouri
local elections are nonpartisan" is wrong on every county page.

### Winning

The candidate with the most votes wins. That holds for the party primary, and
the city and school laws read for this doc elect by most votes. A tie goes to a
special election, or is decided by lot if the tied candidates agree.

*§§ 115.343, 115.517.3, .4, 77.030.1, 79.060.1, 162.492.4 RSMo · usual case · read in statute*

**Ranked choice voting is banned by the constitution.** Each voter gets one
vote per open seat and may not rank candidates. The only carve-out is
nonpartisan municipal elections in a city whose ordinance in effect on
5 November 2024 allowed more than one vote per candidate. That describes
St. Louis City's approval voting.

*Mo. Const. art. VIII, § 3.2 · statutory · read in statute*

**Watch out:** Kansas City and St. Louis City both use a top-two primary and
general (see Metro exceptions). Do not write "no runoff" or "one round" on
those pages.

### Running as an independent

For **county office**, an independent files a nominating petition with the
county election authority and goes straight onto the November ballot. Signers
must be registered voters of the county and district, and each petition page
holds signatures from one county. No other bar on signers appears in the
statute: signing does not commit a voter to the candidate.

*§§ 115.321.1, .5, 115.325 RSMo · statutory · read in statute*

A candidate cannot be both a party candidate and an independent for the same
office and term without withdrawing one filing. A candidate who loses a party
primary cannot then run as a write-in for the same office in November.

*§§ 115.351, 115.453(4) RSMo · statutory · read in statute*

For **city, township, school and district** offices there is no party
nomination, so every candidate files directly and "independent" is not a
separate route.

*§ 115.308 RSMo · statutory · read in statute*

## County government

Missouri has 114 counties, plus St. Louis City, which is both a city and a
county and belongs to no county (see Metro exceptions).

*Mo. Const. art. VI, § 31 · statutory · read in statute*

### County commission

A county without a charter is run by a three-member **county commission**: a
presiding commissioner elected countywide, and two commissioners each elected
from one of the county's two districts. All serve four-year terms. Voters may
reduce the commission to one or two members.

*Mo. Const. art. VI, § 7; §§ 49.010, 49.020 RSMo · usual case · read in statute*

Counties also elect a **county clerk, assessor, treasurer, prosecuting attorney,
sheriff and public administrator**, all partisan, four-year terms.

*§§ 51.020, 53.010, 54.010, 56.010, 57.010, 473.730 RSMo · usual case · read in statute*

Other offices depend on the county:

- A **collector of revenue** is elected except in township counties, which elect
  a combined **collector-treasurer** instead.
- A separate **recorder of deeds** is elected in larger counties. In smaller
  counties the circuit clerk is also recorder.
- A **coroner** is elected only in counties that still have one.

*§§ 52.010, 54.010, 58.020, 59.020 RSMo · varies by place · read in statute*

Our data reflects this: some county pages carry a "collector/treasurer" or a
"circuit clerk/recorder" race instead of separate offices. Take the offices
from race data.

### County classes

Counties are sorted into classes by assessed valuation, and the thresholds rise
with inflation every year. A county can change class between copy
regenerations, so never give a county's class.

*§ 48.020.1, .2 RSMo · statutory · read in statute*

### Charter counties

A county of more than 85,000 people, or one that has been first class for two
years, may adopt its own charter. A charter county sits outside the class
system, and its charter sets its form of government and which county offices
are elected. Since August 2026 a charter must keep the assessor elected. State
law still governs how its elections are run.

*Mo. Const. art. VI, §§ 18(a), 18(b), 18(e); § 115.005 RSMo · statutory · read in statute*

In our data the county pages for **St. Louis County, Jackson County, St. Charles
County and Jefferson County** carry a county executive race, so the commission
description above does not apply there. Several also have no clerk, recorder,
collector or sheriff race. **Clay County's** page has no clerk, recorder or
collector race either. On all of these, take the offices from race data.

### Townships

A third or fourth class county may adopt **township organization** by a
countywide vote, and can drop it the same way. In those counties each township
elects a **trustee** (who is also the township treasurer), a **clerk** and **two
township board members**, at the April municipal election and without party
labels.

*§§ 65.010, 65.020, 65.110.1, 115.013(20), 115.121.3, 115.308 RSMo · statutory · read in statute*

Our data has 116 place pages with "township" in the slug, across 23 counties.
**Do not decide from the slug that a page is a township government.** 11 of
them carry only fire, ambulance, road or sewer district boards (see Data
issues). Decide from the offices on the page: trustee, clerk and board member
mean a township.

## City, town and village government

Missouri has three general classes: villages, fourth class cities and third
class cities. Larger cities may adopt a home rule charter, and a handful of old
cities still run under charters granted by the legislature before 1875.

*Mo. Const. art. VI, §§ 15, 19; §§ 72.030, 72.040, 72.050, 81.010 RSMo · statutory · read in statute*

### Village

A town of under 500 people is a village unless it has chosen to become a city. A
village is governed by a **board of trustees** of five members, or nine in a
village over 2,500 if voters choose. Trustees serve two-year terms.

A village has no mayor and no aldermen, so use "board of trustees" and not city
vocabulary.

*§§ 72.050.1, 80.040 RSMo · usual case · read in statute*

### Fourth class city

For places of 500 to 3,000 people that choose this class. Elects a **mayor** and
a **board of aldermen**. The city has at least two wards with two aldermen each,
and each ward elects one alderman every year. A city of 1,000 or fewer may elect
aldermen at large instead. Terms are two years, but voters can approve a
mayoral term of up to four years and four-year terms for aldermen. Some also
elect a marshal and collector, or appoint them after a vote.

*§§ 72.040.1, 79.050, 79.060 RSMo · usual case · read in statute*

### Third class city

For places of 3,000 or more that choose this class. There is no upper limit. By
default it elects a **mayor** for four years and a **city council** by ward,
with at least four wards. Council members serve two years unless voters have
extended terms to four. The council can make most other offices appointive.

*§§ 72.030, 77.030, 77.370 RSMo · usual case · read in statute*

A third class city may instead adopt the **city manager** form by vote: five
council members with three-year terms and an appointed manager.

*§§ 78.430, 78.460 RSMo · varies by place · read in statute*

### Charter city (home rule)

Any city of more than 5,000 people may adopt its own charter. A charter city
has all powers the legislature could grant unless its charter or a statute
limits them, and the legislature cannot create or fix its municipal offices. So
council size, districts or at-large seats, terms and which offices are elected
are all set locally.

*Mo. Const. art. VI, §§ 19, 19(a), 22; § 82.010 RSMo · statutory · read in statute*

**Does home rule reach elections?** Partly. The Election Code still governs
every public election, and the ranked choice ban applies to charter cities too.
But a charter may set the election day and filing dates, and the two largest
charter cities use their charters to run nonpartisan top-two elections.

*§§ 115.005, 115.123.1, 115.127.5 RSMo; Mo. Const. art. VIII, § 3.2 · statutory · read in statute*

### Class does not follow population

A Missouri place changes class only by a vote of its residents, and a village
that becomes a fourth class city keeps that class at its option. Never work out
a city's class from its population, and never say which class a city is unless
we have been told.

*§§ 72.050.2, 72.070 RSMo · statutory · read in statute*

## Metro and major-place exceptions

### St. Louis City

`mo/st-louis-city`

St. Louis is an **independent city**: both a city and a county, belonging to no
county. It sets its county offices through its city charter rather than a county
charter. There is no county commission above it. Our data has no separate city
page for St. Louis, and the city's races sit on this county-level page.

*Mo. Const. art. VI, §§ 31, 32(a) · statutory · read in statute*

City elections are in April every two years. The mayor, comptroller, president
of the board of aldermen and aldermen are elected in **nonpartisan, top-two**
elections. In the primary, voters may vote for as many candidates as they
approve of, and the two with the most votes advance. Candidates declare no party
affiliation. The city has 14 wards, and the mayor and comptroller serve four
years.

*St. Louis City Charter art. II, §§ 1, 2, 9; St. Louis Revised Code §§ 2.08.450, 2.08.460, 2.08.490, 2.12.010 · statutory · read in city charter*

The constitutional ban on more than one vote per candidate exempts this system,
because the ordinance was in effect on 5 November 2024.

*Mo. Const. art. VIII, § 3.2 · statutory · read in statute*

**Watch out:** the city's election ordinances were amended in October 2025
(Ordinance 72075), and the published code had not yet folded that in when this
was researched. Let race data decide the details.

St. Louis City is its own school district, with a board elected citywide for
four-year terms at municipal elections.

*§§ 162.571, 162.581, 162.601 RSMo · statutory · read in statute*

**Never** write about a county government above St. Louis City, and never
confuse it with St. Louis County, a separate place with its own government.

### St. Louis County

`mo/st-louis-county`

A charter county with a county executive, per our race data. It holds 89 of our
Missouri city pages, so county copy should not imply the county governs those
cities directly.

### Jackson, St. Charles and Jefferson counties

`mo/jackson-county`, `mo/st-charles-county`, `mo/jefferson-county`

Each carries a county executive race in our data, so the three-member
commission template is wrong. St. Charles County's school boards move to
November of even-numbered years from 2028 and may show party labels (see
Election days).

### Kansas City

`mo/jackson-county/kansas-city`

A home rule charter city that spans more than one county, though our page files
it under Jackson County. Avoid phrasing that ties it to a single county.

*§ 162.492.2 RSMo · statutory · read in statute*

Its council has 13 members including the mayor: six members elected at large
(one living in each of six districts) and six elected by district. City
elections are **nonpartisan** and come **every four years**: a primary on the
first Tuesday after the first Monday in April, then a general election eleven
weeks later between the top two for each seat. Nominating petitions carry no
party designation.

*Kansas City Charter §§ 201, 602(c)(3), 603, 604(a), 605 · statutory · read in city charter*

**Watch out:** Kansas City city offices are not on the ballot every April, and
its general election is not in April. Never describe the third or fourth class
templates here.

### Springfield, Independence, Columbia and other large cities

`mo/greene-county/springfield`, `mo/jackson-county/independence`,
`mo/boone-county/columbia`

Any city over 5,000 may have a charter that sets its own council and offices.
Do not apply the third or fourth class templates to a large city unless race
data matches them. Springfield's school district elects every year (see
Election days).

## Data issues

Logged for the data team. Never write copy around them. All checked on
goodparty.org on 4 November 2026.

- `mo/washington-county/lees-summit` files Lee's Summit under Washington County.
  The city is in Jackson County.
- `mo/wright-city-r-ii-of-warren-county` is a school district page whose slug
  ends in "-county", so it is counted as a county page (our data shows 116
  Missouri county pages; 115 are real).
- 28 county joint offices have an office name where the place should be, for
  example `mo/bates-county/county-tax-collector/position/treasurer-joint`. The
  "place" page above each one returns 404. 18 are collector-treasurer races and
  10 are circuit clerk-recorder races.
- 11 pages with "township" in the slug carry only special district boards, not
  township offices: `big-river-township`, `rock-township`, `joachim-township`,
  `high-ridge-township` and `valle-township` in Jefferson County;
  `fort-osage-township` and `prairie-township` in Jackson County;
  `meramec-township` and `calvey-township` in Franklin County;
  `hudson-township` in Macon County; and `red-oak-township` in Lawrence County.
- Three city pages carry the school board of a district named after a town in
  another county: `mo/polk-county/goodnight` (Seneca R-7; our Seneca page is in
  Newton County), `mo/newton-county/grand-falls-plaza` (Sheldon R-8; Sheldon is
  in Vernon County) and `mo/scotland-county/granger` (Slater; Slater is in
  Saline County).
- `mo/morgan-county/versailles` and `mo/st-louis-county/mackenzie` have no
  offices.
- Township office labels ("township board head", "township trustee / township
  council") do not match the statute's trustee, clerk and two board members.

No Census twin pages (a `-city` or `-town` copy of another page) were found in
Missouri.

## Writing rules

These are the ways Missouri copy goes visibly wrong.

1. **Never infer a county from a place name.** 30 Missouri places share a name
   with a Missouri county and 20 of them sit in a *different* county. Butler is
   in Bates County. Jackson is in Cape Girardeau County. Clinton is in Henry
   County. Oregon is in Holt County, and Holt is in Clay County. The full list is
   in
   [`research/places-named-after-another-county.json`](./research/places-named-after-another-county.json).
   Always take the county from the page data.
2. **Use the right calendar for the tier.** County offices: August primary and
   November general of even-numbered years. Cities, villages, townships, school
   boards and districts: April, every year. Kansas City, St. Louis City and
   St. Charles County schools differ.
3. **Do not call local races nonpartisan without naming the tier.** County races
   are partisan. City, township, school and district races have no party
   primary, except that St. Charles County school candidates may show a party.
4. **Never decide from the slug alone that a page is a township.** Decide from
   the offices on the page.
5. Do not call Missouri primaries closed. Voters choose a party's ballot at the
   primary.
6. Do not mention ranked choice voting as an option anywhere in Missouri. Do not
   describe Kansas City or St. Louis City as "most votes wins in one round".
7. Do not state which class a city is unless it is in our data, and never guess
   it from population. Do not call a village's board a city council.
8. Do not state a term length as fixed. Missouri cities can lengthen terms by
   a vote of the people.
9. Do not give a county's class number, and do not describe a county commission
   on a page whose race data shows a county executive.
10. Never name an officeholder or a candidate.
11. Avoid anything that changes within a year: who has filed, whether a race is
    contested, filing deadlines, current ballot measures.

## Sources

- **Statutes and constitution:** Missouri Revisor of Statutes. Bulk recipe: the
  chapter page `https://revisor.mo.gov/main/OneChapter.aspx?chapter=<n>` lists
  every section with its effective date (so a grep for `2025)` or `2026)` finds
  recent changes), and each section is plain HTML at
  `https://revisor.mo.gov/main/OneSection.aspx?section=<n>` with its full history.
  Constitution sections use `section=<article>%20%20%20%20<section>&constit=y`
  (four spaces, e.g. `VIII%20%20%20%203`); the list is on
  `https://revisor.mo.gov/main/Home.aspx?constit=y`. Plain requests with a
  browser user agent at 0.3 s spacing: about 1,000 requests, no rate limit or
  certificate problem. Read: RSMo chapters 48, 49, 65, 72, 77, 78, 79, 80, 81
  and 115 in full; 82.010-82.340; 162.011-162.492 and 162.563-162.621;
  51.020, 52.010, 53.010, 54.010, 56.010, 57.010, 58.020, 59.020, 473.730;
  Mo. Const. art. III, §§ 20-32; art. VI, §§ 1-33; art. VIII.
- **Currency check:** every cited section's history. 2026 changes that touch
  this doc: § 162.082 (St. Charles County school elections and optional party
  label, S.B. 1002), §§ 162.341, 162.459, 162.481, 162.301 (same act),
  § 48.020 (county classes), § 115.453 (write-in counting), and Mo. Const.
  art. VI, § 18(b) (elected assessor in charter counties, August 2026).
- **Kansas City Charter** and **St. Louis City Charter and Revised Code
  Title 2:** read in the in-app browser on library.municode.com, which serves
  no text to scripts. These ledger entries are marked manual. The city's own
  charter PDF on stlouis-mo.gov dates from 2010 and is out of date; do not use
  it.
- **Page data:** goodparty.org sitemap shard 26, 4 November 2026, read in the
  in-app browser; `research/pages-by-state.csv` and
  `research/places-named-after-another-county.json`.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
