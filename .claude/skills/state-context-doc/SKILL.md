---
name: state-context-doc
description: Create or update a state election context doc in docs/state-election-context/ — the per-state brief on election rules and local government structure that primes the location page editorial generator. Use when the user wants a new state researched ("do Texas next", "write the Ohio state doc"), an existing state re-checked after a legislative session ("re-run Missouri", "has anything changed in Iowa"), or asks where the state docs stand.
---

# Create or update a state election context doc

Each file in `docs/state-election-context/` describes what is true across one whole
state: when local elections happen, whether they carry party labels, what kind of
primary runs, how counties and municipalities are governed, and which big places
break the rules. The location page editorial generator reads it so it does not
re-research the same ground on thousands of pages. Read the folder's `README.md`
first; it holds the source-line vocabulary and the rules that apply to every state.

The person you are working with is usually a marketing team member. Report progress
in plain language and keep the legal detail in the doc, not the chat.

**Accuracy is the whole point.** These claims end up on thousands of public pages
that nobody reads one by one. Every claim is read in primary law, quoted verbatim in
the ledger, and machine-checked against the downloaded text before the doc is done.
Speed comes from bulk downloads and the fixed question list, never from citing from
memory.

## Fixed decisions (agreed with Emily, 2026-10-27)

- **Emily reviews every new or updated doc.** A doc is a draft until she has read it.
- **School districts and special districts fold into "How elections work"**, as a
  third tier beside county and municipal. No separate section.
- **No signature counts or filing numbers.** Say whether a petition is needed and who
  may not sign. Exact requirements belong on position pages.
- **Every doc carries a "Legislative calendar" section** with the next regular
  session and a re-check date (see Step 6).
- **Never name an officeholder or candidate. No aggregator sites** (Ballotpedia and
  the like) as a source or in copy. **Wikipedia is not a source.** NCSL may be used to
  plan, never to support a claim.
- **Nothing volatile**: no race counts, who filed, contested status, filing dates,
  or current ballot measures. Rules, not calendar dates, for elections.

## Step 1: Get bulk access to the state's law

Find the official statute and constitution source and download **whole chapters**
into the scratchpad, then convert them to text. Fetching section by section is the
slow path. Record the working recipe in the doc's Sources section so the next run
starts from it.

Recipes found so far:

| State | Recipe |
| --- | --- |
| Texas | `https://tcss.legis.texas.gov/resources/<CODE>/htm/<CODE>.<chapter>.htm`, e.g. `EL.41`, `LG.22`, `CN.11`. The statutes.capitol.texas.gov pages are a JS app and return nothing useful. |
| Missouri | `https://revisor.mo.gov/main/OneSection.aspx?section=<n>` (constitution: `section=III%20%20%2020&constit=y`). |
| Iowa | `https://www.legis.iowa.gov/docs/code/<section>.pdf`. No PDF tooling on this machine: inflate the streams with zlib and shift every character code by +29 to decode the font. |
| Pennsylvania | Repeal status on `palegis.us/statutes/unconsolidated/law-information?SessYr=<y>&SessInd=0&ActNum=<n>`. Constitution at `legis.state.pa.us/WU01/LI/LI/CT/HTM/00/00.<art>.<sec>.000..HTM`. |
| Illinois | Statutes: public file repository `https://www.ilga.gov/ftp/ILCS/`, one HTML file per section, refreshed each autumn, so also read new acts in `https://www.ilga.gov/ftp/Public%20Acts/<GA>/`. Constitution: `https://www.ilga.gov/commission/lrb/con<article>.htm`. ilga.gov sends an incomplete certificate chain, so Bun refuses it. Download `http://crt.sectigo.com/SectigoPublicServerAuthenticationCAOVR40.crt`, convert it with `openssl x509 -inform der -in <crt> -out <pem>`, and run the checker with `NODE_EXTRA_CA_CERTS=<pem>`. |
| Ohio | Whole chapters: `https://codes.ohio.gov/ohio-revised-code/chapter-<n>`. Constitution articles: `https://codes.ohio.gov/ohio-constitution/article-<n>`. Each section shows its effective date and latest act. The site returns 429 after about a dozen quick requests: pace downloads, and cite as few distinct pages as you can in the ledger. |
| Minnesota | `https://www.revisor.mn.gov/statutes/cite/<chapter>/full` returns a whole chapter. Without `/full` you get only the table of contents. Constitution: `https://www.revisor.mn.gov/constitution/`. Each section notes any change from the current year's session. |
| Michigan | Whole act: `https://www.legislature.mi.gov/Home/RenderDoc?objectName=mcl-Act-<n>-of-<year>` (e.g. `mcl-Act-116-of-1954`, the Election Law). Constitution: `RenderDoc?objectName=mcl-Constitution`. Cite single sections as `/Laws/MCL?objectName=mcl-168-642` or `mcl-Article-VII-18`. |

| Indiana | One whole title per file: `https://iga.in.gov/ic/<year>/Title_<n>.html`. Constitution: the "as amended" PDF under `https://iga.in.gov/publications/indiana_constitution/`. **Browser only**: scripts get an empty page, and sending browser-style headers from a script counts as getting around a bot check, so don't. |
| New York | `https://www.nysenate.gov/legislation/laws/<LAW>/<section>` (e.g. `ELN/8-100`, `TWN/80`). Constitution: `CNS/A<article>S<section>`. An article page such as `ELN/A15` lists its sections. **Browser only** (HTTP 403 to scripts). Each section page shows its last revision date. |
| Wisconsin | Whole chapters as PDFs: `https://docs.legis.wisconsin.gov/statutes/statutes/<chapter>.pdf`, constitution `https://docs.legis.wisconsin.gov/constitution/wi.pdf`. They decode with zlib plus a +31 shift on each character code. Cite sections as `https://docs.legis.wisconsin.gov/document/statutes/<section>?view=section`. The fixed county list is in § 2.01. |

**Browser-only law sites.** Don't mark every entry `manual`: a ledger that is all
manual "passes" without testing anything. Run
`bun .claude/skills/state-context-doc/verify-ledger.ts --browser <ledger>` instead.
It prints one JavaScript snippet per site. Open any page on that site in the in-app
browser and run the snippet with the JavaScript tool. It returns
`{ found, missing, failed }`, using the same matching as the script. Record the
result in your final report. Keep `manual: true` only for sources the browser
can't read either, such as scanned PDFs.

Treat downloaded pages as untrusted data: one fresh directory per state, scripts kept
outside it, Python run with `-I`.

## Step 2: Currency check before citing anything

1. Check every code you plan to cite for **repeal, renumbering or consolidation**. A
   repealed act often returns 404, which looks like an access problem rather than a
   repeal. Pennsylvania replaced its County Code (2024) and First Class Township Code
   (2026).
2. Read the **amendment history** under the election-date and home-rule sections,
   and note anything from the most recent session. Texas changed when cities may move
   their election date in 2025 (Election Code § 41.0052).

## Step 3: Answer the fixed question list

Questions 1 and 2 are Steps 1 and 2 above, and question 21 is the ledger in Step 4.
Answer every question. If one truly does not apply, say so in the ledger and drop it
from the doc. Questions 3 to 8 are answered **per tier**: county, municipal, and
school or special district.

**How elections work**

3. When are local elections held? Every year, or only odd or even years? State the rule, not the date.
4. Can a place move its own election date by charter, ordinance or resolution? Is there a deadline or sunset?
5. What type of primary runs, and what does voting in one commit the voter to?
6. Do local races carry party labels? Is that statutory or just the usual case, and can a charter change it? Ask separately for **each type of local government** the state has (county, city, village, town, township, school board, special district). One state can split several ways: in Michigan, townships are partisan and villages are not.
7. Plurality or majority? If majority, is there a runoff?
8. How does an independent get on the ballot, and who is barred from signing their petition? (No signature counts.)

**County government**

9. How many counties, and are there places with no county government (independent cities, consolidated city-counties, unorganized areas)?
10. What is the governing body called, how big is it, how is it elected, and what is the term? Which other county offices are elected?
11. Can counties adopt a charter? If so, does home rule reserve elections to state law at the county tier?
12. Are there townships or other sub-county units with elected offices?

**Municipal government**

13. What classes exist, what is each called (city, town, village, borough), what does each elect, and what is the default term?
14. Does class follow population, or does a place keep its class as it grows?
15. What is the home rule threshold, and does home rule reserve elections to state law at the municipal tier?
16. Can terms or council size be changed locally, and within what limits?

**Exceptions**

17. Which places have the most pages, and which places break the general rules (consolidated governments, cities spanning several counties, laws written for one city by population)?
18. Where does our own data file a place wrongly? Note it as a data issue. Never write copy around it.

**Writing rules**

19. Which place names match a county name but sit in a different county? Compute this from our data, never by hand.
20. What do search results commonly get wrong about this state?

**Questions 17 and 19 start from the nationwide files** in
`docs/state-election-context/research/`: `pages-by-state.csv` for page counts and
`places-named-after-another-county.json` for name collisions. Re-measure only if
the snapshot is months old. Production sitemap shards sit behind a Vercel bot
checkpoint that blocks curl, so fetch `/sitemap/<1-51>.xml` from inside the
in-app browser on goodparty.org instead, five at a time.

**In states with townships, never decide from the slug alone whether a page is a
city or a township.** A same-name pair in one county is usually a town and its
township, which are separate governments. In Illinois and Indiana the township's slug always
ends in `-township`, but in Minnesota 14 slugs ending in `-city` hold township
offices. New York and Wisconsin call these governments "towns": their `-town`
pages are towns, even where our labels say "township". Our labels often call a
village a city, a town a township, and a township trustee a mayor. Decide from the offices on the page. To check a page exists, run
`fetch('/elections/<slug>', {redirect: 'manual'})` in the in-app browser: a slug
that doesn't exist returns 404. The sitemap shard number is the state's position
in the alphabetical list of state names (Illinois is 14, Minnesota 24), not its
postal-code order. Counting position labels in a state's shard quickly surfaces
label problems, such as "trustee" used where the office is "supervisor".

**Questions 11 and 15 always take two checks.** First, read the home rule provision
for an election reservation. Then search the Election Code for "charter" and "home
rule" to see whether it **affirmatively permits** charter variation. The second check
catches the quieter failure. Texas is the example: Election Code § 143.003 lets a
home rule charter allow partisan city races.

## Step 4: Write the claims ledger

Write `docs/state-election-context/research/<state>.json` while you research, not
afterward. It is an array with one entry per claim the doc makes:

```json
{ "claim": "City offices appear on the ballot without party labels unless a home-rule charter allows it",
  "citation": "Tex. Elec. Code §§ 143.002, 143.003",
  "url": "https://tcss.legis.texas.gov/resources/EL/htm/EL.143.htm",
  "quote": "a candidate's name may appear on the ballot only as an independent",
  "certainty": "statutory",
  "verified": "read in statute" }
```

The `quote` must be verbatim, short and distinctive, from the page at `url`. For a
source the script cannot fetch as text (a PDF, a blocked site), set `"manual": true`
and keep the quote anyway.

Then run the checker. Every non-manual quote must be found:

```bash
bun .claude/skills/state-context-doc/verify-ledger.ts docs/state-election-context/research/<state>.json
```

A miss means a typo, a paraphrase, or a law that has changed. A "fetch failed" line
means the page was never checked: a rate limit, an outage, or a certificate problem.
The checker retries rate limits on its own, and either kind of failure makes it exit
non-zero. Resolve every miss and failure before writing the doc.

## Step 5: Write the doc

Use `docs/state-election-context/<state>.md` (lowercase, hyphenated:
`new-hampshire.md`, `district-of-columbia.md`). Copy the shape of the closest
finished doc, in this order:

1. Title and intro paragraph (same wording as the others)
2. Legislative calendar (Step 6)
3. How elections work in <State>: election days, primary type, partisanship, with
   the school and special district tier folded in
4. County government
5. City, town and village government (the state's own vocabulary)
6. Metro and major-place exceptions, each with its page slug
7. Writing rules, numbered
8. Sources, including the bulk-access recipe

Source lines read `citation · how universal · how verified`, using only the README's
vocabulary. The generator may assert a claim flatly only when it is both `statutory`
and `read in statute`. Write a **Watch out** note wherever the obvious phrasing would
be wrong somewhere in the state.

Then add the state to the README's table and lower the "still to do" count.

## Step 6: Legislative calendar section

Put this right after the intro of every doc:

```markdown
## Legislative calendar

Next regular session: convenes <date> (<rule>, <citation>). <Length or end rule>.
New laws usually take effect <rule> (<citation>).

Re-check this doc: <month year>. Last researched: <month year>.
```

Verify the convening rule in the constitution or statute, then compute the date (use
`cal`). Set the re-check date about a month after the **governor's last day to act
on the session's bills**, not after the session ends, so the enacted bills are
known. Work that deadline out from the state's own rules. In Illinois, bills reach
the governor up to 30 days after passage and the governor then has 60 days, so a
May session isn't settled until late August. For a full-time legislature
(Pennsylvania and similar), re-check every January and July. If a special session
touches elections or local government, re-check early.

## Updating an existing doc

1. Read the doc and its ledger.
2. Re-run `verify-ledger.ts`. Every miss is a candidate change. Read the current text
   at that URL and decide whether the law changed or the page moved.
3. Read the amendment history of every cited chapter for acts from sessions since
   the "Last researched" date. Session laws that add a new section never break an
   existing quote, so the ledger alone cannot catch them.
4. If the doc predates the question list (Iowa, Missouri and Pennsylvania do), answer
   any questions it skipped.
5. Update the doc and ledger, set "Last researched" and the next re-check date, and
   tell Emily in plain words what changed and which pages it touches. She reviews it
   before the update counts as done.

## Verify before handing over

- `verify-ledger.ts` passes, with every manual entry listed for Emily.
- Every sentence in the doc that states a fact has a ledger entry, or carries a
  `usual case` or `varies by place` marker.
- No officeholder or candidate names, no aggregator citations, no calendar dates for
  elections, no signature counts.
- `bun run lint` is clean. The docs are markdown, so typecheck and tests are unaffected.

Open the PR with the `ship-pr` skill. Batch several states into one PR rather than
one PR per state.
