# Hawaii: state election context

Starting point for the location page editorial generator. This gives you the
structure that holds across Hawaii so you do not have to research the same ground
on every page. It is not an authority: per-page specifics, like which offices are
actually on this ballot and how many seats, come from our own race data, which
always beats anything inferred from here.

Source lines read: `citation · how universal · how verified`. See the
[README](./README.md) for what those mean. Every claim below has a verbatim quote
in [`research/hawaii.json`](./research/hawaii.json).

**The one thing to know first:** in our data Hawaii has only two layers of
elected government: the state and four counties (Hawaii, Honolulu, Kauai and
Maui). We have **no city, town, township or school district pages** for Hawaii,
and school boards are not elected (see Schools). Our Honolulu races are labeled
"City/County". Every elected county office (mayor,
council, and in most counties a prosecuting attorney) runs under the county's own
charter. Our data has just five Hawaii location pages: the state and the four
counties.

## Legislative calendar

Next regular session: convenes 20 January 2027 (10 a.m. on the third Wednesday in
January, every year, Haw. Const. art. III, § 10). A regular session is limited to
sixty days, with up to fifteen more by extension, which puts adjournment in late
April or early May. The governor can call a special session, and so can the presiding officers at the
written request of two-thirds of each house. For bills presented ten or more days before adjournment, the
governor has ten days. For bills presented later or after adjournment, the
governor has **forty-five days after adjournment**, and must give ten days'
notice of any intended veto; Saturdays, Sundays and holidays are not counted
(art. III, § 16). So the session's bills are not settled until about mid-July.

Re-check this doc: August 2027. Last researched: October 2026.

## How elections work in Hawaii

Safe on any Hawaii page.

### Election days

The **general election** is the first Tuesday after the first Monday in November
of even-numbered years. The **primary** is the second Saturday of August in
even-numbered years, and only candidates nominated in the primary may run in the
general. County offices are on these same ballots.

*Haw. Const. art. II, § 8; HRS § 12-2 · statutory · read in statute*

**Watch out:** the Hawaii primary is on a **Saturday**, not a Tuesday.

### Primary type

Hawaii's primary is **open**. No voter has to state a party preference to vote.
Each voter receives every party's ballot and the nonpartisan ballot, and may vote
for one party's candidates or only for nonpartisan candidates.

*Haw. Const. art. II, § 4; HRS § 12-31 · statutory · read in statute*

### County races and partisanship

County offices are set by each county's charter, and charter provisions on a
county's structure override statutes. Our race data lists all eleven county races
(mayor, council and prosecuting attorney) as **nonpartisan**. Follow race data for
each race's label; do not describe party nominations for county offices.

*Haw. Const. art. VIII, § 2 · varies by place · read in statute*

A candidate for county office who is unopposed after the primary is declared
elected at the primary, so some county races end in August.

*HRS § 12-41(a) · statutory · read in statute*

A nonpartisan candidate advances to the general election with at least 10 percent
of the primary vote for the office (or a vote equal to the lowest partisan
nominee's), up to the number of seats.

*HRS § 12-41(b) · statutory · read in statute*

**Watch out:** do not say every county race goes to November. Some are decided in
the August primary. Exactly how each county decides a race in the primary is set
by its charter, which was not read for this doc; take the outcome from race data.

### Getting on the ballot

Every candidate, partisan or nonpartisan, files a nomination paper to appear on
the primary ballot. A voter may sign the nomination papers of only one candidate
for the same office (or as many as there are seats).

*HRS §§ 12-3(a), 12-4(a) · statutory · read in statute*

## County government

The Legislature creates the counties and gives them their powers by general law.
Each county may adopt a self-government charter, and its charter governs the
structure of its executive and legislature, subject to laws of statewide concern.
Counties alone tax real property, except Kalawao County.

*Haw. Const. art. VIII, §§ 1, 2, 3, 6 · statutory · read in statute*

Each of the four counties elects a **mayor** and a **county council** (Honolulu's
are the "City and County" mayor and council). Hawaii, Honolulu and Kauai counties
also elect a **prosecuting attorney**; our Maui County page has no prosecuting
attorney race. Council size, terms and districts come from each charter; take
them from race data.

**Kalawao County** has no page in our data. Do not describe it.

## Schools

Hawaii has one statewide public school system governed by a **board of education
appointed by the governor** with Senate consent. There are no local school
districts or school board elections. Never describe a local school board race in
Hawaii.

*Haw. Const. art. X, §§ 2, 3 · statutory · read in statute*

## Metro and major-place exceptions

### Honolulu

`hi/honolulu-county`

Our race labels say "City/County Mayor", "City/County Council" and
"City/County Prosecuting Attorney", and our data has no separate city page. Write
it as one government.

### Hawaii, Maui and Kauai counties

`hi/hawaii-county`, `hi/maui-county`, `hi/kauai-county`

Each is governed under its own charter. Place names such as Hilo, Kahului or Lihue
are not separate governments.

## Writing rules

These are the ways Hawaii copy goes visibly wrong.

1. **Never describe a city, town or school board government in Hawaii.** Our data
   has only the state and the four counties, and the school board is appointed.
2. The primary is the **second Saturday in August**; do not call it a Tuesday.
3. Do not call Hawaii primaries closed. Voters do not declare a party.
4. Follow race data on whether a county race is partisan, and do not describe
   party nominations for county offices.
5. Some county races are decided at the August primary; do not say every county
   race goes to November.
6. Write Honolulu as one City and County government. Never describe a separate
   city council and county council.
7. Never name an officeholder or a candidate.
8. Avoid anything that changes within a year: who has filed, whether a race is
   contested, filing deadlines, current ballot measures.

## Sources

- **Statutes and constitution:** Hawaii Legislature,
  `https://www.capitol.hawaii.gov/hrscurrent/`. Each volume and chapter is a plain
  directory listing (for example `.../Vol01_Ch0001-0042F/HRS0012/`), with one page
  per section, `HRS_<chapter>-<section>.htm` (e.g. `HRS_0012-0002.htm`). The
  constitution is in the same tree, `.../Vol01_Ch0001-0042F/05-CONST/CONST_<article>-<section>.htm`
  (e.g. `CONST_0003-0010.htm`). The old `.../HRS_0046-0001_0001.htm` style links
  are dead. **Browser only:** the site's security service returns 403 to scripts,
  so the plain checker reports every entry as a failed fetch. Verified instead
  with `verify-ledger.ts --browser`, run in the in-app browser on
  `www.capitol.hawaii.gov` on 28 October 2026: 26 found, 0 missing, 0 failed. Read:
  HRS chapters 11, 12 and § 50-1; Constitution articles II, III, VIII, X.
- **County charters** were not read (the counties post them as PDFs); county
  partisanship and structure are left to race data.
- **Currency check:** not separately checked against the 2026 session laws. HRS
  § 12-3 shows a version changing on 1 January 2028; the quote used is in the
  current version.
- **Page data:** goodparty.org sitemap shard 12, 28 October 2026, read in the
  in-app browser.

Aggregator sites were not used and must not appear in published copy. Statutes
may be cited by name and number.
