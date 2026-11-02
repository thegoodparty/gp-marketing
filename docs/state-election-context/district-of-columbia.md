# District of Columbia: election context

Starting point for the location page editorial generator. This gives you the
structure that holds across the District of Columbia so you do not have to
research the same ground on every page. It is not an authority: per-page
specifics, like which offices are actually on this ballot and how many seats,
come from our own race data, which always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/district-of-columbia.json`](./research/district-of-columbia.json).

**The one thing to know first:** DC is one city with no state, no counties and
no separate municipalities. Its voters elect a Mayor, an Attorney General and a
13-member Council on a partisan basis, a nonpartisan State Board of Education,
and nonpartisan Advisory Neighborhood Commissioners, all in November
of even-numbered years. Since the June 2026 primary, contests with three or more
candidates use ranked-choice voting. And Congress keeps the final word on every
law the Council passes.

## Legislative calendar

DC has no legislature in the usual sense. The **Council** holds the District's
legislative power under the Home Rule Act and meets year-round, so there is no
session to wait for (D.C. Code § 1-204.04(a)). The Council elected in November
2026 takes office on 2 January 2027 (§ 1-204.01(b)(1)).

A permanent act is read twice, at least 13 days apart (§ 1-204.12(a)). The
Mayor then has 10 working days to sign or veto it, and an act not returned in
time counts as approved (§ 1-204.04(e)). The act then goes to Congress and
takes effect only after a 30-day review period, counting only days Congress is
in session, or 60 days for criminal law, unless Congress passes a joint
resolution disapproving it (§ 1-206.02(c)). Emergency acts take effect at once
and last up to 90 days (§ 1-204.12(a)). Congress may also legislate for the
District directly on any subject at any time (§ 1-206.01).

Re-check this doc: January and July every year, and whenever Congress passes a
law about DC elections or the Council. Last researched: October 2026.

## How elections work in DC

### Election days

All local offices are elected at the November general election (the Tuesday
after the first Monday) in even-numbered years:

- **Mayor**, **Attorney General** and **Council** members: four-year terms.
- **State Board of Education** members: four-year terms.
- **Advisory Neighborhood Commissioners**: two-year terms, so every seat is on
  every November ballot.

*D.C. Code §§ 1-1001.10(a)(3), 1-204.01(b)(1), 1-204.21(b), 38-2651, 1-309.06 · statutory · read in statute*

**Primaries** are on the first Tuesday in June in presidential years and the
third Tuesday in June in other even-numbered years.

*D.C. Code § 1-1001.10(a)(3)(A) · statutory · read in statute*

**Watch out:** this doc does not cover who may vote in a DC party primary.
Avoid describing it.

### Partisanship

**Mayor, Attorney General and Council races are partisan.** A party may
nominate one fewer at-large Council candidate than there are at-large seats up.

*D.C. Code §§ 1-204.01(b), 1-204.21(b), 1-204.35(a) · statutory · read in statute*

**State Board of Education races are nonpartisan**, with candidates nominated
by petition.

*D.C. Code §§ 1-1001.08(m)-(n), 38-2651(f) · statutory · read in statute*

**Advisory Neighborhood Commission races** are nominated by petition of voters
in the commissioner's single-member district, with no party primary.

*D.C. Code § 1-309.05(b)(1) · statutory · read in statute*

**Watch out:** never call DC's Council or Mayor races nonpartisan, and never
call State Board or ANC races partisan.

### Winning an election

**Ranked-choice voting** is used from the June 2026 primary onward in every
primary, special and general election with three or more qualified candidates,
for Mayor, Attorney General, Council, State Board of Education, Advisory
Neighborhood Commissioner and federal offices. Voters may rank up to five
candidates.

*D.C. Code § 1-1001.08a(a)-(b) · statutory · read in statute*

**Watch out:** older sources describe plurality winners in DC. Since 2026 that
is wrong for any race with three or more candidates.

### Running as an independent

A candidate for Mayor, Attorney General or Council can be nominated directly by
petition only if they are not registered with a party that holds a primary.
State Board and ANC candidates are all nominated by petition.

*D.C. Code §§ 1-1001.08(j)(3), (n), 1-309.05(b) · statutory · read in statute*

## Government structure

### The Council

Thirteen members: a **Chairman** and four other members elected at large, and
one member from each of the eight **wards**, all on a partisan basis for
four-year terms.

*D.C. Code § 1-204.01(b)(1) · statutory · read in statute*

### Mayor and Attorney General

Both are elected citywide on a partisan basis for four-year terms.

*D.C. Code §§ 1-204.21(b), 1-204.35(a) · statutory · read in statute*

### State Board of Education

Nine elected members: one from each ward and one at large, for four-year
terms. Our data labels it "oversight board of local school districts"; in copy,
say State Board of Education. Avoid describing it as running the schools day
to day.

*D.C. Code § 38-2651(b) · statutory · read in statute*

### Advisory Neighborhood Commissions

The smallest elected offices in DC. Each commissioner represents a
**single-member district** of about 2,000 people, must live in it, and may hold
no other elected office. Our data puts these races on the Washington page as
"neighborhood board".

*D.C. Code §§ 1-309.03(a), 1-309.05(a) · statutory · read in statute*

### Congress

Congress reviews every act before it takes effect and may override or replace
any DC law. Avoid describing the Council's decisions as final.

*D.C. Code §§ 1-206.01, 1-206.02(c) · statutory · read in statute*

### No counties or municipalities

No law read for this doc creates counties, towns or school districts below the
District. Our data has
a county-style page (`dc/district-of-columbia`) and a city page
(`dc/district-of-columbia/washington`), but both describe the same single
government.

## Our pages

`dc`, `dc/district-of-columbia`, `dc/district-of-columbia/washington`

Most DC races sit on the top-level `dc` page under county-style labels: "county
executive" is the Mayor, "county attorney" the Attorney General, "county
legislature" the Council and "county legislative chair" the Council Chairman.
The `dc` page also carries the shadow U.S. senator and representative and the
Delegate to the House. In copy, use DC's own titles.

## Writing rules

These are the ways DC copy goes visibly wrong.

1. **Never call DC a county, a state or a city inside a county.** It is one
   government.
2. **Use DC's own titles.** Mayor, Attorney General, Council Chairman,
   Councilmember, State Board of Education, Advisory Neighborhood Commissioner.
3. **Do not call local races nonpartisan or partisan without naming the
   office.** Mayor, AG and Council are partisan; State Board and ANC are not.
4. **Mention ranked-choice voting** for contests with three or more
   candidates, from 2026 on. Do not describe plurality winners.
5. Do not describe the Council's laws as final. Congress reviews every act.
6. Avoid describing who may vote in a DC primary.
7. Never name an officeholder or a candidate.
8. Avoid anything that changes within a year: who has filed, whether a race is
   contested, filing deadlines, current ballot measures.

## Sources

- **Code:** the Council's D.C. Law Library, one section per request at
  `https://code.dccouncil.gov/us/dc/council/code/sections/<section>` (e.g.
  `1-204.01`). Chapter and subchapter pages
  (`/titles/<t>/chapters/<c>/subchapters/<s>`) list their sections. Plain
  requests with a browser user agent work. The same text is published in bulk
  in the Council's public `DCCouncil/law-html` repository, not used here.
  Section headings use en dashes; keep ledger quotes clear of them. Read: §§
  1-204.01, 1-204.04, 1-204.12, 1-204.21, 1-204.35, 1-206.01, 1-206.02,
  1-309.03, 1-309.05, 1-309.06, 1-309.10, 1-1001.02, 1-1001.05, 1-1001.07 to
  1-1001.10, 38-2651.
- **Currency check:** the ranked-choice section (§ 1-1001.08a) starts with the
  June 2026 primary. Section
  histories were not read in full.
- **Page data:** goodparty.org sitemap shard 9, 28 October 2026, read in the
  in-app browser.

Aggregator sites were not used and must not appear in published copy. Code
sections may be cited by name and number.
