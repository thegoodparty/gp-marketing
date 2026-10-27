# State election context

One document per state, describing the election system and government structure
that holds across that whole state. These exist to give the location page
editorial generator a **starting point**, so it does not have to research the
same ground on every one of the ~48,000 location pages.

| State | File |
| --- | --- |
| Illinois | [illinois.md](./illinois.md) |
| Iowa | [iowa.md](./iowa.md) |
| Missouri | [missouri.md](./missouri.md) |
| Pennsylvania | [pennsylvania.md](./pennsylvania.md) |
| Ohio | [ohio.md](./ohio.md) |
| Texas | [texas.md](./texas.md) |

44 states and DC still to do. Each doc is a draft until Emily has reviewed it.

## What these are, and what they are not

They are **not** an authority and they are not meant to be complete. They will
not tell you which offices are on a specific ballot or how many seats are up.
That comes from our own race data, which is always better than anything inferred
from one of these files.

What they do give you is the part that is the same for every page in a state:
when local elections are held, whether local races carry a party label, what kind
of primary the state runs, what a county's governing body is called, what a city
or town elects, and which big places break those rules.

## How each file is laid out

Every state file follows the same shape:

1. **How elections work** in that state. Timing, primary type, partisanship.
   Safe on any page in the state.
2. **County government.** The usual governing body, and the cases where it does
   not apply.
3. **Municipal government.** The classes of city, town, village, borough or
   township, and what each elects.
4. **Metro and major-place exceptions.** The places where the general rules are
   wrong. Usually the most useful section for high-traffic pages.
5. **Writing rules.** The specific ways copy for that state goes visibly wrong.
6. **Sources.**

## Reading the source lines

Claims that need them carry a line like:

> *§ 115.121.3 RSMo · statutory · read in statute*

Three parts, in order:

**The citation.** Statutes may be cited by name and number in published copy.

**How universal it is:**

- `statutory`: true for every place of that kind in the state, no exceptions.
- `usual case`: the statutory default, but an individual place may have adopted
  something else. Safe to write in hedged form ("most counties here…"), not as a
  flat statement of law.
- `varies by place`: cannot be derived from anything we hold. Never state it.

**How it was verified:**

- `read in statute`: the statutory text itself was read.
- `read in county charter` / `read in city charter`: the text of the county's or
  city's own charter was read.
- `Secretary of State publication` / `state agency publication`: an official
  state publication, not the statute.
- `local government publication`: an official page or document from the city,
  county or district itself.

## Rules that apply to every state

These hold regardless of which file you are reading.

- **Never name an officeholder or a candidate.**
- **Never infer a county from a place name.** Across these three states, dozens
  of municipalities are named after a county they are not in. The county is
  always in the page data. Take it from there.
- **Do not assume local means nonpartisan.** It is true for Iowa and mostly true
  for Missouri cities, and flatly false everywhere in Pennsylvania.
- **Rules, not dates.** Say "the first Tuesday after the first Monday in April",
  not a calendar date. Copy regenerates annually and every fact in it has to
  still be true in eleven months.
- **Nothing volatile.** No upcoming race counts, who has filed, contested status,
  filing deadlines or current ballot measures.
- **No aggregator sites.** Not as a source and not in published copy.

## How these are made and kept current

New docs and updates follow the `state-context-doc` skill
(`.claude/skills/state-context-doc/SKILL.md`). It holds the fixed list of
questions every state answers and the decisions behind it. In short:

- **Every doc is reviewed by Emily** before it counts as done.
- **School and special districts** fold into "How elections work" as a third
  tier. They do not get a section of their own.
- **No signature counts or filing numbers.** Position pages carry those.
- **Every claim has a verbatim quote** in `research/<state>.json`, and a script
  confirms each quote still appears in the law it cites. Re-running that script
  after a legislative session is the quickest way to find what changed.

Iowa, Missouri and Pennsylvania were written before the question list and the
ledger existed. They have no `research/` file yet and get both at their first
re-check.

## Legislative calendar

Each doc has a "Legislative calendar" section with its next regular session and
a re-check date. Re-check after the session's bills are signed, or earlier if a
special session touches elections or local government.

[`legislative-calendar.md`](./legislative-calendar.md) has the work order for
new docs, every state's 2027 session, and the month-by-month re-check plan.

## Nationwide data

Two files in `research/` were measured once for all 51 from the production
sitemap on 27 October 2026, so no state doc has to count by hand:

- **`pages-by-state.csv`**: location and position pages per state, by tier.
- **`places-named-after-another-county.json`**: the 322 municipal pages whose
  name matches a county in the same state while sitting in a different county.
  Houston (Harris County), Austin (Travis County), Des Moines (Polk County) and
  Jackson, Mississippi (Hinds County) are on it. Copy must take the county from
  the page, never from the place name.

## Where the research came from

The Iowa, Missouri and Pennsylvania files are condensed from a much longer
research pass whose working notes did not survive. For those three, the
citation in each source line is the place to start. Newer docs keep their
evidence in `research/`.
