# Tennessee: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Tennessee so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which offices
are actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/tennessee.json`](./research/tennessee.json).

**The one thing to know first:** Tennessee splits cleanly by type of government.
County offices are elected in August of even-numbered years and can be partisan,
but only where a county party chooses to nominate. City and town elections are
nonpartisan by state law, and each city sets its own election date unless it has
moved to the August or November election. School boards could be partisan
from 2022, county by county, but only where a party opts in. Nashville, Lynchburg and
Hartsville are not cities in our data at all: each is a metropolitan government
merged with its county, and its mayor and council sit on the county page.

## Legislative calendar

Next regular session: convenes 12 January 2027 (the second Tuesday in January
after the House election, Tenn. Const. art. II, § 8). The first part is an
organizational session of up to 15 days that passes no bills; the working session
follows. The Constitution sets no end date. The governor has 10 days, Sundays
excepted, to act on a bill once it is presented; a bill that reaches the governor
around adjournment becomes law unless the governor files a veto within those 10
days (art. III, § 18). A general law takes effect 40 days after passage unless the
act says sooner (art. II, § 20), and most acts set their own date.

Re-check this doc: July 2027, or a month after the governor's last day to act on
the session's bills if the session runs late. LexisNexis marks art. VII, § 5 (the
August election day for county and judicial offices) as subject to a proposed
amendment: check its status at the re-check. Last researched: October 2026.
Reviewed by Emily: 3 November 2026.

## How elections work in Tennessee

Safe on any Tennessee page, at the tier named.

### Election days

Tennessee has two regular elections, both in even-numbered years: the **regular
August election** on the first Thursday in August, and the **regular November
election** on the Tuesday after the first Monday in November.

*Tenn. Code Ann. § 2-1-104 · statutory · read in statute*

**County offices** are elected at the August election: the county mayor, the
county commission, sheriff, trustee, register, county clerk, assessor of property,
court clerks, constables and judges. The August election is also the date the
Constitution sets for judicial and other civil officers, with terms starting
1 September.

*Tenn. Code Ann. § 2-3-202; Tenn. Const. art. VII, § 5 · statutory · read in statute*

**Party primaries for county offices**, where a party holds one, are on the first
Tuesday in May before the August election. In a presidential year a party may hold
its county primary on the presidential preference primary day instead.

*Tenn. Code Ann. § 2-13-203(e)(3) · statutory · read in statute*

**Cities and towns** hold their elections on the date their charter sets, which
can be any year and any month. Any city, including one chartered by private act,
can move its elections to the August or November general election by ordinance,
stretching current terms by up to two years to get there, and may later move back
once.

*Tenn. Code Ann. §§ 6-54-138, 6-3-104 · varies by place · read in statute*

**Watch out:** never state the month or year a Tennessee city votes. Take it from
race data.

**School boards** have four-year staggered terms. County boards are elected from
districts of roughly equal population; special school district boards are elected
as their own private act provides; city school boards may be elected the same way
as the city council.

*Tenn. Code Ann. § 49-2-201 · usual case · read in statute*

**Can a place move its own election date?** A city can, by ordinance, to the August
or November election (above). A county cannot: its offices are fixed to the August
election by the Constitution and statute.

*Tenn. Code Ann. §§ 6-54-138, 2-3-202; Tenn. Const. art. VII, § 5 · statutory · read in statute*

### Primary type

Tennessee has **no party registration**. A voter can vote in a party's primary by
being a member of that party or by declaring allegiance to it and stating an intent
to affiliate with it. A poll worker can challenge a voter on that ground, and voting
in a primary without that membership or intent is a crime under state law.

*Tenn. Code Ann. §§ 2-7-115(b), 2-7-115(c), 2-7-126 · statutory · read in statute*

**Watch out:** do not call Tennessee primaries "open" or "closed" without
qualification. Voters choose a party's ballot at the polls, but the law ties that
choice to party allegiance.

### Partisanship

Tennessee splits by type of government:

**County offices: partisan where the party chooses.** A statewide party must
nominate by primary for any office elected on a partisan basis at the August or
November election. But for county offices, a party may nominate by any method its
rules allow, or by primary, and decides county by county. If it wants a primary it
must ask the county election commission at least 180 days before qualifying. Since
a 2025 law, a county party that used another method (such as a convention or
caucus) in 2022 or 2024 may keep doing so. Where a party nominates nobody, the
county race may have only independents on the ballot.

*Tenn. Code Ann. §§ 2-13-202, 2-13-203(a), (e)(1) · varies by place · read in statute*

**Watch out:** do not write that county races in a given county have party
primaries, or that they are partisan, unless race data shows party labels.

**City and town offices: nonpartisan.** State law makes municipal elections
nonpartisan unless the city's charter specifically permits partisan elections.
Cities under the modified city manager-council charter are always nonpartisan.

*Tenn. Code Ann. §§ 2-13-208(a), 6-31-104 · usual case · read in statute*

**Metropolitan governments:** the metro mayor and metro council elections count as
municipal, so they are nonpartisan. The other county offices in a metro county
(sheriff, trustee, clerks) still follow the county rules, and the metro county
still holds county primaries.

*Tenn. Code Ann. §§ 2-13-208(b), 2-13-206 · statutory · read in statute*

**School boards: partisan or nonpartisan, by county.** Since a law passed in late
2021, school board elections may be partisan. If at least one party's county
primary board opts in, candidates for any school board in that county may run as
party nominees. Otherwise they run without party labels.

*Tenn. Code Ann. § 49-2-201(a)(1) · varies by place · read in statute*

**Watch out:** never call a Tennessee school board race partisan or nonpartisan
from this doc. Take it from race data.

**Judges in the largest county:** in a county of more than 825,000 people, the
county commission may make trial court and county judicial elections nonpartisan
by a two-thirds vote.

*Tenn. Code Ann. § 2-13-203(f) · varies by place · read in statute*

### Winning an election

The candidate with the most votes wins, in primaries and general elections alike.
There is no primary runoff. A runoff happens only where a city's own charter
provides one, or where a county or city legislative body chooses a runoff to break
an exact tie. Ranked choice and instant runoff voting are banned for every state
and local office.

*Tenn. Code Ann. §§ 2-8-113(a), 2-8-111, 2-3-206, 2-8-117 · statutory · read in statute*

**Watch out:** do not mention a runoff for a city race unless race data shows one.

### Running as an independent

A candidate not nominated by a party is an **independent candidate**, and that is
the word the law uses. An independent gets on the ballot by filing a nominating
petition from the county election commission, signed by registered voters who are
eligible to vote for that office. For offices on the county primary ballot,
independents file at the same time as primary candidates. City candidates file with
the county election commission where the city is.

*Tenn. Code Ann. §§ 2-5-203, 2-5-101(a)(3), (b)(1), 2-5-104(c), 2-13-208 · statutory · read in statute*

Only a statewide party or a recognized minor party can put a party label next to a
county candidate's name.

*Tenn. Code Ann. § 2-13-201 · statutory · read in statute*

## County government

Tennessee has **95 counties**, and our data has a page for each. Three of them are
**metropolitan governments**, where the county and its main city have merged
(below). There are no independent cities and no areas outside a county.

*Tenn. Code Ann. §§ 5-1-101, 7-1-101 · statutory · read in statute*

Every other county elects, for four-year terms:

- a **county commission** (the law's term is "county legislative body"), with
  9 to 25 members elected from districts, no more than three per district,
  redrawn every ten years. Members are called county commissioners and the board
  the board of county commissioners. All seats are elected together at the same
  August election, every four years.
- a **county mayor**, the chief executive, elected countywide at the same August
  election. A few counties kept the older title "county executive" by private act
  before 2007; our position label calls this office "County Mayor" everywhere.
- a **sheriff**, **trustee**, **register** (of deeds), **county clerk** and
  **assessor of property**.

*Tenn. Const. art. VII, § 1; Tenn. Code Ann. §§ 5-5-102, 5-6-101, 5-6-102, 8-11-101, 8-13-101 · statutory · read in statute*

**Watch out:** the county commission replaced the old "quarterly county court" in
1978. Do not call it a county court, and do not call its members magistrates or
justices of the peace.

*Tenn. Code Ann. § 5-5-101 · statutory · read in statute*

Counties also elect court clerks and judges, and many elect a highway or road
superintendent; which ones, and their titles, vary by county. Take them from race
data.

**Constables** are elected by civil district (two in the district containing the
county seat, one in each other district) for two-year terms, unless the county
commission has abolished the office or set a four-year term by a two-thirds vote.
Our data has constable races in 52 counties.

*Tenn. Code Ann. § 8-10-101 · varies by place · read in statute*

A **coroner**, where a county has one, is chosen by the county commission, not by
voters.

*Tenn. Code Ann. § 8-9-101 · statutory · read in statute*

### County charters

Any county may adopt a **charter** by referendum. The charter sets the size and
method of election of the county commission and can rename or restructure
executive offices, but it cannot reduce the duties of the sheriff, register, county
clerk, assessor of property or trustee. Charters do not change party rules: those
come from the Election Code above.

*Tenn. Const. art. VII, § 1; Tenn. Code Ann. §§ 5-1-203, 5-1-210(4), 5-1-202(c)(1) · statutory · read in statute*

Only **Shelby** and **Knox** counties have charters. Knox County's elected "County
Law Director" in our data comes from its charter, not general law.

*CTAS, County Charters · varies by place · state agency publication*

**Watch out:** do not state the size of a county commission or how it is districted.
Take it from race data.

### Townships and civil districts

Tennessee has **no townships**. Counties are divided into **civil districts**,
which elect constables and have no government of their own.

*Tenn. Code Ann. § 8-10-101 · statutory · read in statute*

**Watch out:** our data has 233 constable district pages (`tn/bradley-county/district-1`
and so on). Copy for those pages describes the constable race in that civil
district, never a town or a district government.

## City and town government

Tennessee calls its municipalities **cities** and **towns**; the words do not
mark a class or a size. Each one runs under one of three kinds of charter:

- a **private act charter**, a law the General Assembly passed for that one place.
  Most older cities have one.
- one of three **general law charters** written into state law, which a place
  adopts by referendum:
  - **mayor-aldermanic** (a mayor and board of aldermen),
  - **city manager-commission** (an elected board of commissioners that hires a
    manager; incorporation needs at least 1,500 residents),
  - **modified city manager-council** (an elected council that hires a manager;
    incorporation needs at least 5,000 residents).
- a **home rule charter**, which the city writes and amends itself.

*Tenn. Code Ann. §§ 6-1-101, 6-18-103, 6-30-103; Tenn. Const. art. XI, § 9 · statutory · read in statute*

Which charter a given city has is not something this doc can tell you.

### What a city or town elects

Under the general law charters:

- **Mayor-aldermanic**: a mayor and aldermen, on four-year terms. A small town
  starts with a mayor and two aldermen at large and can grow to as many as eight
  aldermen, with or without wards.
- **City manager-commission**: three or five commissioners, depending on
  population, on four-year terms. The board sets its own election date.
- **Modified city manager-council**: one council member from each voting precinct,
  on four-year terms, with an election every two years. Always nonpartisan.

*Tenn. Code Ann. §§ 6-3-101, 6-3-102, 6-20-101, 6-20-102, 6-31-101, 6-31-102, 6-31-107 · usual case · read in statute*

Private act and home rule charters set their own offices and terms.

**Watch out:** in our data, 76 municipal pages have a council race but no mayor
race. In a commission or manager city the board often chooses the mayor from its
own members. Do not write that voters elect a mayor unless race data has one.

City councils and elected school boards cannot use a system where candidates are
nominated by district but elected at large.

*Tenn. Code Ann. § 6-53-110 · statutory · read in statute*

### Population and class

There are no population classes for cities. Population matters only when a place
incorporates: it decides which general law charter the place may adopt. A city
keeps its charter as it grows.

*Tenn. Code Ann. §§ 6-18-103, 6-30-103 · statutory · read in statute*

### Home rule

Any city may adopt home rule by ordinance and a majority vote of its voters. After
that, the General Assembly can act on the city only by general law, and the city
writes and amends its own charter, by ordinance or charter commission, with voter
approval. **Home rule reserves elections to state law**: a charter provision has no
effect if it conflicts with a general act, except on pay. So the Election Code
rules above (nonpartisan unless the charter permits otherwise, the right to move to
August or November) apply in home rule cities too.

*Tenn. Const. art. XI, § 9; Tenn. Code Ann. §§ 6-53-105(b), 2-13-208(a) · statutory · read in statute*

For a city without home rule, a private act that changes its charter must be
approved locally, by two-thirds of the city council or by a local referendum,
before it takes effect.

*Tenn. Const. art. XI, § 9 · statutory · read in statute*

### Changing terms or council size

Under the general law charters, the board can change the number of aldermen
(within two to eight), stagger terms, and move the election date by ordinance.
Under a private act charter, most such changes need a new private act approved
locally. Home rule cities amend their own charter with voter approval.

*Tenn. Code Ann. §§ 6-3-102, 6-31-107, 6-54-138; Tenn. Const. art. XI, § 9 · varies by place · read in statute*

## Metro and major-place exceptions

### Metropolitan governments

A **metropolitan government** merges a county with its main city. It covers the
whole county, with a general services district (the whole county) and an urban
services district (the old city and areas added since). It needs a majority vote
inside the city and a separate majority in the rest of the county. The metro has no
separate county mayor or county commission: the metro mayor and metro council
replace both. Smaller cities in the county can stay out and keep their own
government.

*Tenn. Const. art. VII, § 1, art. XI, § 9; Tenn. Code Ann. §§ 7-2-108(a)(2), (a)(5), 7-1-106 · statutory · read in statute*

Tennessee has three, and none has a city page in our data:

- **Nashville and Davidson County** (`tn/davidson-county`). The metro mayor and
  metro council races are filed on the county page, labelled "Nashville City Mayor"
  and "Nashville City Council", with a metro vice mayor race. Four small cities
  inside Davidson County kept their own government and have their own pages:
  `tn/davidson-county/belle-meade`, `berry-hill`, `forest-hills` and `oak-hill`.
  Goodlettsville is filed under `tn/sumner-county/goodlettsville` (the
  `davidson-county/goodlettsville` address redirects there). Metro schools have their own page,
  `tn/metropolitan-nashville-public-school-district`.
- **Lynchburg and Moore County** (`tn/moore-county`). The office labelled "County
  Mayor" is the metro mayor.
- **Hartsville and Trousdale County** (`tn/trousdale-county`). The office labelled
  "County Mayor" is the metro mayor.

*CTAS, Metropolitan Government Charters · statutory · state agency publication*

**Watch out:** on these three county pages, write about a metropolitan government,
not a county with a separate city. Never write that "the city of Nashville" holds
its own elections apart from Davidson County. The metro mayor and council races are
nonpartisan; the sheriff and clerks are county offices.

### Charter counties

**Knox County** and **Shelby County** have charters (see County charters). Their
offices and titles can differ from the general law, so take them from race data.

*CTAS, County Charters · varies by place · state agency publication*

### Biggest municipal pages

`tn/shelby-county/memphis`, `tn/knox-county/knoxville`,
`tn/hamilton-county/chattanooga`, `tn/montgomery-county/clarksville`,
`tn/rutherford-county/murfreesboro`, `tn/williamson-county/franklin`,
`tn/madison-county/jackson`, `tn/washington-county/johnson-city`,
`tn/sullivan-county/kingsport`, `tn/sumner-county/hendersonville`

Each has its own charter. Take the election date, terms, council size and any
runoff from race data. Johnson City's page has a council race and no mayor race;
Brentwood (`tn/williamson-county/brentwood`) is the same.

### Cities across county lines

A city that spans counties has its elections run by the election commission of the
county where its city hall is. Our pages file each city under one county. Do not
write that a city lies wholly within the county on its page.

*Tenn. Code Ann. § 6-53-101(a)(1) · statutory · read in statute*

### School districts

Our 132 district pages are county systems (`tn/knox-county`'s board sits on the
county page itself), city systems (`tn/maryville-city-school-district`,
`tn/kingsport-city-school-district`), special school districts
(`tn/franklin-special-school-district`, `tn/lebanon-special-school-district`) and
merged systems (`tn/jackson-madison-county-school-system`,
`tn/clarksville-montgomery-county-school-system`). No new special school district
can be created; the existing ones are elected under their own private acts.

*Tenn. Code Ann. §§ 49-2-501(b)(2), 49-2-201(a)(1) · statutory · read in statute*

## Writing rules

These are the ways Tennessee copy goes visibly wrong.

1. **Never infer a county from a place name.** 7 of our Tennessee municipal pages
   share a name with a different Tennessee county: Jackson is in Madison County,
   Franklin in Williamson County, Henderson in Chester County, Benton in Polk
   County, Decatur in Meigs County, and Dyer and Rutherford in Gibson County. The
   full list is in
   [`research/places-named-after-another-county.json`](./research/places-named-after-another-county.json).
   Always take the county from the page data.
2. Never name an officeholder or a candidate.
3. **City races are nonpartisan by state law.** Do not give a city candidate a party,
   and do not describe city races as partisan unless race data shows party labels.
4. **Do not call county or school board races partisan, or nonpartisan,** from this
   doc. Whether a party nominates is a county-by-county choice. Take it from race
   data.
5. **Nashville, Lynchburg and Hartsville are metropolitan governments.** On
   Davidson, Moore and Trousdale county pages, the "mayor" and "council" are the
   metro government, not a separate city.
6. **Do not state the month or year a city votes**, or that it holds a runoff,
   unless race data gives it.
7. Say "county commission" and "county mayor". Never "quarterly court",
   "magistrates" or "county judge" for the county's governing body or executive.
8. Tennessee has civil districts, not townships. A constable district page is
   about the constable race only.
9. Say "independent candidate"; that is the law's own term.
10. Do not call Tennessee primaries simply "open": voters must be party members or
    declare allegiance to the party.
11. Avoid anything that changes within a year: who has filed, whether a race is
    contested, filing deadlines, current ballot measures.

## Sources

- **Statutes and Constitution:** the official Tennessee Code is published only
  through LexisNexis's free public access site
  (`https://www.lexisnexis.com/hottopics/tncode/`), which needs a one-time
  acceptance of its terms (Emily approved, 28 October 2026) and an "I'm not a
  robot" check on the first document (a human ticks it). There is no bulk download
  and no other current official copy; Justia blocks scripts. Recipe, in the in-app
  browser: on the table of contents, each title's context menu has "Open to level
  N"; the deepest level puts every section's path in a `data-docfullpath`
  attribute. Each section is then at
  `https://advance.lexis.com/documentpage/?pdmfid=1000516&config=025054JABlOTJjNmIyNi0wYjI0LTRjZGEtYWE5ZC0zNGFhOWNhMjFlNDgKAFBvZENhdGFsb2cDFQ14bX2GfyBTaI9WcPX5&pddocfullpath=<encoded path>`,
  with the text in `section.doc-content`. The Constitution has its own table of
  contents (the "Tennessee Constitution" link on the main page) and opens with the
  same document link. Fetch one document at a time, 2.5 to 3 seconds apart: a
  second robot check (`flow=PawCaptchaLimit`) still came after about 190
  documents, and a human has to tick it again. Plain scripts get the robot page,
  so the 86 LexisNexis entries in the ledger are checked with
  `verify-ledger.ts --browser` (all 86 found, 28 October 2026). The script alone
  reports them missing; only the 2 CTAS entries are script-checkable. Each page says "Current
  through the 2026 Regular Session and the 2026 2nd Extraordinary Session", and
  each section ends with its act history.
- **Acts read for recent changes:** 2025 Pub. Ch. 259 (county parties may keep
  non-primary nomination, § 2-13-202(b)), 2021 3rd Ex. Sess. Ch. 1 (partisan school
  board elections, § 49-2-201), 2022 Pub. Ch. 621 (ranked choice ban, § 2-8-117),
  2025 Pub. Ch. 187 (§ 6-53-110 districts), and the 2026 acts in § 2-13-203's
  history.
- **State agency publications:** the County Technical Assistance Service (CTAS,
  University of Tennessee Institute for Public Service) pages on metropolitan
  government charters and county charters, used only to name the three metros and
  two charter counties. Plain scripts can fetch them.
- **Page data:** goodparty.org sitemap shard 43, 28 October 2026.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
