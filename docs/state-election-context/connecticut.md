# Connecticut: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Connecticut so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which offices
are actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/connecticut.json`](./research/connecticut.json).

**The one thing to know first:** Connecticut has no county government. Local
government is the town, alongside a smaller number of cities and boroughs. Town elections are
partisan, held in November of odd-numbered years, and shaped by a minority
representation law that caps how many seats on most boards one party can hold.

## Legislative calendar

Next regular session: convenes 6 January 2027 (the Wednesday after the first
Monday of January in odd-numbered years, Conn. Const. amend. art. III). It must
adjourn by the first Wednesday after the first Monday in June (9 June 2027). Bills
can reach the governor after adjournment; the governor then has 15 calendar days
from presentment to veto (five days, Sundays and holidays excepted, while the
session is running), and a veto session is called on the second Monday after the
last day for vetoes (art. IV, § 15; amend. art. III). Public acts take effect on
1 October after the session unless the act sets another date (Conn. Gen. Stat.
§ 2-32).

Re-check this doc: August 2027, after the veto session, and again after the
2027 acts are compiled. Last researched: October 2026.

## How elections work in Connecticut

Safe on any Connecticut page, at the tier named.

### Election days

**Towns, cities and boroughs** hold their regular municipal elections every two
years, on the Tuesday after the first Monday of November in odd-numbered years. A
municipality may instead vote on the first Monday of May of odd years if its
legislative body decides so by a three-fourths vote, and can move back to November
by a simple majority.

*Conn. Gen. Stat. § 9-164(a)(1) · usual case · read in statute*

**Probate judges** are elected by probate district every four years, at the
November state election, counting from 1966 (so in even-numbered years).

*Conn. Const. art. V, § 4 · statutory · read in statute*

**Boards of education** are town offices, elected at the municipal election unless
the town's charter or a special act says otherwise.

*Conn. Gen. Stat. § 9-185 · usual case · read in statute*

**Watch out:** never state that a town votes in May unless race data gives the
date. November of odd years is the rule.

### Primary type

Connecticut's parties endorse first, and a primary happens only if someone
challenges the endorsement. For town offices, each party picks its endorsed
candidates by caucus of enrolled members, by convention, or by its town committee,
as party rules say. If another candidate files to challenge, a primary is held 56
days before the municipal election. State and district primaries are on the second
Tuesday in August.

*Conn. Gen. Stat. §§ 9-390(a), 9-415(c), 9-423 · statutory · read in statute*

Primaries are closed: only voters enrolled in the party may vote, plus unaffiliated
voters if that party's state rules allow it.

*Conn. Gen. Stat. § 9-431(a) · statutory · read in statute*

**Watch out:** do not write that a town race "will have a primary". Most endorsed
candidates are never challenged.

### Partisanship

**Town races are partisan.** Candidates are nominated by parties, and the ballot
lists them by party, ordered by each party's vote for governor at the last
election, with petitioning candidates after the parties.

*Conn. Gen. Stat. §§ 9-249a(a), 9-390(a) · statutory · read in statute*

**Minority representation.** On most elected and appointed boards, one party may
hold at most a set share of the seats: for example 2 of 3, 4 of 6, or two-thirds
of a board larger than nine. Voters often may vote for only part of the seats up
(no more than one party can win), so the minority party is guaranteed seats. The
cap does not apply to bodies elected by district or to a town meeting.

*Conn. Gen. Stat. §§ 9-167a, 9-188, 9-204 · statutory · read in statute*

**Watch out:** in Connecticut "vote for no more than three" for five board seats
is the law working as designed, not an error. Do not describe the minority
party's seats as a surprise or an upset.

### Winning an election

The candidate with the most votes wins. There are no runoffs. For selectmen, votes
for a losing first selectman candidate count toward a seat on the board of
selectmen unless the town provides otherwise.

*Conn. Gen. Stat. §§ 9-311a, 9-188 · statutory · read in statute*

### Running without a party

A candidate can get on the ballot by nominating petition, signed only by electors
(registered voters), with or without a party designation; these "petitioning
candidates" appear after the party rows.

*Conn. Gen. Stat. §§ 9-249a(a), 9-453a · statutory · read in statute*

## County government

Connecticut has eight counties, each defined as a list of towns, but no county
government: county powers passed to the state in 1960. There are no county
elections. Our eight county pages carry no races.

*Conn. Gen. Stat. §§ 6-1, 6-2a · statutory · read in statute*

**Watch out:** never write about a Connecticut county government, county
commission, sheriff or county executive. On a county page, say the county is a
geographic area made up of towns.

## Town, city and borough government

### What a town elects

Unless its charter or a special act says otherwise, a town elects a board of
selectmen (a **first selectman**, who leads the town, plus two other selectmen,
or up to six in towns of 10,000 or more), a town clerk, treasurer, tax collector,
constables, registrars of voters, a board of assessment appeals and a board of
education. A town may switch its clerk, treasurer or tax collector to appointment
by ordinance. Terms default to two years; chief executives, selectmen and
legislative bodies serve two or four years as the charter or an ordinance sets.

*Conn. Gen. Stat. §§ 9-185, 9-187, 9-188 · varies by place · read in statute*

Many towns have charters with a **mayor** and **council** or a council and town
manager instead of selectmen. A charter's legislative body can be a town meeting,
a representative town meeting, a board of selectmen, a council, a board of
directors, a board of aldermen or a board of burgesses (in a borough).

*Conn. Gen. Stat. § 7-193(a)(1) · varies by place · read in statute*

**Watch out:** if a town page has no mayor race, do not mention a mayor. Most
small towns are led by a first selectman.

### Boards of education

A town board of education has 3, 6, 9 or 12 members unless a special act provides
otherwise, and limited voting protects the minority party. Our data also has
regional school district boards on many town pages.

*Conn. Gen. Stat. §§ 9-203, 9-204 · usual case · read in statute*

### Home rule

The constitution has home rule for towns, cities and boroughs: the General
Assembly delegates powers by general law, sets the maximum terms of local offices,
and may not pass special acts on a single town's organization or terms. Any
municipality may adopt and amend its own charter.

*Conn. Const. art. X, § 1; Conn. Gen. Stat. § 7-188(a) · statutory · read in statute*

## Metro and major-place exceptions

Every municipal page in our data has a slug ending in `-town`, even for a city
(`ct/fairfield-county/bridgeport-town`, `ct/new-haven-county/waterbury-town`).
School boards for the biggest cities are on their own pages
(`ct/bridgeport-school-district`, `ct/new-haven-school-district`,
`ct/hartford-school-district`, `ct/stamford-school-district`). Take each city's
offices from race data.

### Data issues

These are problems in our data, noted for the data team. Never write copy around
them.

- Hartford, New Haven and Stamford have no municipal page; only their school
  district pages exist.
- Bridgeport's and Waterbury's municipal pages hold only a town clerk race, with
  no mayor or council.
- Two probate judge races are filed on school district pages
  (`ct/andover-school-district`, `ct/regional-high-school-district-19`).
  Probate districts are their own geography.
- Our labels call the first selectman "city manager / first selectman" and town
  offices "city" offices.

## Writing rules

1. **No county government.** Never describe a county board, sheriff or county
   election in Connecticut.
2. Never name an officeholder or a candidate.
3. **Town races are partisan,** with minority representation limits. Do not call
   them nonpartisan.
4. Town elections are in **November of odd-numbered years** unless race data says
   May.
5. Say **first selectman** for the leader of a selectman town, not mayor.
6. Do not write that a primary will happen; most endorsements are unchallenged.
7. Say "town" for the municipality on a town page, even where its name is a city,
   unless race data shows city offices.
8. Avoid anything that changes within a year: who has filed, whether a race is
   contested, filing deadlines, current ballot measures.

Our data has no Connecticut place names that collide with a county name in a
different county.

## Sources

- **General Statutes:** whole chapters at
  `https://www.cga.ct.gov/current/pub/chap_<n>.htm` (Title 9 elections: 146, 147,
  148, 153; Title 7 charters: 99; counties: 76; General Assembly: 16). Changes from
  the most recent session sit in a supplement at
  `https://www.cga.ct.gov/2026/sup/chap_<n>.htm`; none of the sections cited here
  appear in the 2026 supplement. Acts from the 2026 session are not yet compiled.
  The site sends an incomplete certificate chain: download
  `http://certificates.godaddy.com/repository/gdig2.crt`, convert it with
  `openssl x509 -inform der -in gdig2.crt -out gdig2.pem`, and run the checker with
  `NODE_EXTRA_CA_CERTS=gdig2.pem`. No rate limit seen at two seconds per request.
- **Constitution:** the Secretary of the State's register page,
  `https://portal.ct.gov/sots/register-manual/section-i/constitution-of-the-state-of-connecticut`,
  which prints the original text followed by the amendments. The General
  Assembly's own constitution link returns 404.
- **Page data:** goodparty.org sitemap shard 7, 28 October 2026.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
