# Michigan: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Michigan so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which
offices are actually on this ballot and how many seats, come from our own race
data, which always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim
quote in [`research/michigan.json`](./research/michigan.json).

**The one thing to know first:** in Michigan, partisanship and timing follow the
**type of government**, not the size of the place. Counties and townships are
partisan and vote in presidential-election years. Villages and school boards are
nonpartisan and vote in even-numbered Novembers. Cities write their own rules in
a charter, and most vote in odd-numbered years. A township of 90,000 people runs
partisan races while the small city next door may not. Always check whether the
page is a county, township, city or village before writing a sentence about
elections.

## Legislative calendar

The Legislature meets year-round, so a change can pass in any month. It next
convenes on 13 January 2027 (noon on the second Wednesday in January each year,
Mich. Const. art. IV, § 13). A session ends on a day the two houses set by
resolution. New laws take effect 90 days after the session ends unless
two-thirds of each house votes to give them immediate effect (Mich. Const.
art. IV, § 27).

Re-check this doc: January and July each year. Last researched: October 2026.

## How elections work in Michigan

### Election days

Every Michigan election is held on one of a few fixed dates: the first Tuesday
after the first Monday in May, August or November, plus the presidential primary
in presidential years. The party primary for offices on the November ballot is
the August date.

*MCL 168.641 · statutory · read in statute*

Which November depends on the tier:

- **County offices** (clerk, treasurer, register of deeds, prosecutor, sheriff,
  drain commissioner, surveyor) are elected every fourth year on the cycle that
  started in 2000, which means **presidential-election years**.
  *MCL 168.200(1) · statutory · read in statute*
- **County commissioners** now serve four-year terms, starting with those elected
  in 2024, so they also come up in presidential years.
  *MCL 46.410(2) · statutory · read in statute*
- **Township officers** are elected for four-year terms on the cycle that started
  in 1980, again presidential years.
  *MCL 168.358(1), 168.362(1) · statutory · read in statute*
- **Villages** elect at the even-year November general election, with no primary.
  The township clerk runs the election.
  *MCL 168.642(5), 168.2(m) · statutory · read in statute*
- **School boards** (including community college boards) elect at the even-year
  November general election, with at least one seat up each time.
  *MCL 168.642c, 168.302 · statutory · read in statute*
- **Cities** elect in odd-numbered years by default, with the primary in August
  of the same year. A city that already voted annually or in even years when the
  current rule came in kept its schedule, and a city council may move between
  the allowed schedules by resolution. A few cities may still use the May date,
  with no primary.
  *MCL 168.642, 168.642a · usual case · read in statute*

**Watch out:** never say "Michigan local elections are held in odd years". That
is only the default for cities. A county, township, village or school page
should never get odd-year copy. For a city, say "most Michigan cities" or let
race data show the year.

### Can a place move its election?

Only a city can, and only by council resolution among the schedules the Election
Law allows (odd year, even year, or the May date). A charter cannot pick a date
outside the state's regular election dates. Counties, townships, villages and
school districts have no choice.

*MCL 168.642a, 117.26(2) · statutory · read in statute*

### Primary type

**Open, one party per ballot.** In the August primary the voter picks the party
primary of their choice in the booth and may vote only in that party's column; a
ballot marked in more than one party's column is void. Nothing in state law asks
the voter to declare a party for it.

*MCL 168.576(2), 168.795(1)(e) · statutory · read in statute*

**Watch out:** the presidential primary is the one exception. There the voter
must state a party in writing, and that choice is a public record for a time.
Do not let that rule leak into copy about local primaries.

*MCL 168.615c · statutory · read in statute*

### Partisanship

- **Counties:** partisan. Commissioners and the elected row officers are
  nominated at the party primary.
  *MCL 46.411, 168.192 · statutory · read in statute*
- **Townships:** partisan, in both general law and charter townships. Candidates
  appear under a party heading in the August primary.
  *MCL 168.345, 168.349(1), 42.5(1) · statutory · read in statute*
- **Villages:** nonpartisan, and no charter or ordinance can change that.
  *MCL 63.3, 78.23(a) · statutory · read in statute*
- **School boards:** nonpartisan. Candidates file nonpartisan petitions.
  *MCL 168.303(2) · statutory · read in statute*
- **Cities:** the city's charter decides. The Home Rule City Act allows partisan,
  nonpartisan or preferential ballots, and partisan or nonpartisan primaries.
  *MCL 117.3(a), (b) · varies by place · read in statute*

**Watch out:** never write that Michigan local elections are nonpartisan. It is
true for villages and school boards, false for every county and township, and
up to the charter for each city. Do not state a city's partisanship unless race
data shows party labels.

### Plurality, not majority

The candidate with the most votes wins, and the Election Law provides no runoff
for these offices. In a multi-seat race the top vote-getters fill the seats.

*MCL 168.201, 168.307(1) · statutory · read in statute*

For nonpartisan city primaries, if no more than twice as many candidates file as
there are seats, the primary is skipped. A city charter may also elect someone
outright at the primary on more than half the vote.

*MCL 168.644f(3), 168.644e · varies by place · read in statute*

### Getting on the ballot without a party

For a **partisan** office (county or township), a candidate without party
affiliation files a qualifying petition signed by registered voters of the
district. A filing fee cannot replace it, the petition may not mention a party,
and the candidate cannot also seek a party nomination that year.

*MCL 168.590, 168.590b(1), 168.590g(1), 168.590h(2) · statutory · read in statute*

No voter is barred from signing because of how they voted in the primary. The
only limits are that the signer must be registered in the district and may not
sign for more candidates for the same office than there are seats.

*MCL 168.590h(3) · statutory · read in statute*

For **nonpartisan** offices (village, school board, most city races) there is no
"independent" route because there is no party route. Every candidate files the
same nonpartisan petition.

*MCL 168.303(2), 168.644f · usual case · read in statute*

## County government

83 counties, each with a page (`research/pages-by-state.csv`).

### Board of commissioners

Each county is governed by a **board of county commissioners**, elected from
single-member districts in partisan elections. A board has between 5 and 21
seats, with a lower cap for smaller counties. Starting with the 2024 election, commissioners
serve **four-year** terms.

*MCL 46.401(1), 46.402, 46.404(a), 46.410(2), 46.411 · statutory · read in statute*

**Watch out:** many sources, including older state material, still say
commissioners serve two-year terms. That changed in 2024. Never write two years.

**Watch out:** the state constitution still calls this body the "board of
supervisors". By statute that now means the board of commissioners. Never use
"board of supervisors" for a Michigan county.

*MCL 46.416 · statutory · read in statute*

Do not state a commission size for a named county. Let race data supply it.

### Other elected county offices

The constitution requires a sheriff, county clerk, treasurer, register of deeds
and prosecuting attorney in every county, each on a four-year term. A county may
combine the clerk and register of deeds into one "clerk register". State law
also elects a drain commissioner and surveyor unless the county has abolished or
combined those offices.

*Mich. Const. art. VII, § 4; MCL 168.200 · usual case · read in statute*

### Charters and the unified form

Any county may adopt a charter. A charter county must keep the commissioners
and the main row officers elected on a partisan basis, so elections stay with
state law at the county tier. A charter county under 1.5 million people elects a
county executive at large, also partisan.

*Mich. Const. art. VII, § 2; MCL 45.514(1) · statutory · read in statute*

A county may instead adopt the optional unified form, with either an appointed
manager or an elected county executive (partisan, four-year term).

*MCL 45.552, 45.559(1) · statutory · read in statute*

So a few Michigan counties have a county executive on the ballot and most do
not. If race data shows one, the county uses one of these two forms. Do not name
which counties use them from this doc.

### Townships

Michigan has two kinds of township and both are full units of government with
elected boards. Every township elects a **supervisor, clerk, treasurer** and up
to **four trustees**, for four-year terms, in partisan elections.

*Mich. Const. art. VII, § 18; MCL 168.362(1) · statutory · read in statute*

- **General law township:** two trustees (a five-member board), or four if the
  township has reached 5,000 people or 3,000 voters and its voters approved.
  *MCL 168.358(4) · usual case · read in statute*
- **Charter township:** any township of 2,000 or more may become one. It always
  has a seven-member board (supervisor, clerk, treasurer, four trustees). The
  supervisor presides and acts as the executive, with an equal vote.
  *MCL 42.1(2), 42.5 · statutory · read in statute*

Treat a township page as a full local government with its own elected board,
never as a rural leftover.

## City and village government

### Cities

Every Michigan city is a **home rule city**. Cities that were once "fourth class
cities" have been treated as home rule cities since 1980.

*MCL 81.1c · statutory · read in statute*

The charter decides almost everything: council size, wards or at large, term
lengths, partisan or nonpartisan ballots, and whether the clerk, treasurer and
assessor are elected or appointed. It must provide for a mayor and a council,
but it may let the council choose the mayor rather than the voters.

*MCL 117.3(a), 168.321(1) · varies by place · read in statute*

**Watch out:** do not say a Michigan city elects its mayor, clerk or treasurer.
Say the city has a mayor and a council, and let race data show which seats are
on the ballot.

What a charter cannot change: the regular election dates, and anything in
general state law.

*MCL 117.26(2), 117.36 · statutory · read in statute*

### Villages

A village **stays inside its township**. Village residents are electors of that
township, and the township clerk runs village elections.

*MCL 63.4, 168.642(5)(a) · statutory · read in statute*

Two kinds:

- **General law village:** elects a president, six trustees, a clerk and a
  treasurer by default. The council may, by a two-thirds vote, cut trustees to
  four, change term lengths, or make the clerk or treasurer appointed.
  *MCL 62.1 · usual case · read in statute*
- **Home rule village:** runs under its own charter, which must provide for an
  elected president and legislative body.
  *MCL 78.23(a) · varies by place · read in statute*

All village elections are nonpartisan, held at the even-year November election,
with no primary.

*MCL 63.3, 78.23(a), 168.642(5) · statutory · read in statute*

### Does class follow population?

No. A village does not become a city by growing, and a township does not become
a charter township automatically. Each change needs a petition and a vote. Size
thresholds (2,000 people for a charter township) only set who may apply.

*MCL 117.6, 42.1(2) · statutory · read in statute*

### Can terms or council size change locally?

Yes, mostly through the charter for cities and home rule villages, by ordinance
for general law villages, and by voter approval for a general law township's
extra trustees. One state rule reaches every city: an officer elected in an odd
year for an odd-numbered term serves one extra year, so three-year charter terms
become four.

*MCL 62.1(2), 168.358(4), 168.644g(2) · statutory · read in statute*

### School and special districts

School board members serve four- or six-year terms set by the district's bylaws,
elected in nonpartisan races at the even-year November election.

*MCL 380.11a(8), 168.642c · usual case · read in statute*

## Metro and major-place exceptions

Michigan has 2,367 location pages: 83 county, 510 school district and 1,773
municipal (`research/pages-by-state.csv`). The municipal pages mix cities,
villages and townships.

### Detroit and Wayne County

`mi/wayne-county/detroit`, `mi/wayne-county`

Detroit is the only Michigan city over 600,000, and state law confirms it sits
in a county organized under the 1966 charter county act. So Wayne County runs
under a county charter, and the general description of county government above
is only partly right for it. Commissioners and the row officers are still
partisan.

*MCL 117.36a(8), 45.514(1) · statutory · read in statute*

Detroit's own offices come from its home rule charter, which nobody read for
this doc. Let race data supply them.

### The largest cities

`mi/kent-county/grand-rapids`, `mi/macomb-county/warren`,
`mi/macomb-county/sterling-heights`, `mi/washtenaw-county/ann-arbor`,
`mi/ingham-county/lansing`

Every rule that matters here (partisanship, term, mayor elected or not, wards)
comes from each city's charter. None was read. Lean hardest on race data on
these pages.

*varies by place · read in statute*

### Cities that cross county lines

State law plans for cities spread over more than one county. Our page sits under
one county slug, which may not be the only county the city is in. Do not write
"the city of X in Y County" as if it were the whole story; take the county from
the page and avoid saying it is the only one.

*MCL 168.321(3) · statutory · read in statute*

### Big charter townships

`mi/wayne-county/canton-charter-township`, `mi/ingham-county/lansing-charter-township`

Large suburban charter townships elect a partisan seven-member board, while the
cities around them may hold nonpartisan races. Never give a township page city
copy.

*MCL 42.5(1), 168.345 · statutory · read in statute*

## Writing rules

These are the ways Michigan copy goes visibly wrong.

1. **Never say Michigan local elections are nonpartisan.** Counties and townships
   are partisan by law. Only villages and school boards are always nonpartisan.
   City partisanship is set by charter.
2. **Never say local elections are in odd years** except for a city, and then
   only as "most Michigan cities".
3. **Check the page type before writing.** In our slugs, a township ends in
   `-township` or `-charter-township`. A plain slug is a city or a village, and
   the slug alone does not say which.
4. **Watch for same-name places.** Michigan often has a city and a township of
   the same name in the same county (`mi/kalamazoo-county/kalamazoo` and
   `mi/kalamazoo-county/kalamazoo-charter-township`). There are 174 such names in
   our data. They are different governments with different election rules.
5. **Never infer a county from a place name.** 32 Michigan place names match a
   county name and 5 sit in a different county: Otsego (Allegan County),
   St. Joseph (Berrien County), Mason (Ingham County), Schoolcraft (Kalamazoo
   County) and Clinton (Lenawee County). Always take the county from the page.
6. **County commissioners serve four-year terms**, not two. Never write
   "board of supervisors" for a county.
7. **Never describe a village as separate from its township.** Village residents
   are township electors too.
8. Do not say a city elects its mayor, clerk or treasurer, and do not state a
   city term length or council size.
9. Never name an officeholder or a candidate.
10. Avoid anything that changes within a year: who has filed, whether a race is
    contested, filing deadlines, current ballot measures.

### What search results get wrong about Michigan

- "Local elections are nonpartisan": false for counties and townships.
- "County commissioners serve two-year terms": changed with the 2024 election.
- "Closed primary": the August primary lets each voter choose a party's column
  on the day; only the presidential primary records a party choice.
- "Villages are independent of townships": they are not.
- "The board of supervisors runs the county": constitutional wording only.

## Data notes

For the data team, not for copy.

- One Wayne County municipal slug is `village-of-grosse-pointe-shores`. The
  `village-of-` prefix is unusual in our Michigan data, and the place's type was
  not confirmed for this doc. Do not write "village" or "city" for it from the
  slug.
- Same-name city and township pairs (rule 4) are told apart only by the slug
  suffix. If a township page ever loses its suffix, it will be confused with the
  city.

## Sources

- **Constitution and statutes:** Michigan Legislature, legislature.mi.gov.
  Michigan Election Law (1954 PA 116, MCL 168), county commissioner apportionment
  (1966 PA 261, MCL 46.401 to 46.416), charter counties (1966 PA 293, MCL 45.501
  to 45.521), optional unified county government (1973 PA 139, MCL 45.551 to
  45.573), charter townships (1947 PA 359, MCL 42), Home Rule City Act
  (1909 PA 279, MCL 117), fourth class city act (1895 PA 215, MCL 81 to 113),
  General Law Village Act (1895 PA 3, MCL 61 to 74), Home Rule Village Act
  (1909 PA 278, MCL 78), Revised School Code (1976 PA 451, MCL 380).
- **Our data:** `research/pages-by-state.csv` and
  `research/places-named-after-another-county.json` (27 October 2026 snapshot).
  Slugs checked on goodparty.org on 27 October 2026.

**Bulk access recipe.** A whole act, with every section and its amendment
history, is one page:
`https://www.legislature.mi.gov/Home/RenderDoc?objectName=mcl-Act-<n>-of-<year>`
(for example `mcl-Act-116-of-1954` for the Election Law, about 2 MB). The whole
constitution is `RenderDoc?objectName=mcl-Constitution`. A single section is
`https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-<chapter>-<section>`
(for example `mcl-168-642`, `mcl-Article-VII-18`), which is what the ledger
cites. Plain curl with a browser user agent works; no blocking.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
