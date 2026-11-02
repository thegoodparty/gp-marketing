# Alabama: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Alabama so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which offices
are actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/alabama.json`](./research/alabama.json).

**The one thing to know first:** Alabama runs two separate election systems.
County offices and county school boards are partisan: candidates are chosen in
May party primaries (with a runoff if nobody wins a majority) and elected in
November of even-numbered years. Cities and towns hold their own nonpartisan
elections on the fourth Tuesday in August, once every four years (2025, then
every fourth year), with a runoff four weeks later. Counties have no home rule,
so almost every local difference is a local act of the Legislature or a local
constitutional amendment, which makes "take it from race data" the rule for any
detail beyond the defaults below.

## Legislative calendar

The Legislature elected in November 2026 first meets in an **organizational
session** on 12 January 2027 (the second Tuesday in January after its election,
for no more than ten days, Ala. Const. 2022 § 48.01(a); Code of Ala. § 29-1-4).
Only organizing business happens then.

Next regular session: convenes 2 February 2027 (the first Tuesday of February
in the first, second and third years of the term, and the second Tuesday in
January in the fourth year, Code of Ala. § 29-1-4, under Ala. Const. 2022
§ 48.01(b)). A regular session is limited to 30 legislative days within 105
calendar days, so the 2027 session ends by 17 May 2027 at the latest. Special
sessions, which the governor calls by proclamation, are limited to 12
legislative days within 30 calendar days (§§ 48.01(b), 122).

The governor has six days, Sundays excepted, to act on a bill during the
session. Bills presented in the last five days before final adjournment may be
signed up to ten days after adjournment; a bill not signed by then does not
become law (Ala. Const. 2022 § 125). So the 2027 session's bills are settled by
about 27 May 2027.

Each act usually states its own effective date (`usual case`), and recent
election acts have taken effect on dates from April to October. A penal act
takes effect no sooner than 60 days after approval unless it says otherwise
(Code of Ala. § 1-1-8).

Re-check this doc: June 2027. Last researched: October 2026.

## How elections work in Alabama

Safe on any Alabama page, at the tier named.

### Election days

**County offices** are elected at the November general election (the first
Tuesday after the first Monday in November) in even-numbered years, on three
cycles:

- **Sheriff, coroner** and other county officers not otherwise provided for:
  every four years counting from 2006, the governor's cycle.
- **County commission** (and county treasurer and constables where those
  exist): every four years counting from 2008, the presidential cycle, unless a
  local law says otherwise.
- **Probate judge and circuit clerk:** six-year terms, counting from 2006.

*Code of Ala. §§ 17-14-3, 17-14-4, 17-14-6 · statutory · read in statute*

**Watch out:** the commission's cycle is "except as otherwise provided by local
law", and many counties have staggered or moved their commission seats that
way. Avoid saying which year a county's commission seats are up unless race
data shows it.

*Code of Ala. § 17-14-4 · varies by place · read in statute*

**County boards of education** are elected at the November general election,
with seats up every two years and six-year terms, unless a local law says
otherwise. The default board has five members elected countywide, and a board
may switch to five or seven single-member districts.

*Code of Ala. §§ 17-14-5, 16-8-1 · usual case · read in statute*

**Cities and towns** hold their regular elections on the fourth Tuesday in
August, every four years counting from 2025. A runoff, when needed, is on the
fourth Tuesday after. Winners take office on the first Monday in November.

*Code of Ala. § 11-46-21(a), (c) · usual case · read in statute*

That is the default, not a flat rule. It does not apply where a general or local
act sets a different time, or to Birmingham (Class 1) and cities still under a
commission form of government, which have their own election laws. A Class 5
city may, by resolution, vote every three years on the second Tuesday in July.
Local acts also move individual cities' schedules: a 2025 act extended
Scottsboro's municipal terms by a year.

*Code of Ala. §§ 11-46-20(a), 11-46-21(d), 11-46-6, 11-46-74; Act 2025-50 · varies by place · read in statute*

**Watch out:** older sources give the municipal runoff as six weeks after the
election. Since 2021 it is four weeks.

*Act 2021-157; Code of Ala. § 11-46-21(a) · statutory · read in statute*

**City boards of education** are appointed by the city council or commission
by default, five members on five-year terms. A city can have an elected board
only through a local law, after a local referendum, or under the constitutional
provision for cities over 125,000. Several of our city school district pages
carry only a State Board of Education race, which fits an appointed board
(Albertville, Hoover and Madison). Avoid saying a city school board is elected
unless race data shows a board race.

*Code of Ala. §§ 16-11-2, 16-11-3; Ala. Const. 2022 §§ 104.01, 104.02 · varies by place · read in statute*

**County superintendents** are appointed by the county board under the general
law, but some counties elect theirs by local law. 37 of our 67 county pages
carry an elected superintendent race. Take it from race data.

*Code of Ala. § 16-9-1 · varies by place · read in statute*

### Primary type

A voter chooses one party's primary ballot at the polls and receives that
party's ballot and no other. Parties
set their own rules on who may vote in their primary and may make voters sign a
pledge on the poll list to support the party's nominees.

*Code of Ala. § 17-13-7 · statutory · read in statute*

The primary is the Tuesday in May before Memorial Day, or the first Tuesday in
March in a presidential year. If no candidate wins a majority, the top two meet
in a runoff four weeks later. A voter who voted in one party's primary may vote
only in that same party's runoff.

*Code of Ala. §§ 17-13-3(a)-(b), 17-13-18(b), 17-13-7.1 · statutory · read in statute*

**Watch out:** do not call Alabama's primary "open" without that runoff limit,
and do not give the May primary as "the fourth Tuesday in May". That date
changed in 2025.

*Act 2025-283 · statutory · read in statute*

### Partisanship

**County races are partisan.** The November ballot lists party nominees chosen
by primary (or by convention for smaller parties) and independents who qualified
by petition. This covers the county commission, probate judge, sheriff, circuit
clerk, tax officials, coroner, constables and the county board of education.

*Code of Ala. §§ 17-9-3(a), 17-14-2, 17-14-5 · statutory · read in statute*

**Municipal races are nonpartisan.** State law abolishes party primaries and
partisan elections for the governing body of every city and town with 300,000
or fewer people at the latest census. There is one form of ballot listing
every qualified candidate, and write-in votes are not allowed.

*Code of Ala. §§ 11-46-3, 11-46-25(b), 11-46-43(b) · statutory · read in statute*

**Watch out:** the nonpartisan rule is measured by the latest census, while the
municipal class system is measured by the 1970 census (see City and town
government). Do not mix them up. If race data ever shows a party label on an
Alabama municipal race, follow race data.

Elected **city school boards** are set up by local law, which decides how they
are elected. Do not call them partisan or nonpartisan unless race data says.

*Ala. Const. 2022 § 104.01 · varies by place · read in statute*

**Watch out:** "local races are nonpartisan" is wrong on every Alabama county
page. "Local races are partisan" is wrong on every city and town page.

### Winning an election

Both systems use **majority with a runoff** for the first round:

- **Party primaries** (county offices): a majority, or a runoff between the top
  two four weeks later.
- **Municipal elections:** a majority, or a runoff between the top two on the
  fourth Tuesday after. For a group of seats, the majority is the total vote
  divided by the number of seats, then by two.

*Code of Ala. §§ 17-13-18(b), 11-46-55(c)-(d) · statutory · read in statute*

The **November general election** has no runoff: the candidate with the most
votes wins.

*Code of Ala. § 17-16-41 · statutory · read in statute*

A 2026 act changed what happens when a municipal runoff candidate withdraws or
dies, or a runoff ties. Do not describe those cases.

*Act 2026-579 · statutory · read in statute*

### Running as an independent

For **county office**, an independent qualifies by petition, filed with the
probate judge, signed by voters qualified to vote for that office. A person who
ran in that year's primary cannot then appear on the November ballot as an
independent. No law read for this doc bars primary voters from signing.

*Code of Ala. § 17-9-3(a)(3), (b) · statutory · read in statute*

For **city and town office** there are no party nominations at all. A candidate
files a sworn statement of candidacy with the municipal clerk. No petition is
needed.

*Code of Ala. § 11-46-25(g) · statutory · read in statute*

**Watch out:** the probate judge is the county's chief elections official and
runs county and state elections. Cities run and pay for their own municipal
elections.

*Code of Ala. §§ 17-1-3(b), 11-46-20(a) · statutory · read in statute*

## County government

Alabama has 67 counties (our data has a page for each). Every county's governing
body is called the **county commission**, but that name change did not change
how any commission is made up or elected.

*Code of Ala. §§ 11-1-1, 11-1-5 · statutory · read in statute*

The default commission is the **probate judge as chair plus four elected
commissioners** serving four-year terms. Local law or a court order overrides
that in many counties, so commissions differ in size, in whether members run by
district or countywide, and in who chairs. 17 of our county pages carry a
separately elected commission chair. Avoid describing a county's commission
beyond what race data shows.

*Code of Ala. § 11-3-1(a), (c) · varies by place · read in statute*

Commissioners elected by district must live in their district, and a commission
elected by districts may redraw them by resolution after each census.

*Code of Ala. §§ 11-3-1(a), 11-3-1.1 · statutory · read in statute*

Other elected county offices:

- **Probate judge:** six-year term. Runs county elections, and chairs the
  commission in counties on the default structure.
- **Sheriff:** four-year term, in every county.
- **Circuit clerk:** six-year term.
- **Tax assessor and tax collector**, or a combined revenue commissioner where
  local law provides one. 57 of our county pages carry a revenue commissioner.
- **Coroner:** four-year term, usually.
- **County treasurer** only in counties over 56,000 where the law provides for
  one, and **constables** in some counties.

*Ala. Const. 2022 § 138; Code of Ala. §§ 17-14-1, 17-14-2, 17-14-6, 11-5-1 · usual case · read in statute*

**Watch out:** which revenue offices a county elects, and whether it elects
constables or a superintendent, differs county by county. Take those from race
data.

### No home rule

Alabama counties have **no general home rule and no county charters.** The
Limited Self-Governance Act gives commissions only a short list of nuisance
powers (weeds, animals, litter, junkyards, noise) and nothing touching courts,
schools, cities or how the county is governed. Anything else, including the
structure and elections of the commission, comes from the Legislature: general
laws, **local acts** for one county (which may not be passed where a general law
already covers the case), or **local constitutional amendments**, which voters
in that one county alone can ratify.

*Code of Ala. § 11-3A-2(a), (d); Ala. Const. 2022 §§ 105, 284.01 · statutory · read in statute*

So there is no county election reservation to check. Every county structure is
whatever state law, general or local, says.

**Watch out:** the Constitution of Alabama of 2022 recompiled the 1901
constitution and its hundreds of amendments, renumbered them, and grouped the
local amendments by county. Never cite an "Amendment 555"-style number or a 1901
section number as current. Cite the 2022 section.

*Ala. Const. 2022 §§ 286.02, 286.03(a) · statutory · read in statute*

### Townships

No Alabama law read for this doc creates townships or another elected general
government below the county, and our Alabama data has no township pages. Do not
describe any.

## City and town government

Alabama has two names for a municipality, set by population at the last census:
**cities** (2,000 or more people) and **towns** (under 2,000). A place that
crosses the line after a census changes at its next election.

*Code of Ala. § 11-40-6 · statutory · read in statute*

Separately, the law sorts municipalities into **eight classes** for the
Legislature to write class-specific laws, and those classes are fixed by the
**1970 census**: Class 1 was 300,000 or more, Class 8 was 5,999 or fewer. A
place incorporated after June 1979 takes its class from its population when it
incorporated. A law for a class counts as a general law.

*Code of Ala. § 11-40-12; Ala. Const. 2022 § 110 · statutory · read in statute*

**Class does not follow today's population.** Never infer an Alabama city's
class from its size. Some rules (like the 12,000 line below) do use the latest
census, so check which measure a rule uses.

### What cities and towns elect

The default (mayor-council) structure:

- **Under 12,000 people:** a mayor and five council members, with the mayor
  presiding over and voting on the council. A city of 12,000 to 25,000 may keep
  this form by ordinance.
- **12,000 or more:** a mayor who does not sit on the council, and a council
  (with a council president in larger cities), all on four-year terms.

*Code of Ala. §§ 11-43-2(a)-(c), 11-43-40(a) · usual case · read in statute*

Every city and town elects its mayor and council together every four years at
the regular municipal election, under the default.

*Code of Ala. § 11-43-2(a), (d) · usual case · read in statute*

Many places use other forms. Voters may adopt council-manager government by
petition and election, some cities have laws written for their class, and some
still use a commission. A 2026 act lets a mayor break a council tie where the
council has an even number of seats, if the council allows it. Take each
place's offices from race data.

*Code of Ala. §§ 11-43A-2, 11-43-2(a)(2); Act 2026-594 · varies by place · read in statute*

### Home rule

Alabama municipalities have **no constitutional home rule.** The Legislature
cannot authorize a city to pass laws inconsistent with general law, and cities
are created by petition to the probate judge, never by local act.

*Ala. Const. 2022 §§ 89, 104(5); Code of Ala. § 11-41-1 · statutory · read in statute*

**Does that reach elections?** Yes, in effect. Election timing, partisanship
and the runoff come from state law (general, class or local acts), not from the
city. What a council can change on its own is limited to the choices below.

### What a council can change

- Elect council members at large or from wards, decided at least six months
  before an election. A council may set five to seven single-member districts
  (up to nine in Class 1, 2 and 3).
- In a city of 12,000 or more, switch to five members elected at large by a
  two-thirds vote.
- Create other elected or appointed offices by ordinance and set their terms.

*Code of Ala. §§ 11-43-2(d), 11-43-40(a)(4), 11-43-63, 11-46-1 · statutory · read in statute*

Term length and election years beyond that come from state law, often a local
act for that city.

## Metro and major-place exceptions

### Birmingham

`al/jefferson-county/birmingham`

Birmingham is Alabama's Class 1 municipality (the Class 1 polling-place law is
written around it), so its elections are outside the general municipal article
and run under Class 1 laws: the mayor and council are elected together for
four-year terms. Part of Birmingham lies in
Shelby County, although our page files it under Jefferson County. Its races are
still nonpartisan. Our `al/birmingham-city-school-district` page carries a city
school board race; take that board's details from race data.

*Code of Ala. §§ 11-46-7(a), 11-46-8(b), 11-46-20(a), 11-46-3 · statutory · read in statute*

### Jefferson County

`al/jefferson-county`

Our page carries no revenue commissioner and no separate commission chair.
Avoid describing the default probate-judge-chaired commission here, or in any
large county, unless race data supports it.

*Code of Ala. § 11-3-1(c) · varies by place · read in statute*

### Madison County and the other elected-chair counties

`al/madison-county` (also Blount, Bullock, Covington, Cullman, Dale, DeKalb,
Houston, Jackson, Lauderdale, Limestone, Macon, Marshall, Morgan, St. Clair,
Walker and Winston)

These pages carry a separately elected commission chair, so the probate judge
does not chair the commission there. Do not say the probate judge chairs it.

*Code of Ala. § 11-3-1(c) · varies by place · read in statute*

### Military school districts

`al/maxwell-afb-school-district`, `al/fort-rucker-school-district`

These pages carry only a State Board of Education race. Do not describe a
local school board election on them.

### Cities across county lines

Each of our pages files a city under one county, but some cities, Birmingham
among them, extend into another county. Do not write that a city lies wholly
within the county on its page.

## Writing rules

These are the ways Alabama copy goes visibly wrong.

1. **Never infer a county from a place name.** Two of our Alabama place pages
   share a name with a different Alabama county: Clay is in Jefferson County
   (Clay County is elsewhere), and Cherokee is in Colbert County (Cherokee County
   is elsewhere). The full list is in
   [`research/places-named-after-another-county.json`](./research/places-named-after-another-county.json).
   Always take the county from the page data.
2. **Use the right calendar for the tier.** County races and county school
   boards: November of even-numbered years, after a May party primary. Cities
   and towns: the fourth Tuesday in August, once every four years, unless race
   data shows otherwise.
3. **Do not call local races nonpartisan or partisan without naming the tier.**
   County races are partisan. City and town races are nonpartisan.
4. **Do mention runoffs, at the right tier.** Primaries and municipal elections
   need a majority, with a runoff four weeks later. The November general
   election has none.
5. Do not call Alabama primaries closed. Do not call them simply open either: a
   primary voter may only vote in that party's runoff.
6. Do not describe a county commission's size, districts, chair or election year
   beyond what race data shows. Avoid saying the probate judge chairs the
   commission unless race data shows no separate chair.
7. Do not say Alabama counties have home rule or charters. Do not infer a city's
   class from its population.
8. Do not say a city school board or a county superintendent is elected unless
   race data shows that race.
9. Cite the Constitution of Alabama of 2022 by its own section numbers, never
   the 1901 numbering or amendment numbers.
10. Never name an officeholder or a candidate.
11. Avoid anything that changes within a year: who has filed, whether a race is
    contested, filing deadlines, current ballot measures.

## Sources

- **Statutes and constitution:** the Legislature's ALISON site
  (`alison.legislature.state.al.us`), read in bulk through its public GraphQL
  endpoint `https://alison.legislature.state.al.us/graphql`, which plain scripts
  can call with no sign-in or key. A whole Code title comes back in one POST:
  `codesOfAlabama(where:{type:{eq:Section}}, include:["<id>"], includeAllVersions:true){data{displayId catchLine effectiveDate supersessionDate content history}}`,
  with ids from `codeOfAlabamaTitles` (Title 17 is `17`, Title 16 is `16`).
  Results cap at 2,500 sections, so split Title 11 by chapter ids. The 2022
  Constitution comes the same way with
  `constitutionItems(where:{isContentNode:{eq:true}}, include:[<article ids>])`,
  ids from `constitutionTitles` (articles I-XVIII are `55372`-`55389`; the local
  amendments follow, grouped by county). Every act's summary and effective date
  comes from `instruments(where:[{actNbr:{eq:"2026-579"}}])`, and
  `instruments(where:[{sessionAbbreviation:{eq:"2026RS"},actNbr:{ne:null}}], limit:2000)`
  lists a whole session's acts for the currency check. The endpoint also answers
  GET requests, so each ledger entry's URL is a one-section GET query that
  `verify-ledger.ts` checks directly. No rate limit or bot check was seen over
  about 120 requests at two to three seconds apart. Watch for a catchline that
  starts "(Amended by Act ...)": the Code text has not caught up with that act
  yet, so read the act's summary too. Read: Titles 1, 11 (chapters 1-32,
  40-46), 16, 17, 29 and 36; Constitution of 2022 articles I-XVIII.
- **Currency check:** every 2025 and 2026 Regular Session act summary mentioning
  Titles 11, 16, 17 or 29 or a constitutional amendment. Changes that touch this
  doc: the May primary date (Act 2025-283), municipal runoff withdrawal and tie
  rules (Act 2026-579, effective 1 June 2026), mayor tie votes (Act 2026-594,
  effective 1 October 2026), and the Public Service Commission changes to
  §§ 17-14-2 and 17-14-3 (Act 2026-345), which do not affect county offices. Act
  2026-378 proposes a constitutional amendment letting neighboring county
  school boards consolidate; re-check the school board lines once voters have
  decided it.
- **Page data:** goodparty.org sitemap shard 1, 28 October 2026, read in the
  in-app browser.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
