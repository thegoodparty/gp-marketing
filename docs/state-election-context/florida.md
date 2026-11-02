# Florida: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Florida so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which offices
are actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/florida.json`](./research/florida.json).

**The one thing to know first:** Florida splits cleanly by type of government.
County offices are partisan and chosen in a closed party primary in August of
even-numbered years, then the November general election. School boards, judges,
soil and water supervisors and most special district boards are nonpartisan by
law. Cities set their own election dates and rules in their charters, so city
races can fall in any month and any year. Two big places break the county
pattern: Jacksonville is one government with Duval County, and Miami-Dade runs
under its own constitutional home rule charter with a nonpartisan mayor and
commission.

## Legislative calendar

Next regular session: convenes 2 March 2027 (the first Tuesday after the first
Monday in March of each odd-numbered year, Fla. Const. art. III, § 3(b)). A regular
session lasts at most 60 consecutive days unless extended by a three-fifths vote of
each house (art. III, § 3(d)), so the 2027 session is due to end by 30 April 2027.
In even-numbered years the session starts earlier, on the second Tuesday after the
first Monday in January; the 2028 session convenes 11 January 2028 (art. III,
§ 3(b)).

Bills reach the governor in batches after the session ends: the Constitution only
asks that passed bills be signed by the presiding officers "as soon as practicable"
after adjournment (art. III, § 7). Once a bill is presented, the governor has 7
consecutive days to act, or 15 if the legislature has adjourned sine die (art. III,
§ 8(a)). New laws take effect on the 60th day after the session adjourns unless the
act sets its own date (art. III, § 9), and many do.

Re-check this doc: August 2027, once the 2027 session's bills have all been acted
on. Also re-check early if a special session touches elections or local government;
the governor can call one at any time by proclamation (art. III, § 3(c)). Last
researched: October 2026, against the 2026 Florida Statutes, which already include
the 2026 session's laws.

## How elections work in Florida

Safe on any Florida page, at the tier named.

### Election days

**The general election** is held on the first Tuesday after the first Monday in
November of each even-numbered year. **The primary** is held on the Tuesday 11
weeks before it, which puts it in August.

*Fla. Stat. §§ 100.031, 100.061; Fla. Const. art. VI, § 5(a) · statutory · read in statute*

**County offices** are all chosen at those even-year elections:

- the clerk of the circuit court, sheriff, property appraiser, tax collector,
  supervisor of elections and (where elected) school superintendent in years
  divisible by four, the presidential years,
- county commissioners on staggered four-year terms, odd-numbered districts in the
  presidential years and even-numbered districts in the even years between.

*Fla. Stat. §§ 100.041(1), (2)(a), 98.015(1) · statutory · read in statute*

**School boards** are elected at the same August and November elections, on
staggered four-year terms (below).

**Cities, towns and villages** set their own election dates. State election law
applies to a city only where its special act, charter or ordinance is silent, and a
council can move its election and qualifying dates by ordinance. So a city's
election can fall in any month and in odd or even years.

*Fla. Stat. § 100.3605(1)-(2) · varies by place · read in statute*

**Watch out:** never state when a Florida city votes, or that it votes in November,
unless race data gives the date.

**Special districts** (fire, hospital, mosquito control, community development and
others) mostly hold board elections with the county's general election, but the
rules differ by kind of district and by each district's charter. Take timing from
race data.

*Fla. Stat. §§ 189.04, 190.006(3)(a)2.c., 582.18(1) · varies by place · read in statute*

**Can a place move its own election date?** A city can, by ordinance, without a
referendum; election dates and qualifying periods are the one part of how officers
are elected that a city may change without voter approval. Counties and school
boards cannot: their offices are tied to the state's even-year elections by law.

*Fla. Stat. §§ 100.3605(2), 166.021(4), 100.041 · statutory · read in statute*

### Primary type

**Florida's primaries are closed.** A voter may vote only the primary ballot of the
party they are registered with. A voter with no party affiliation gets no party
ballot.

*Fla. Stat. § 101.021 · statutory · read in statute*

**The universal primary.** If every candidate for an office belongs to the same
party and the winner will face no opposition in November, the primary for that
office is opened to every voter, whatever their party.

*Fla. Const. art. VI, § 5(b) · statutory · read in statute*

**Watch out:** a single qualified write-in candidate counts as November opposition,
so the primary stays closed. Never write that a race "is open to all voters" from
the party labels alone. Take it from race data, or leave it out.

*Division of Elections, Closed Primary Elections · usual case · Secretary of State publication*

**Nonpartisan races are on the primary ballot for everyone.** School board,
judicial and nonpartisan special district races that appear at the August primary
can be voted by every registered voter, including those with no party.

*Division of Elections, Closed Primary Elections · statutory · Secretary of State publication*

A party candidate must have been a registered member of that party for 365
consecutive days before qualifying begins.

*Fla. Stat. § 99.021(1)(b)2. · statutory · read in statute*

### Partisanship

Florida's partisanship splits by type of government:

| Type | Party labels | Source |
| --- | --- | --- |
| County commission and the five county officers | Partisan, except where a county charter says otherwise (Miami-Dade's mayor and commission) | Election Code; county charter |
| School board | Nonpartisan, by the Constitution | art. IX, § 4(a) |
| Elected school superintendent | Take from race data | |
| Judges | Nonpartisan | § 105.011(2) |
| City, town and village | Set by each city's charter | § 100.3605 |
| Special district boards | Nonpartisan unless the district's charter says partisan | § 189.04 |
| Soil and water supervisors | Nonpartisan | § 582.18(1) |
| Community development districts | Nonpartisan once residents vote | § 190.006(3) |

*Fla. Const. art. IX, § 4(a); Fla. Stat. §§ 97.021(24), 105.011(2), 105.041(3), 189.04(2)(c), 582.18(1), 190.006(3), 100.3605(1) · statutory · read in statute*

On a nonpartisan ballot no party label appears, and a nonpartisan candidate's
political advertising may not state their party.

*Fla. Stat. §§ 105.041(3), 106.143(3) · statutory · read in statute*

**Watch out:** city races in Florida are usually nonpartisan, but that comes from
each city's charter, not from state law. Do not call a city race nonpartisan or
partisan unless race data shows it.

**Watch out:** a county charter can give its commission and mayor nonpartisan
elections (Miami-Dade's does), but it cannot change the five county officers
below. Take county party labels from race data.

**School boards and the 2024 amendment.** The Constitution requires school board
members to be elected on a nonpartisan ballot, and state law says so
"notwithstanding" any local law or county charter. In 2023 the Legislature
proposed a constitutional amendment to make school board elections partisan. It
went to voters in November 2024 and won 54.9 percent, short of the 60 percent the
Constitution requires, so school boards remain nonpartisan.

*Fla. Const. art. IX, § 4(a), art. XI, § 5(e); Fla. Stat. § 1001.361; Senate bill summary, HJR 31 (2023); Division of Elections results, 5 November 2024 · statutory · read in statute, Secretary of State publication*

**Watch out:** do not write that school board races are partisan, or that a change
is coming. Proposals to make them partisan have been filed before and may be again;
if one passes, this doc gets updated. Copy should also never imply a school board
candidate's party.

### Winning an election

General elections are decided by plurality: most votes wins. Party primaries are
plurality too, with no primary runoff.

*Fla. Const. art. VI, § 1; Fla. Stat. §§ 100.061, 100.181 · statutory · read in statute*

**School board and judicial races work differently.** All candidates appear at the
August primary. A candidate who wins a majority there is elected, unless a write-in
candidate has qualified. Otherwise the top two go to November. An unopposed
candidate does not appear on any ballot.

*Fla. Stat. § 105.051(1) · statutory · read in statute*

**Cities** set their own rules. Some require a majority with a runoff; others
elect by plurality. Miami-Dade County requires a majority for mayor and commission,
with a runoff at the November general election.

*Fla. Stat. § 100.3605(1); Miami-Dade County Home Rule Charter § 3.01(B) · varies by place · read in statute, read in county charter*

### Running as an independent

Florida's term is **no party affiliation** (NPA). An NPA candidate qualifies by
paying the qualifying fee or by petition, and goes straight onto the November
ballot. The candidate must be registered with no party and must not have been a
member of any party for the 365 days before qualifying begins. Any candidate,
party or not, can qualify by petition instead of paying the fee. Petition
signatures must come from registered voters in the area the office represents.

*Fla. Stat. §§ 99.021(1)(c), 99.0955(1), 99.095(1), (3) · statutory · read in statute*

The Constitution bars the state from making ballot access harder for NPA or
minor-party candidates than for candidates of the largest party, and an NPA
candidate's political ads in a partisan race must say they have no party
affiliation.

*Fla. Const. art. VI, § 1; Fla. Stat. § 106.143(3) · statutory · read in statute*

**Watch out:** in nonpartisan races (school board, judicial, soil and water, most
special districts) every candidate runs without a party label, so there is no
separate independent route. Say "no party
affiliation" rather than "independent" when describing a partisan Florida ballot.

### School districts

Each county is one school district, so our 67 district pages match the 67
counties. Each school board has at least five members on four-year terms. Members
live in residence areas but are elected by voters across the whole district: every
voter votes for one candidate from each residence area. A school board member may
not run again after eight consecutive years.

*Fla. Const. art. IX, § 4(a); Fla. Stat. §§ 1001.34(1), 1001.35, 1001.361 · statutory · read in statute*

**The superintendent** is elected unless the district has made the post appointed,
by referendum or by a special law approved by voters, and that can be reversed
after four years. Our data shows an elected superintendent on 40 county pages.

*Fla. Const. art. IX, § 5; Fla. Stat. § 1001.461 · varies by place · read in statute*

**Watch out:** never say whether a district elects its superintendent unless race
data has the race.

### Special districts

Florida has many special districts: fire, hospital, mosquito control, drainage,
port and more, plus hundreds of **community development districts** (CDDs) in new
subdivisions. Boards elected by registered voters are nonpartisan unless the
district's charter says otherwise. Some boards are elected on a one-acre, one-vote
basis by landowners instead.

*Fla. Stat. §§ 189.04(2)(c), (3)(b), 189.041 · statutory · read in statute*

A CDD board starts out elected by landowners. After six years (ten for large
districts) and once enough residents live there, seats pass one by one to
nonpartisan elections by resident voters at the November general election.

*Fla. Stat. § 190.006(3) · statutory · read in statute*

**Soil and water conservation district** supervisors (five per district) are
nonpartisan and elected at the November general election. Candidates must have a
tie to agriculture.

*Fla. Stat. §§ 582.18(1), 582.19(1) · statutory · read in statute*

**Watch out:** CDD seats on our pages may still be landowner seats. Do not tell
residents they can vote for a CDD board unless race data shows a resident election.

## County government

Florida has 67 counties, and our data has a page for each.

*Fla. Stat. ch. 7; Fla. Const. art. VIII, § 1(a) · statutory · read in statute*

### The commission

Unless a charter says otherwise, a county is governed by a **board of county
commissioners** of five or seven members serving staggered four-year terms. Each
commissioner lives in a district. Under the default statute the five commissioners
are elected by voters countywide; voters can switch by referendum to single-member
districts, or to seven members with two elected at large.

*Fla. Const. art. VIII, § 1(e); Fla. Stat. §§ 124.01(2), 124.011(1) · usual case · read in statute*

**Watch out:** whether commissioners are elected countywide or by district varies
by county. Do not write "voters in District 3 elect..." unless race data shows a
district-only race.

### The five county officers

Every county elects a **sheriff**, **tax collector**, **property appraiser**,
**supervisor of elections** and **clerk of the circuit court**, each for four
years. A county charter cannot abolish these offices, change their term, or make
them appointed. Miami-Dade and Broward, which had been exceptions, came under this
rule with the 2024 elections. The clerk is also the county's auditor, recorder and
custodian of county funds unless a special law says otherwise, which is why many
counties call the office "Clerk of the Circuit Court and Comptroller". Orange
County, for one, has a separate elected comptroller.

*Fla. Const. art. VIII, § 1(d), § 6(g)(2) · statutory · read in statute*

### Charter counties

Any county can adopt a **home rule charter** by countywide vote, and a charter can
only be changed by the county's voters. A charter county has every power of
self-government not inconsistent with general law; a non-charter county has only
what the Legislature grants. A charter can restructure the commission, add an
elected county mayor or chair (our data shows one in Miami-Dade, Orange and
Volusia), and set term limits.

*Fla. Const. art. VIII, § 1(c), (f), (g); Fla. Stat. § 125.60 · varies by place · read in statute*

**Does home rule reserve elections to state law?** Yes. The Constitution has
elections "regulated by law", a charter cannot touch the five county officers, and
school board elections stay districtwide and nonpartisan "notwithstanding" any
county charter. A charter can still decide how its own commission and mayor are
elected.

*Fla. Const. art. VI, § 1, art. VIII, § 1(d); Fla. Stat. § 1001.361 · statutory · read in statute*

### No townships

Florida's local governments are counties, municipalities and special districts.
There are no townships or other elected units between the county and the city.

*Fla. Const. art. VIII, § 6(b) · statutory · read in statute*

## City, town and village government

Florida has one kind of municipality. "City", "town" and "village" are names a
place chooses in its charter, not classes, and there are no population classes. A
place keeps its form as it grows.

*Fla. Stat. § 165.031(3); Fla. Const. art. VIII, § 2(a) · statutory · read in statute*

Every municipality has an elected council (or commission), and every one has
**home rule**: it may exercise any power for municipal purposes except as the law
provides. There is no population threshold.

*Fla. Const. art. VIII, § 2(b); Fla. Stat. § 166.021(1) · statutory · read in statute*

**What a city elects** is set by its own charter: a mayor (elected directly or
chosen by the council), a council or commission elected at large, by district or
both, and sometimes other offices such as a city clerk. Term lengths and council
size vary.

*Fla. Const. art. VIII, § 2(a) · varies by place · read in statute*

**Watch out:** if a city page has no mayor race, the council may choose the mayor.
Do not write that voters elect a mayor unless race data has one.

### Changing the charter

A council by ordinance, or voters by petition, can put a charter amendment to a
citywide referendum, and it passes by simple majority. A council can move election
dates by ordinance alone, but changing **terms of office, how officers are
elected, the form of government or the split of powers** needs a referendum. No
charter or ordinance may exempt a city from Election Code rules written for
municipalities.

*Fla. Stat. §§ 166.031(1)-(2), 166.021(4), 100.3605 · statutory · read in statute*

## Metro and major-place exceptions

Our biggest Florida pages by population:

`fl/duval-county` (Jacksonville), `fl/miami-dade-county/miami`,
`fl/hillsborough-county/tampa`, `fl/orange-county/orlando`,
`fl/pinellas-county/st-petersburg`, `fl/miami-dade-county/hialeah`,
`fl/st-lucie-county/port-st-lucie`, `fl/lee-county/cape-coral`,
`fl/leon-county/tallahassee`, `fl/broward-county/fort-lauderdale`

For each city, take the election date, term, council size and runoff rule from
race data.

### Jacksonville and Duval County

Jacksonville and Duval County are **one consolidated government**. The
Constitution keeps in force an older provision that lets the City of Jacksonville
extend throughout Duval County in place of the county government, with the duties
of a county. Four places inside Duval County kept their own city governments:
**Atlantic Beach, Jacksonville Beach, Neptune Beach and Baldwin**. The consolidated
city provides county-level services to them.

*Fla. Const. art. VIII, § 6(e) (retaining 1885 Const. art. VIII, § 9); City of Jacksonville 2045 Comprehensive Plan, Definitions · statutory · read in statute, local government publication*

Our data shows Duval County still electing the five county officers and a school
board, as every county does. Jacksonville's mayor and city council are
on our `fl/duval-county` page, not on `fl/duval-county/jacksonville` (see the data
notes in the Sources section).

**Watch out:** never describe a separate Duval County commission or county mayor,
and never call Jacksonville Beach, Atlantic Beach, Neptune Beach or Baldwin part of
the City of Jacksonville.

### Miami-Dade County

Miami-Dade runs under its own **home rule charter**, protected by the Constitution
and older than the general charter-county rules. The county can exercise city
powers where they do not conflict with existing cities, and its cities amend their own charters by the
method the county charter provides. The commission has 13 members, each elected
by district. The county mayor and commissioners are elected on a nonpartisan
ballot, need a majority to win (with a runoff at the November general election),
and are limited to two consecutive four-year terms.

*Fla. Const. art. VIII, § 6(e), (f) (retaining 1885 Const. art. VIII, § 11); Fla. Stat. § 124.01(5); Miami-Dade County Home Rule Charter §§ 1.04, 3.01, 3.03 · statutory · read in statute, read in county charter*

Since the 2024 elections Miami-Dade also elects a sheriff, tax collector,
property appraiser, supervisor of elections and clerk, like every other county.

*Fla. Const. art. VIII, § 1(d), § 6(g)(2) · statutory · read in statute*

**Watch out:** Miami-Dade's charter still describes the clerk's election as
nonpartisan, but the five county officers now fall under the state Constitution.
Take their party labels from race data. Do not describe Miami-Dade's sheriff as
appointed, or its county officers as new, in a way that dates the copy.

### Other consolidation provisions

The Constitution also keeps older provisions that would allow consolidating
Hillsborough County with Tampa and Monroe County with Key West. Our data files
Tampa and Key West as ordinary cities with their own mayor and council, alongside
separate county pages. Any other consolidation needs a special law approved by
the county's voters.

*Fla. Const. art. VIII, §§ 3, 6(e) · statutory · read in statute*

### Cities across county lines

Each of our pages files a city under one county, even where it extends into
others. Do not write that a city lies wholly within the county on its page.

## Writing rules

These are the ways Florida copy goes visibly wrong.

1. **Never infer a county from a place name.** Two of our Florida municipal pages
   share a name with a different Florida county: **Seminole is in Pinellas County**
   and **Lee is in Madison County**. The full list is in
   [`research/places-named-after-another-county.json`](./research/places-named-after-another-county.json).
   Always take the county from the page data.
2. Never name an officeholder or a candidate.
3. **Florida primaries are closed.** Do not call them open or semi-closed, and do
   not say a primary is open to all voters unless race data shows a universal
   primary. A write-in candidate keeps it closed.
4. **School board races are nonpartisan by the Constitution.** The 2024 amendment
   to change that failed. Never attach a party to a school board candidate.
5. **Do not call a city race partisan or nonpartisan,** and do not state when a
   city votes, unless race data shows it.
6. **Jacksonville is the county government.** Never describe a separate Duval
   County commission; the four beach and Baldwin cities are not part of Jacksonville.
7. Say "no party affiliation" (NPA), not "independent", for candidates on a
   partisan ballot.
8. **There are no townships, and no classes of city.** "Town" and "village" are
   names, not sizes or powers.
9. **There is no primary runoff.** Majority-and-runoff rules exist only in school
   board and judicial races (majority at the primary) and in cities or counties
   whose charter requires them.
10. Avoid anything that changes within a year: who has filed, whether a race is
    contested, filing deadlines, current ballot measures, and pending proposals to
    change school board elections.

**What search results commonly get wrong about Florida:** that it has open
primaries; that a one-party race always opens to every voter (a write-in closes
it); that school board races became partisan (the 2024 amendment failed); that
Miami-Dade appoints its sheriff (it elects one since 2024); and that Jacksonville
and Duval County have separate governments.

## Sources

- **Statutes:** 2026 Florida Statutes, read in bulk as whole chapters from the
  Legislature's Online Sunshine site at
  `https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=<range>/<chapter>/<chapter>.html`,
  with the chapter zero-padded to four digits and the range its hundred-block, e.g.
  `0000-0099/0097/0097.html` or `1000-1099/1001/1001.html`. Without a year in the
  URL the site serves the current edition. Plain scripts can fetch it (`http://`
  redirects to `https://`); 20 chapters at two-second spacing caused no rate limit
  or bot check, so the ledger checker reads it directly. Each section ends with its
  session-law history (`ch. 2026-26` and so on). Chapters read: 7, 11, 97-106, 124,
  125, 129, 165, 166, 189, 190, 582, 1001.
- **Constitution:** the whole Constitution is one page at
  `https://www.leg.state.fl.us/statutes/index.cfm?submenu=3`, including the
  retained 1885 provisions for Jacksonville, Key West, Miami-Dade and Hillsborough
  in the notes to art. VIII, § 6.
- **Currency check:** the 2026 edition includes the 2026 session's laws. The 2026
  elections act (ch. 2026-26) changed voter registration, ID, ballots, canvassing
  and candidate oaths, but nothing on election timing, partisanship or local
  government structure.
- **Division of Elections:** the Closed Primary Elections page
  (`dos.fl.gov/elections/for-voters/voter-registration/closed-primary-elections/`)
  for the write-in rule, and the official results at
  `results.elections.myflorida.com/SummaryRpt.asp?ElectionDate=11/5/2024&Race=AMD`
  (scriptable; the main results page is a frameset).
- **Senate bill summary:** HJR 31 (2023), at
  `flsenate.gov/Committees/BillSummaries/2023/html/31`.
- **Local charters:** the Miami-Dade Home Rule Charter (amended through
  8 November 2022) at `miamidade.gov/charter/library/home-rule-charter.pdf`, and the
  City of Jacksonville 2045 Comprehensive Plan definitions (December 2025) for the
  urban services districts. Both are PDFs, extracted with macOS PDFKit; their six
  ledger entries are marked manual.
- **Page data:** goodparty.org sitemap shard 10, 28 October 2026: 533 location
  pages (67 county, 67 school district, 398 municipal), 1,431 position pages.

**Data notes for the data team** (never write copy around these):

- `fl/duval-county/jacksonville` holds only a community development district race.
  Jacksonville's mayor and council are on `fl/duval-county`, labeled as county
  executive and county board.
- Four pages filed as cities are unincorporated communities that hold only CDD or
  district races: `fl/hillsborough-county/wimauma-riverview`,
  `fl/santa-rosa-county/navarre-beach`, `fl/clay-county/middleburg-clay-hill`,
  `fl/manatee-county/parrish`.
- `fl/dade-county-school-district` uses the county's pre-1997 name; the county page
  is `fl/miami-dade-county`.
- The clerk of the circuit court is labeled `comptroller-joint` in 52 counties and
  `county-court-clerk` in 15. It is the same constitutional office.
- Odd labels: `fl/escambia-county/century` has a `town-meeting-board` (Florida has no
  town meetings), `fl/escambia-county/pensacola` has an `island-manager`, and
  `fl/baker-county/glen-st-mary` has a mayor but no council race.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
