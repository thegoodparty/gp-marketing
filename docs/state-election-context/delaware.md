# Delaware: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Delaware so you do not have to research the same
ground on every page. It is not an authority: per-page specifics, like which offices
are actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/delaware.json`](./research/delaware.json).

**The one thing to know first:** Delaware runs three separate election
calendars. County offices are partisan and on the November ballot in
even-numbered years, after a closed September primary. School boards are
nonpartisan and elected every year on the second Tuesday of May. Cities and
towns hold their own elections on dates set in their charters, and only
Wilmington's follow the state's partisan general election rules. Delaware has
three counties, each governed differently.

## Legislative calendar

Next regular session: convenes 12 January 2027 (the second Tuesday of January,
every year, Del. Const. art. II, § 4(a)). Each year's session may not run past
5 p.m. on 30 June unless recalled by the governor or the presiding officers
(art. II, § 4(b)). The General Assembly elected in 2026 sits through 2028, so
its final adjournment comes then.

A bill not returned by the governor within 10 days, Sundays excepted, becomes
law. Until final adjournment the General Assembly counts as continuously in
session, so the 10-day rule keeps running through the summer recess. After
final adjournment a bill needs the governor's approval within 30 days (art.
III, § 18). Bills often reach the governor well after the session, so the
2027 session's laws are settled in late summer. Each act usually states when it
takes effect (`usual case`).

Re-check this doc: August 2027. Last researched: October 2026.
Reviewed by Emily: 3 November 2026.

## How elections work in Delaware

Safe on any Delaware page, at the tier named.

### Election days

**County offices** are elected at the November general election (the Tuesday
after the first Monday) in even-numbered years. Sheriffs, registers of wills,
recorders of deeds and clerks of the peace serve four-year terms.

*Del. Const. art. V, § 1, art. III, § 22 · statutory · read in statute*

The **New Castle County Executive** is elected countywide every four years, in
presidential election years, for no more than two consecutive terms.

*9 Del. C. § 1111(a) · statutory · read in statute*

**School boards** are elected every year on the second Tuesday of May, by the
voters of each school district. An unopposed candidate is declared elected with
no poll held.

*14 Del. C. §§ 1051(a), 1072(c) · statutory · read in statute*

**Cities and towns** hold their own elections on dates set in their charters,
and run them using voting machines the state provides. **Wilmington** is the
exception: its mayor, council and other officers are elected under the general
election rules.

*15 Del. C. §§ 7501, 7521, 7550(c) · varies by place · read in statute*

### Primary type

Party primaries are on the second Tuesday after the first Monday in September.
They are **closed**: only voters registered with a party may vote in its
primary.

*15 Del. C. §§ 3101(3), 3110 · statutory · read in statute*

### Partisanship

**County races are partisan**, with nominees from the closed September primary
or unaffiliated candidates.

*15 Del. C. §§ 3101, 3002 · statutory · read in statute*

**School board races are nonpartisan.** Candidates are listed alphabetically
without any party designation.

*14 Del. C. § 1076 · statutory · read in statute*

**Wilmington's races are partisan**, run under the general election law. Other
**city and town races** follow each charter. Avoid calling a Delaware town race
partisan or nonpartisan unless race data says which.

*15 Del. C. §§ 7521, 7522, 7555(a) · varies by place · read in statute*

### Winning an election

**Plurality**: in all elections the highest number of votes wins unless a law
says otherwise, and a plurality also decides party primaries. No runoff was
found in the law.

*15 Del. C. §§ 3107, 5703 · statutory · read in statute*

### Running as an independent

An **unaffiliated** candidate must swear to having had no party affiliation for
at least 90 days, and file nominating petitions, to be certified for the
November ballot. Town candidates qualify under each town's charter.

*15 Del. C. §§ 3002, 7555(a) · statutory · read in statute*

## County government

Delaware has three counties (our data has a page for each), and state law gives
each its own government:

- **New Castle County:** an elected **county executive** and a **county
  council** of 13, twelve elected by district and a council president elected
  countywide.
- **Kent County:** the **Levy Court**, seven commissioners, six elected by
  district and one countywide.
- **Sussex County:** a **county council** of five, elected by district for
  four-year terms.

*9 Del. C. §§ 1111, 1141(c), 4102(a), 4103(a), 7002 · statutory · read in statute*

Each county also elects a **sheriff**, a **register of wills**, a **recorder
of deeds** and a **clerk of the peace**, for four-year terms.

*Del. Const. art. III, § 22 · statutory · read in statute*

**Watch out:** Kent County's governing body is the Levy Court, not a council or
commission. Never describe a common county structure across all three counties.

**Home rule:** each county's powers come from its own chapter of state law. No
law read for this doc gives Delaware counties charters.

### No townships

Our data has no township or "hundred" pages for Delaware. Avoid describing any
government below the county other than cities, towns and school districts.

## City and town government

Delaware has 57 municipal pages in our data, from Wilmington down to very small
towns. Each is governed by its own **charter**, which sets its offices,
election date and candidate rules. Take every municipality's offices, terms
and dates from race data.

*15 Del. C. § 7555(a) · varies by place · read in statute*

### Home rule

A municipality of at least 1,000 people may amend its own charter to take home
rule powers. Smaller places change their charters through the General
Assembly.

*22 Del. C. § 802 · statutory · read in statute*

**Does home rule reach elections?** Only partly. A home rule charter amendment
may not change who can vote in municipal elections or the date of the
municipal election, and may not change an elected official's term until the
incumbent's term ends.

*22 Del. C. § 835(a) · statutory · read in statute*

## Metro and major-place exceptions

### Wilmington

`de/new-castle-county/wilmington`

The only Delaware city whose mayor, council, council president and treasurer
are elected under the state's general election rules, with party nominations.
Its school boards are on separate school district pages.

*15 Del. C. §§ 7501, 7521 · statutory · read in statute*

### New Castle County

`de/new-castle-county`

The only county with an elected executive. Its council president is elected
countywide.

### Cities across county lines

Each of our pages files a city under one county, but some Delaware towns cross
county lines. Our data files Milford under Sussex County. Do not write that a
town lies wholly within the county on its page.

### School pages

Our 16 school district pages sit at the state level (`de/christina-school-district`).
Avoid assigning a school district to a single county from its name.

## Writing rules

These are the ways Delaware copy goes visibly wrong.

1. **Never infer a county from a place name.** No Delaware place page shares a
   name with a different county, but always take the county from the page data.
2. **Use the right calendar for the tier.** County offices: November of
   even-numbered years. School boards: the second Tuesday of May, every year.
   Cities and towns: their charters.
3. **Do not call local races nonpartisan or partisan without naming the tier.**
   County races and Wilmington's are partisan, school board races are
   nonpartisan, other towns follow their charters.
4. Call Delaware primaries closed.
5. Do not mention runoffs. Plurality wins.
6. Do not describe a common county structure. New Castle has an executive and
   council, Kent a Levy Court, Sussex a council.
7. Avoid describing hundreds or townships as governments.
8. Never name an officeholder or a candidate.
9. Avoid anything that changes within a year: who has filed, whether a race is
   contested, filing deadlines, current ballot measures.

## Sources

- **Statutes and constitution:** Delaware Code Online, read in bulk. Each title
  lists its chapters at `https://delcode.delaware.gov/title<n>/index.html`; a
  chapter page (`title<n>/c<ccc>/index.html`) holds the whole chapter or links
  its subchapters (`.../sc<nn>/index.html`), and each title is also one PDF
  (`title<n>/Title<n>.pdf`). The constitution is one page per article at
  `constitution/constitution-<nn>.html`, where `<nn>` is the article number
  plus one (Article II is `constitution-03.html`). Plain requests with a
  browser user agent work. Municipal charters are on a separate site,
  `charters.delaware.gov`, not read for this doc. Read: Title 9 ch. 3, 11,
  15, 41, 61, 70; Title 14 ch. 10; Title 15 ch. 1, 30, 31, 33, 41, 57, 75, 81;
  Title 22 ch. 1, 8; Constitution arts. II, III, V, XV.
- **Currency check:** the section histories in the cited chapters. Title 15
  ch. 81, a state Voting Rights Act, takes effect 1 July 2027 and was not read
  for this doc; re-check partisanship and districting lines after that date.
- **Page data:** goodparty.org sitemap shard 8, 28 October 2026, read in the
  in-app browser.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
