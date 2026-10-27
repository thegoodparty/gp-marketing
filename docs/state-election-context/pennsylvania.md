# Pennsylvania: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Pennsylvania so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which
offices are actually on this ballot and how many seats, come from our own race
data, which always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean.

**The one thing to know first:** Pennsylvania local elections are **partisan**,
at every level. Copy written for a state where "local means nonpartisan" will be
wrong on every Pennsylvania page.

## Legislative calendar

The General Assembly is a continuing body that meets year-round, so a change can
pass in any month. It next convenes on 5 January 2027 (noon on the first Tuesday
of January each year, Pa. Const. art. II, § 4).

Re-check this doc: January and July each year. Last researched: September 2026.

## How elections work in Pennsylvania

Safe on any Pennsylvania page, at any tier. This section is unusually solid: a
home rule charter here cannot alter the conduct of elections, so it holds even
for Philadelphia and Pittsburgh.

### Election days

All county, city, ward, borough, town and township officers are elected at the
municipal election, in **odd-numbered** years. Pennsylvania local offices are
therefore never on the same ballot as a presidential or governor's race, which
makes local turnout its own separate thing.

*Pa. Const. art. VII, § 3; 25 P.S. § 2602 · statutory · read in statute*

**Watch out:** publish the rule, not the date. Only the odd-year requirement is
locked in the constitution; the specific November Tuesday can be moved by the
legislature, and primary dates have been moved by special act before.

A municipal primary is held in the spring of the same odd-numbered year, and
every candidate for an office filled at the municipal election is nominated
there.

*25 P.S. § 2604 · statutory · read in statute*

### Primary type

**Closed.** A voter must be registered and enrolled as a member of a party to
vote that party's primary ballot. A voter registered as independent or
unaffiliated cannot vote in either major party's primary, including for local
offices.

*25 P.S. §§ 2812, 2832 · statutory · read in statute*

Because local offices are partisan **and** the primary is closed, an unaffiliated
Pennsylvanian is shut out of the election that usually decides local races. This
is the most directly relevant structural fact in the state for our audience.

### Partisanship

Partisan at every level: county, city, borough, incorporated town and township.
Candidates are nominated by party at the municipal primary and carry a party
label in November.

*25 P.S. § 2870 · statutory · read in statute*

**Watch out:** this is the opposite of Missouri and Iowa at the municipal level.
Never reuse "local elections here are nonpartisan" on a Pennsylvania page.

A few local offices are elected on a nonpartisan basis, including school
directors in some districts and certain minor judicial offices. If race data
shows one of these, do not attach a party frame to it.

*usual case · read in statute*

## County government

67 counties, sorted into nine classes by population.

A board of **three county commissioners**, elected to four-year terms at the
municipal election. Counties also elect row officers: a district attorney,
treasurer, sheriff, controller or auditors, register of wills, recorder of deeds,
prothonotary and clerk of courts.

*Pa. Const. art. IX, § 4; 16 Pa.C.S. § 12301 · usual case · read in statute*

**Watch out:** the constitution exempts any county that has adopted a home rule
charter or an optional form of government. Several of the larger counties have.
Let race data override this.

### Limited voting

In electing county commissioners each voter may vote for no more than **two**
candidates, and the top three are elected. The practical effect is that a single
party cannot sweep all three seats, so the minority party is guaranteed at least
one commissioner.

*Pa. Const. art. IX, § 4; 16 Pa.C.S. § 12501(a) · usual case · read in statute*

This is a minority-representation guarantee written into the state constitution.
It is the most relevant structural fact in Pennsylvania for our audience and is
worth using on county pages. Hedge it for home rule counties, do not drop it.

### County classes

Nine classes by population. Philadelphia is the only first class county and
Allegheny the only second class county, and the general County Code does not
apply to either.

*16 Pa.C.S. §§ 102, 310 · statutory · read in statute*

The thresholds are fixed numbers tied to the decennial census, so a county's
class is stable between our copy regenerations. Even so, prefer describing the
government to naming a class number.

## Municipal government

Pennsylvania has the most complex municipal structure of any state we have done.
There are roughly 2,560 municipalities across several distinct types, and the
type determines both the offices and the vocabulary.

### Borough

One of the two most common types. Elects a **borough council** (seven members
where the borough is not divided into wards, otherwise one or two per ward), a
mayor, a tax collector, and either three auditors or a controller. Council
members serve four-year terms, with roughly half elected at each municipal
election.

*8 Pa.C.S. §§ 806, 811 · usual case · read in statute*

**Watch out:** a borough mayor is **not** the chief executive. Under the Borough
Code the general powers sit with council; the mayor presides at organisation,
votes only to break ties, and has real authority mainly over the police. Never
write that a borough mayor runs the borough or heads its government. Describe the
offices on the ballot instead.

### Township of the second class

The other most common type. Elects three **supervisors** at large, plus auditors
and a tax collector. Supervisors serve **six-year** terms and exactly one
supervisor seat comes up at each municipal election. A township may expand to
five supervisors by referendum.

*53 P.S. §§ 65402, 65403 · usual case · read in statute*

The single-seat, six-year rhythm is the most useful municipal fact in the state.
It means a second class township ballot is usually very short and one seat
carries a lot of weight.

### Township of the first class

Elects a board of at least five **township commissioners** on four-year terms, at
large where the township has no wards or one per ward where it does, plus a tax
collector and auditors or a controller.

*73 Pa.C.S. § 1703 · usual case · read in statute*

**Watch out:** a first class township has **no mayor**. The board of
commissioners is both the governing body and collectively the executive.

### City of the third class

Covers almost every Pennsylvania city. Elects a mayor, four council members, a
controller and a treasurer, each on four-year terms. The mayor sits as a member
of council. Voters may add two more council seats by referendum. The default
structure is a commission form, with powers split among departments of public
affairs, accounts and finance, public safety, streets, and parks and property.

*11 Pa.C.S. § 10701 · usual case · read in statute*

Philadelphia, Pittsburgh and Scranton are the exceptions; see below.

### Incorporated town

Bloomsburg is Pennsylvania's only incorporated town. It runs under a local or
special act and may have adopted parts of the Borough Code.

*8 Pa.C.S. § 107.1 · varies by place · read in statute*

### Home rule municipality

Any of the above may replace its statutory form with a home rule charter adopted
by its own voters, and about 70 have. A charter sets the council size, whether
seats are by district or at large, and which offices are elected. Charters
cannot, however, change how elections are conducted.

*53 Pa.C.S. §§ 2962(a)(5), 2901(b) · statutory · read in statute*

## Metro and major-place exceptions

Pennsylvania has more of these than the other states, because its biggest places
are each legally unique rather than members of a class.

### Philadelphia

`pa/philadelphia-county`

A **consolidated city-county**. County offices in Philadelphia were abolished by
the constitution and the city performs all county functions. There is no board of
county commissioners, no county row officers and no limited voting. It runs under
its own home rule charter with a mayor and a City Council elected by district and
at large.

*statutory · read in statute*

This is the highest-risk single page in the state. It is the **only** Philadelphia
page we have, with no separate municipal page beneath it, so whatever the county
page says is the whole of our Philadelphia copy.

### Allegheny County

`pa/allegheny-county`

The only second class county, excluded from the general County Code and operating
under a home rule charter. The three-commissioner board and limited voting do
**not** describe it.

*statutory · read in statute*

It is understood to have a county executive and an elected council, but nobody
read the charter. Assert the exclusion and the charter; let race data supply the
actual offices.

### Pittsburgh

`pa/allegheny-county/pittsburgh`

The only second class city. Its statutory code is unconsolidated and it operates
under a home rule charter, so none of the third class city structure applies.

*statutory · state agency publication*

### Scranton

`pa/lackawanna-county/scranton`

A city of the second class A, which by definition means it has adopted a home
rule charter. This is the one big-city case where we can safely say "governed
under its own home rule charter" without having read the charter.

*statutory · read in statute*

### Bloomsburg

`pa/columbia-county/bloomsburg`

Pennsylvania's only incorporated town, not a borough, even though state data
files it with the same class code as boroughs. Do not give it borough copy.

*statutory · read in statute*

### Any municipality or county with a charter

If race data shows a county executive, a county council, or a council structure
that does not match the class templates above, that place has a home rule charter
and the template does not apply. The elections section at the top of this file
still holds, because charters cannot reach election conduct. Let race data
override structure, never timing.

## Writing rules

These are the ways Pennsylvania copy goes visibly wrong.

1. **Never say local elections here are nonpartisan.** Pennsylvania is partisan
   at every local level, and this is the single most likely error to carry in
   from another state.
2. **Never infer a county from a place name.** 232 of Pennsylvania's 2,566
   municipalities share a name with a county and 197 sit in a *different* one.
   Bradford is in McKean County and McKean is in Bradford County, so guessing
   gets both wrong in opposite directions. Always take the county from the page
   data.
3. **Watch for same-name places.** Pennsylvania routinely has a borough *and* a
   township of the same name in the same county (Athens Boro and Athens Twp in
   Bradford). Around 80 of our pages cannot be resolved to one municipality from
   the slug alone, so avoid saying which type a place is unless the data says.
4. Never name an officeholder or a candidate.
5. Never call a borough mayor the head of the government, and never give a first
   class township a mayor at all.
6. Do not state seat counts or term lengths as fixed. Boroughs, townships and
   cities can all change their numbers by referendum.
7. Avoid anything that changes within a year: who has filed, whether a race is
   contested, filing deadlines, current ballot measures.

## Sources

- **Statutes:** Pennsylvania General Assembly, legis.state.pa.us
- **State agency:** Department of Community and Economic Development municipal
  publications

Note that the codes moved recently. The County Code is 16 Pa.C.S. (consolidated
2024, not the repealed 16 P.S.) and the First Class Township Code is 73 Pa.C.S.
(2026). The Second Class Township Code is still 53 P.S. Check for repeal before
citing from memory.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
