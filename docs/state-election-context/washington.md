# Washington: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Washington so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which
offices are actually on this ballot and how many seats, come from our own race
data, which always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/washington.json`](./research/washington.json).

**The one thing to know first:** Washington splits by tier. City, town, school and
special district offices are **nonpartisan by statute** and are elected in
November of **odd-numbered** years. County offices are **partisan** and are
elected in November of **even-numbered** years, unless a county charter says
otherwise. Every race with a primary uses the **top-two primary**: all candidates
on one ballot, any voter picks any candidate, and the top two go to November
whatever their party. A party label on the ballot reads "Prefers X Party" and is
the candidate's own statement, not a party nomination. Everyone votes by mail.

## Legislative calendar

Next regular session: convenes 11 January 2027 (every year on the second Monday
of January, RCW 44.04.010). An odd-year session may run no more than 105
consecutive days, so it ends by 25 April 2027; the even-year session is capped at
60 consecutive days (Wash. Const. art. II, § 12). The governor has five days,
Sundays excepted, to act on a bill presented during the session, and 20 days,
Sundays excepted, after adjournment for bills that reach the desk at the end, so
a full-length 2027 session is settled by 18 May 2027 (Wash. Const. art. III,
§ 12). New laws usually take effect 90 days after the session adjourns, unless
the bill says otherwise (Wash. Const. art. II, § 1(c)).

Re-check this doc: June 2027. Last researched: October 2026. Reviewed by Emily:
28 October 2026.

## How elections work in Washington

Safe on any Washington page, at any tier, except where a charter county is noted.

### Everyone votes by mail

Every active registered voter is automatically mailed a ballot for every primary,
general and special election. Copy can say "your ballot comes in the mail"; it
should not talk about polling places on election day.

*RCW 29A.40.010 · statutory · read in statute*

### Election days, by tier

**State and federal.** A statewide general election is held every year on the
first Tuesday after the first Monday of November. In odd-numbered years it is
mostly limited to city, town and district elections, plus unexpired terms and
state measures.

*RCW 29A.04.321 · statutory · read in statute*

**County.** County officers are elected in November of **even-numbered** years to
four-year terms. County commissioners serve staggered four-year terms, with one
or two commissioners elected at each even-year general election.

*RCW 36.16.010, 36.16.020, 36.32.030 · usual case · read in statute*

**Watch out:** a charter county may put its county elections in the odd-year
general election instead. King County's charter has moved the other way, onto
even-year ballots (see "Charter counties" below). Never state which year a named
charter county votes in. Let race data supply it.

*RCW 29A.04.321(1)(d) · statutory · read in statute*

**City, town and district.** All city, town and district general elections are
held on the first Tuesday after the first Monday in November of
**odd-numbered** years. The law calls these dates mandatory and overrides any
other statute, so a city, town or district cannot move its own election date.
Charter cities included (see "Home rule" below).

*RCW 29A.04.330(1), (5) · statutory · read in statute*

The exceptions are public utility districts (PUDs), conservation districts, and
districts where only property owners may vote. They follow their own laws. Do not
state the election year for a PUD or conservation district race; let race data
supply it.

*RCW 29A.04.330(1)(b) · statutory · read in statute*

**Primaries.** Primaries for November elections are held on the first Tuesday of
August.

*RCW 29A.04.311 · statutory · read in statute*

### The top-two primary

Every partisan office uses a top-two primary. All candidates for an office appear
on one primary ballot, and the two who get the most votes go on to November,
whatever party they prefer. Two candidates who prefer the same party can both
advance, and a candidate can advance without any party at all.

*RCW 29A.52.112(2) · statutory · read in statute*

A primary commits the voter to nothing. Washington voters never register by party,
and any party preference shown on the ballot is "for the information of voters
only" and may in no way limit the voter's options.

*RCW 29A.08.166, 29A.52.112(4) · statutory · read in statute*

Only the top two from the primary appear on the November ballot, and only if they
received at least 1 percent of the primary vote for that office.

*RCW 29A.36.170 · statutory · read in statute*

**Nonpartisan offices** (all city, town, school and special district offices) run
the same way, but a position skips the primary entirely when two or fewer
candidates file, and both go straight to November. Park and recreation district
and cemetery district commissioners never have a primary.

*RCW 29A.52.210, 29A.52.220 · statutory · read in statute*

So many Washington local races go straight to November with no primary at all.
Do not write that a candidate must "win the primary" unless race data shows one.

**Watch out:** do not call Washington's primary "open", "closed" or "blanket",
and do not say parties nominate candidates in it. Call it the top-two primary.

### Party preference, not party nomination

For a **partisan office**, the candidate may state a party preference on the
declaration of candidacy, or state none. The ballot prints it under the name as
"(Prefers ABC Party)" or "(States No Party Preference)", the same on the primary
and general ballots.

*RCW 29A.04.110, 29A.52.112(4); WAC 434-230-045 · statutory · read in statute
(the WAC is the Secretary of State's ballot rule)*

**Watch out:** "Prefers Democratic Party" is the candidate's own statement, not a
party endorsement or nomination. Never write "the Democratic nominee" or "the
Republican candidate" for a Washington race. If copy mentions a preference at
all, use the ballot's wording.

### Which offices carry a party preference

Partisan offices, where a preference may appear, are federal offices, state
offices including the legislature (except judges and the superintendent of public
instruction), and **all county offices except judicial offices and any office a
county home rule charter makes otherwise**.

*RCW 29A.04.110 · statutory · read in statute*

**All city, town and special purpose district offices are nonpartisan** and are
nominated and elected as such. City and town primaries are nonpartisan. School
director races appear on the nonpartisan ballot.

*RCW 29A.52.231, 29A.52.210, 28A.343.330 · statutory · read in statute*

By type of local government:

| Government | Party preference on the ballot? |
| --- | --- |
| County (noncharter) | Yes, for every county office except judges |
| County (charter) | Varies: the charter may make offices nonpartisan |
| City, any class, charter or not | No, by statute |
| Town | No, by statute |
| School district | No, by statute |
| Special district (fire, port, PUD, hospital, water-sewer, parks, cemetery and others) | No, by statute |

**Watch out:** do not assume "local means nonpartisan" here. County races in a
noncharter county show a party preference. Never attach a party to a mayor,
council member, school director or district commissioner.

### Winning

There is no runoff. After a primary, the November ballot carries at most two
candidates and the one with more votes wins. Where no primary was held, the
candidate with the most votes wins.

*RCW 29A.36.170, 36.32.050 · statutory · read in statute*

### Getting on the ballot

Every candidate, partisan or not, files the same **declaration of candidacy**.
The form has a line for a party preference only when the office is partisan.
Outside the presidential race there is no separate nominating petition and no
"independent" route: a candidate who prefers no party simply files and states no
preference.

*RCW 29A.24.031 · statutory · read in statute*

A candidate who cannot afford the filing fee files a **filing fee petition**
instead. Only voters registered within the office's jurisdiction may sign it.

*RCW 29A.24.091(4) · statutory · read in statute*

**Watch out:** "independent" is not a ballot status in Washington. A candidate
may describe themself as independent, but the ballot says "States No Party
Preference" or names the party they prefer.

### School and special districts

**School districts.** A board of **five directors** on four-year terms is the
default. A district containing a city of 400,000 or more has seven directors.
Some large first-class districts may elect directors to six-year terms. School
races are nonpartisan and follow the odd-year rule above.

*RCW 28A.343.300, 29A.04.340, 29A.04.330 · usual case · read in statute*

**Special districts.** Washington has many, each with its own elected board.
Common ones in our data, with their default terms:

- Fire protection district commissioners: six-year terms. *RCW 52.14.060*
- Port district commissioners: four- or six-year terms. *RCW 53.12.172*
- Public hospital district commissioners: six-year terms. *RCW 70.44.040*
- Water-sewer district commissioners: six-year terms. *RCW 57.12.030*
- Park and recreation district: five commissioners, four-year terms, elected in
  odd years with no primary. *RCW 36.69.090*
- Public utility district: three or five commissioners by district. *RCW 54.12.010*

*statutory · read in statute*

Do not state a term or board size for a named district; districts can change
both. Our race data files these boards on county and city pages (port 61 pages,
park and recreation 52, fire 50, cemetery 45, water 36, hospital 33, PUD 31),
not on pages of their own.

## County government

Washington has **39 counties**. Our data has 39 county pages and no consolidated
city-county pages. The constitution allows a combined city-county, but none
appears in our data.

*RCW 36.04.010–.390; RCW 36.65.010 · statutory · read in statute*

There are **no townships** with elected offices. The township law (Title 45 RCW)
survives only as a table of former sections. Never write about a Washington
township government.

*Title 45 RCW (dispositions) · statutory · read in statute*

### The county commission (noncharter counties)

A board of **three county commissioners** on four-year staggered terms is the
default. Commissioners are nominated by district, meaning only that district's
voters choose the two who advance from the primary, and are then elected by the
whole county. A noncharter county of 400,000 or more elects them by district in
November too. Some noncharter counties may vote to enlarge the board to five.

*RCW 36.32.010, 36.32.030, 36.32.040, 36.32.050, 36.32.055 · usual case · read in statute*

**Watch out:** do not state a commissioner count, or whether November voting is
countywide, for a named county. Say the county is governed by a board of
commissioners.

### Other elected county offices

By default each county elects an assessor, auditor, clerk, coroner, prosecuting
attorney, sheriff and treasurer, all on four-year terms. A county under 40,000
may appoint its coroner instead of electing one.

*RCW 36.16.020, 36.16.030 · usual case · read in statute*

Our race data agrees for most counties: every county page has a prosecuting
attorney, 38 a sheriff and 38 an auditor, but only 18 a coroner. Name only the
county offices race data shows.

**Watch out:** the office is **prosecuting attorney**. Our data labels it
"district attorney" on all 39 county pages. Copy should say prosecuting attorney.

### Charter counties

Any county may adopt a home rule charter, subject to the constitution and state
law. The constitution says a charter does not affect the election of the
prosecuting attorney or superior court judges. Even so, King County's charter
makes its prosecuting attorney nonpartisan (see below), so for a charter county
let race data, not this rule, decide what copy says about that office.

*Wash. Const. art. XI, § 4 · statutory · read in statute*

Home rule here partly **does** reach elections. State law itself lets a charter
make county offices nonpartisan and lets a charter county hold its elections in
odd years.

*RCW 29A.04.110(3), 29A.04.321(1)(d) · statutory · read in statute*

Which counties have charters is not something we read in law. Our race data
carries a county executive or a charter review board on seven county pages, the
mark of a charter: King, Pierce, Snohomish and Whatcom (executive), and Clallam,
Clark and San Juan (charter review board). For those seven:

- Do not state whether county races show a party preference.
- Do not state which year county races are held.
- Do not call the governing body a commission or a council unless race data
  names it. King County's charter calls its board a council; other charters may
  differ.

*varies by place*

## City and town government

Washington calls its municipalities **cities** and **towns**. There are no
villages or boroughs. Every city and town office is nonpartisan, elected in
November of odd years, on four-year terms by default.

### Classes

| Class | How a place gets it | Usual elected offices |
| --- | --- | --- |
| First-class city | 10,000 or more people at organization, with a city charter | Set by its charter |
| Second-class city | 1,500 or more at organization, no charter, not a code city | Mayor, seven councilmembers, and a clerk, attorney and treasurer unless made appointive |
| Town | Under 1,500 at organization, not a code city | Mayor, five councilmembers, treasurer |
| Noncharter code city | Any size, by choosing the optional municipal code | Mayor and council, or council only (see below) |
| Charter code city | 10,000 or more, code city with a charter | Set by its charter, within the code |

*RCW 35.01.010, 35.01.020, 35.01.040, 35A.01.020, 35A.01.030, 35.23.021, 35.27.070 · statutory · read in statute*

**Class does not follow population.** Class is fixed at organization. A town that
grows past 1,500 *may* become a second-class city but need not, and any city or
town may become a code city regardless of size.

*RCW 35.06.010, 35A.02.010 · statutory · read in statute*

**Watch out:** never infer a Washington place's class, or whether it is a city or
a town, from its population. A code city can be tiny, and a town that has grown
may still be a town. Use the name the page gives.

### Code cities (the optional municipal code)

A code city chooses one of two plans:

- **Mayor-council:** voters elect a mayor and a council, both on four-year terms.
  The council has five members under 2,500 people and seven at 2,500 or more.
- **Council-manager:** voters elect **only the council**. The council appoints a
  city manager and picks one of its own members, who carries the title mayor.

Councils are elected at large unless a charter or ordinance creates wards.

*RCW 35A.12.010, 35A.12.040, 35A.13.010, 35A.13.030 · usual case · read in statute*

**Watch out:** in a council-manager city there is **no mayoral election**. 62 of
our 291 Washington city and town pages carry no mayor race. Never invite readers
to "vote for mayor" unless race data shows a mayor race, and never call a
council-manager city's mayor "elected".

### Second-class cities and towns

A second-class city elects a mayor, a seven-member council, and a clerk, city
attorney and treasurer, though the council may make those three appointive.
Council position seven serves two years; the others four.

*RCW 35.23.021, 35.23.051 · usual case · read in statute*

A town elects a mayor, a five-member council and a treasurer, all on four-year
terms.

*RCW 35.27.070, 35.27.090 · usual case · read in statute*

Our data has a city or town treasurer on only 5 pages and a city attorney on 1.
Do not say a place elects its clerk, attorney or treasurer unless race data
shows the race.

### Home rule

A city of 10,000 or more may adopt a charter, but every city charter is "subject
to and controlled by general laws". So for cities, home rule **does not** reach
elections: charter cities still hold nonpartisan elections in November of odd
years. Code city elections likewise follow general election law.

*Wash. Const. art. XI, § 10; RCW 29A.04.330(5), 29A.52.231, 35A.29.151 · statutory · read in statute*

**Watch out:** a city charter can still set its council size, wards and form of
government. Never describe these for a named charter city; use the offices race
data shows.

## Metro and major-place exceptions

### King County

`wa/king-county`

A charter county. Its charter makes the county executive, assessor, council,
director of elections and prosecuting attorney **nonpartisan**, so King County
offices carry no party preference, unlike most Washington counties. The council
has nine districts. The charter now puts these offices on **even-year** ballots,
with the switch running from 2026 to 2028.

*King County Charter §§ 610, 640, 647, 649, 650.10, 650.20 · statutory · read in county charter*

King County is also the only Washington county page in our data with an elected
director of elections, and it has no sheriff or treasurer race. Name only the
offices race data shows.

### Seattle

`wa/king-county/seattle`

Whatever its charter says, Seattle's offices are nonpartisan and elected in odd
years like every other Washington city. Race data carries a city attorney and municipal court
judges alongside mayor and council. Do not describe how Seattle draws its council
districts or counts votes; that is set by its own charter, which we have not
read.

*Wash. Const. art. XI, § 10; RCW 29A.52.231 · varies by place · read in statute*

### Pierce, Snohomish and Whatcom counties

`wa/pierce-county`, `wa/snohomish-county`, `wa/whatcom-county`

Each has a county executive in race data, a sign of a charter. Follow the
charter county rules above. Race data files a combined assessor-treasurer for
Pierce County (see "Data issues").

### Other big cities

`wa/spokane-county/spokane`, `wa/pierce-county/tacoma`,
`wa/clark-county/vancouver`, `wa/king-county/bellevue`,
`wa/snohomish-county/everett`

Nonpartisan, odd-year, like every Washington city. Bellevue has only a council
race in our data, consistent with a council-manager city: do not mention a
mayoral election there. Use the offices race data shows for each.

### Seattle Public Schools

`wa/seattle-public-schools`

The seven-director rule is written for a school district containing a city of
400,000 or more. Let race data give the seat count.

*RCW 28A.343.300 · usual case · read in statute*

## Writing rules

These are the ways Washington copy goes visibly wrong.

1. **Never infer a county from a place name.** Two Washington municipal pages
   share a name with a different Washington county: Pacific is in King County
   (`wa/king-county/pacific`) and Garfield is in Whitman County
   (`wa/whitman-county/garfield`). Always take the county from the page data.
2. Never name an officeholder or a candidate.
3. **Never attach a party to a city, town, school or special district race.**
   They are nonpartisan by statute, charter cities included.
4. **Say "prefers", never "nominee".** A party label on a Washington ballot is
   the candidate's stated preference. Never write "the Republican nominee" or
   "the Democratic candidate", and never call a candidate "independent" as a
   ballot status.
5. **Call it the top-two primary.** Not open, closed, blanket or jungle.
6. **City, town, school and most district races are in odd years; county races
   are in even years** unless a charter county says otherwise. Never state the
   year for a charter county, a PUD or a conservation district.
7. **Say prosecuting attorney**, not district attorney, whatever the position
   label says.
8. **Do not promise a mayoral election.** Council-manager cities elect only a
   council.
9. **Never call a Washington place a village, borough or township.**
10. Do not infer a city's class, or city versus town, from its population.
11. Do not state a council, commission or district board size, or a term, for a
    named place.
12. **Watch for same-name school districts.** Six school district slugs end in a
    county name to tell them apart: `west-valley-school-district-spokane` and
    `-yakima`, `east-valley-school-district-spokane` and `-yakima`, and
    `evergreen-school-district-clark` and `-stevens`. Use the district's name
    without the county suffix in copy, and never mix up the pair.
13. Avoid anything that changes within a year: who has filed, whether a race is
    contested, filing deadlines, current ballot measures.

## Data issues

Logged for the data team. Never write copy around them.

- **"District attorney" label.** Every county page files the prosecuting attorney
  under `district-attorney`. Washington has no district attorney. The page heading
  already reads "County Prosecuting Attorney"; the label survives in the URL and
  in the "About this position" text ("The District Attorney is the chief legal
  representative of the district"), both of which come from election-api.
- **Joint offices in the place slot.** Pierce County's assessor-treasurer is at
  `wa/pierce-county/county-assessor/position/treasurer-joint`, and Starbuck's
  clerk-treasurer at `wa/columbia-county/starbuck/city-clerk/position/treasurer-joint`.
  The office name has landed in the URL where a place name belongs. Being
  investigated separately (code fix with redirects, or a data-team request).
- **Port commission labeled as an airport board.** Seattle's page carries an
  `airport-district-board` position. It is the Port of Seattle commission: the
  page heading reads "Port of Seattle Board", but the URL and the "About this
  position" text describe an airport district. Call it the port commission in
  copy, never an airport board.

## Sources

- **Statutes:** Revised Code of Washington, Washington State Legislature,
  app.leg.wa.gov (chapters 28A.343, 29A.04, 29A.08, 29A.24, 29A.36, 29A.40,
  29A.52, 35.01, 35.06, 35.23, 35.27, 35A.01, 35A.02, 35A.12, 35A.13, 35A.29,
  36.04, 36.16, 36.32, 36.65, 36.69, 44.04, 52.14, 53.12, 54.12, 57.12, 70.44;
  Title 45 dispositions)
- **Administrative rule:** WAC 434-230-045 (ballot format for party preference),
  app.leg.wa.gov
- **Constitution:** Washington State Constitution, leg.wa.gov (art. II, §§ 1, 12;
  art. III, § 12; art. XI, §§ 4, 10)
- **County charter:** King County Charter, King County Council clerk,
  aqua.kingcounty.gov
- **Our data:** production sitemap shard 48 (Washington), 27 October 2026, and
  the nationwide files in `research/`

Bulk recipe: `https://app.leg.wa.gov/RCW/default.aspx?cite=<chapter>&full=true`
returns a whole chapter as one HTML page, with each section's history in brackets
underneath. `?cite=<Title>` lists a title's chapters, `?cite=<section>` gives one
section, and `https://app.leg.wa.gov/RCW/dispo.aspx?cite=<n>` gives the fate of a
repealed or recodified title or chapter (a chapter that has moved returns an
"Object moved" redirect to that page). Plain curl works; 45 downloads at two
seconds apart drew no rate limit. The 2026 session laws are already folded in;
none touches a section this doc relies on. The constitution is at
`https://leg.wa.gov/state-laws-and-rules/washington-state-constitution/`, one
page per article selected by a `?section=<id>` link on that page (art. II is
`13c8f0de-…`, art. III `62da7e39-…`, art. XI `b5d3ff0e-…`). WACs are at
`https://app.leg.wa.gov/WAC/default.aspx?cite=<rule>`.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
