# Rhode Island: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Rhode Island so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which
offices are actually on this ballot and how many seats, come from our own race
data, which always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/rhode-island.json`](./research/rhode-island.json).

**The one thing to know first:** Rhode Island has no county government. Local
government is its cities and towns, which mostly elect their councils, mayors
and school committees on the same November ballot as state offices in
even-numbered years, after a September party primary that unaffiliated voters
may vote in. Local races go through the party primary system by default, but
some places run nonpartisan elections. Our five county pages carry no county
offices.

## Legislative calendar

Next regular session: convenes 5 January 2027 (the first Tuesday of January,
every year, R.I. Const. art. VI, § 3). The constitution sets no session length.
The governor has six days (Sundays excepted) to act on a bill during the
session. After adjournment, a bill becomes law unless the governor sends the
veto to the secretary of state within ten days (R.I. Const. art. IX, § 14).

A law that sets no date takes effect on 1 July if enacted by then, and on
passage if enacted later (R.I. Gen. Laws 43-3-25(a)).

Re-check this doc: August 2027. Last researched: October 2026.
Reviewed by Emily: 3 November 2026.

## How elections work in Rhode Island

Safe on any Rhode Island page, at the tier named.

### Election days

The general election is the Tuesday after the first Monday in November of
even-numbered years. Every city and town votes that day for state and federal
offices and for any local officers chosen on that day. Party primaries are on
the eighth Tuesday before the general election, in September.

*R.I. Gen. Laws 17-1-2(2), 17-18-5, 17-15-1 · statutory · read in statute*

**Cities and towns** elect their officers at the times state law or their
charters set, annually or every two years. Most local races share the November
ballot, but check race data before naming the year or the date.

*R.I. Gen. Laws 17-18-1, 45-3-1 · varies by place · read in statute*

**School committees** are elected at the city or town elections, in staggered
classes. Take each place's school committee races from race data.

*R.I. Gen. Laws 16-2-5 · varies by place · read in statute*

**Fire, water and sewer districts** elect their officers at district meetings,
which the election laws do not treat as elections.

*R.I. Gen. Laws 17-1-2(1) · statutory · read in statute*

### Primary type

Rhode Island's primaries are semi-open. A voter affiliated with a party votes
only in that party's primary, and must change affiliation at least thirty days
before a primary to switch. An unaffiliated voter may vote in any one party's
primary and stays unaffiliated afterward.

*R.I. Gen. Laws 17-15-24, 17-9.1-23(c), 17-9.1-24(a) · statutory · read in statute*

**Watch out:** the "unaffiliated voters stay unaffiliated" rule is new (2024).
Older pages and guides say voting in a primary makes an unaffiliated voter a
party member. Do not repeat that.

Local offices are part of the same party primary system: party candidates for
local office declare in late June of even years and are nominated at the
September primary.

*R.I. Gen. Laws 17-1-2(1), 17-14-1 · statutory · read in statute*

### Partisanship

**Local races are partisan unless the place has chosen nonpartisan elections.**
State law refers to nonpartisan council and school committee elections in
Newport, Pawtucket and Woonsocket, and to partisan ones in North Providence.
Never call a Rhode Island city or town race partisan or nonpartisan without race
data.

*R.I. Gen. Laws 17-19-7.1(a) · varies by place · read in statute*

**Watch out:** "local races are nonpartisan" is wrong for most of Rhode Island.

### Winning an election

City mayors are elected by plurality. No runoff appears in the law read for this
doc.

*R.I. Gen. Laws 45-4-10 · statutory · read in statute*

### Running as an independent

An independent candidate has no party affiliation, files a declaration of
candidacy in the same late-June window as party candidates, and must be a voter
in the district. Nomination papers are checked by the local board of canvassers.
A voter may sign any number of nomination papers, and signing does not make the
voter a party member. A party candidate, in contrast, cannot have been in a
different party within 90 days of filing.

*R.I. Gen. Laws 17-1-2(4), 17-14-1, 17-14-1.2(a), 17-14-9, 17-14-11(a), 17-9.1-23(e), 17-14-1.1 · statutory · read in statute*

## County government

Rhode Island's five counties have pages in our data, but those pages carry no
county offices, and no elected county government appears in the law read for
this doc. Do not describe a county commission, county executive or any county
election on Rhode Island pages. Mention the county only as a geographic area.

## City and town government

Our data has 39 Rhode Island city and town pages. Every city and town may adopt
a home rule charter and local laws, as long as they are consistent with the
constitution and state law. The General Assembly may pass general laws for all
cities and towns, but they cannot change a place's form of government. Every
city and town has an elected legislative body of one or two branches.

*R.I. Const. art. XIII, §§ 1-4 · statutory · read in statute*

**What a town elects by default:** a moderator, a town clerk, a town council of
three to seven members, a treasurer and a town sergeant, among others. A town
charter may change this. Take each town's offices from race data.

*R.I. Gen. Laws 45-4-1(a) · usual case · read in statute*

**Cities** that have a mayor elect the mayor by plurality. Take each city's
structure from race data.

*R.I. Gen. Laws 45-4-10 · varies by place · read in statute*

**School committees** have three members or the number the place has set,
elected in staggered classes. They manage the public schools of their city or
town.

*R.I. Gen. Laws 16-2-5, 16-2-9(a) · varies by place · read in statute*

## Metro and major-place exceptions

### Providence

`ri/providence-county/providence`, `ri/providence-school-district`

The largest city. Take its mayor and council races from race data.

### Newport, Pawtucket and Woonsocket

`ri/newport-county/newport`, `ri/providence-county/pawtucket`,
`ri/providence-county/woonsocket`

State law refers to nonpartisan local elections in these three cities. Do not
attach party labels here without race data.

*R.I. Gen. Laws 17-19-7.1(a) · varies by place · read in statute*

### North Providence

`ri/providence-county/north-providence-town`

State law refers to partisan local elections here.

*R.I. Gen. Laws 17-19-7.1(a) · varies by place · read in statute*

## Writing rules

These are the ways Rhode Island copy goes visibly wrong.

1. **Never describe county government.** There is none to describe. The county
   on a page is only where the place is.
2. **Never decide from the slug alone whether a page is a town or a city.** Our
   town slugs end in `-town` (`westerly-town`), city slugs do not
   (`providence`). Town pages label town offices as "City" offices.
3. **Do not call local races partisan or nonpartisan without race data.**
   Partisan is the default, but several cities are not.
4. Do not call Rhode Island primaries open or closed. Unaffiliated voters choose
   one party's primary and stay unaffiliated.
5. Do not call any Rhode Island place a township, village or borough.
6. Our data has no place names that match a Rhode Island county name in a
   different county, but still take the county from the page data.
7. Never name an officeholder or a candidate.
8. Avoid anything that changes within a year: who has filed, whether a race is
   contested, filing deadlines, current ballot measures.

### What search results commonly get wrong

- That Rhode Island has county government. It does not.
- That unaffiliated voters become party members by voting in a primary. Since
  2024 they stay unaffiliated.
- That local races are nonpartisan. Partisan is the default.

## Data issues for the data team

Do not write copy around these. They are for the data team to fix.

- **County pages are empty of county offices** because Rhode Island has no
  county government. Consider whether they should exist as location pages.
- Town pages label town offices as "City" offices (for example "City Town
  Council" in the `city-legislature` slug).
- The fire and water districts in our data appear only as positions on other
  pages.

## Sources

- **Statutes:** Rhode Island General Assembly, one page per section at
  `https://webserver.rilegislature.gov/Statutes/TITLE<t>/<t>-<ch>/<t>-<ch>-<sec>.htm`
  (e.g. `TITLE17/17-18/17-18-5.htm`). Each chapter's section list is at
  `.../TITLE<t>/<t>-<ch>/INDEX.htm`, and each title's chapter list at
  `.../TITLE<t>/INDEX.HTM`. Plain requests work, with no rate limit seen over
  about 600 requests at 0.3 s spacing. Each section shows its history of public
  laws, so the currency check is a search for recent years. Read: chapters 17-1,
  17-2, 17-9.1, 17-14, 17-15, 17-18, 17-19, 17-22, 45-2, 45-3, 45-4, 45-5, 16-2,
  16-3, 22-3, 43-1 and 43-3.
- **Constitution:** the whole constitution on one page at
  `https://rilegislature.gov/riconstitution/Constitution/ConstFull.aspx`. Plain
  requests work.
- **Currency check:** the 2024 to 2026 public laws under every cited section.
  The 2024 change letting unaffiliated voters stay unaffiliated after a primary
  (17-9.1-23, 17-15-24) is reflected here.
- **Page data:** goodparty.org sitemap shard 40, 28 October 2026, read in the
  in-app browser, plus the nationwide files in `research/`.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
