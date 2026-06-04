# Elections limitations — upstream validation report

**Validated:** 4 June 2026  
**API base:** `https://election-api.goodparty.org`  
**Site checked:** `https://goodparty.org` (localhost unavailable; same election-api base as local dev)  
**Baseline:** [`elections-known-limitations.md`](elections-known-limitations.md) (May 2026 audit)  
**Machine report:** `.reports/elections-limitations/` (local JSON, gitignored — regenerate with validate script)

**Re-run:**

```bash
node scripts/elections-limitations/validate.mjs --api-only
node scripts/elections-limitations/validate.mjs --skip-scan --site-url https://goodparty.org
```

---

## Executive summary

Upstream ETL work shows **partial improvement**, not full resolution.

- **LIM-02 (duplicate fun facts)** improved nationally: **20,201 → 18,495** (−1,706 pairs, ~8%).
- **Priority LIM-01 anchors fixed:** Kanawha WV, Fairfax VA, and Jefferson Parish LA now have municipal children in the API and city lists on production.
- **LIM-01 national count worsened:** **251 → 281** (+30 counties). Net new gaps outpaced fixes in the scan (notably AL +7, VA +3, WV +3, CO +2).
- **Priority LIM-01 still open:** Braxton WV, Haines AK, and `wv/gassaway` (404).
- **Priority LIM-02 still open:** Fernley and Smith Valley NV still duplicate Lyon County on all five fact fields.
- **Harris TX:** 27 fallback cities (May baseline was 29+); minor list shrink — monitor, not a functional break.
- **Production UI gaps:** Braxton/Haines do not yet show the empty-municipal copy; Fernley/Smith Valley still show facts despite duplicate API data. These match **gp-marketing mitigations not yet deployed to production**, not upstream regression.

**Verdict:** Data team fixes landed for high-priority counties (Fairfax, Kanawha, Jefferson) and reduced systemic LIM-02 volume, but the documented limitations are **not fully resolved**. Continue ETL work on remaining LIM-01/LIM-02 anchors and deploy gp-marketing guardrails to production for correct UX on unfixed rows.

---

## National scan vs baseline

| Metric | May 2026 | 4 Jun 2026 | Δ |
|--------|----------|------------|---|
| LIM-01 counties | 251 | **281** | +30 |
| LIM-02 city–county pairs | 20,201 | **18,495** | −1,706 |
| Orphan `countyName` cities | 203 | **194** | −9 |
| Fallback-only counties | ~1,600 | **1,570** | −30 |
| Hierarchy-only counties | 9 | **9** | 0 |

### LIM-01 by state (4 Jun 2026)

AL 29, AK 13, CA 3, CO 29, GA 8, HI 4, KY 2, LA 5, ME 1, MD 7, MO 6, MT 4, NE 2, NV 6, NM 1, NY 4, NC 1, ND 6, OK 11, PA 1, SC 1, SD 11, TN 5, TX 22, UT 1, VA 60, WV 32, WI 5, WY 1.

Notable deltas vs May 2026 appendix: VA 57→60, WV 29→32, AL 22→29, CO 27→29.

---

## Anchor results (API)

| ID | Label | Pass | Evidence |
|----|-------|------|----------|
| LIM-01 | Braxton WV | **No** | `cityLargest`: Gassaway; merged children: 0 |
| LIM-01 | Kanawha WV | **Yes** | 12 cities (Charleston, South Charleston, Dunbar, …) |
| LIM-01 | Fairfax VA | **Yes** | 5 places (Herndon, Vienna, Clifton, …) |
| LIM-01 | Jefferson LA | **Yes** | 6 places (Kenner, Gretna, Westwego, …) |
| LIM-01 | Haines AK | **No** | `cityLargest`: Haines; merged children: 0 |
| LIM-01 | Gassaway WV | **No** | `GET /v1/places?slug=wv/gassaway` → 404 |
| LIM-02 | Fernley NV | **No** | All 5 fact fields = Lyon County (pop 22343) |
| LIM-02 | Smith Valley NV | **No** | All 5 fact fields = Lyon County |
| LIM-02 | Yerington NV (control) | **Yes** | pop 3093 vs county 22343 |
| LIM-04 | Lyon NV | **Yes** | 3 merged: Smith Valley, Fernley, Yerington |
| LIM-04 | Harris TX | **Marginal** | 27 fallback cities (baseline expected 29+) |
| LIM-03 | Hartford CT | **Yes** | 26 hierarchy towns |
| LIM-03 | Androscoggin ME | **Yes** | 2 nested towns |

---

## Anchor results (UI — production)

| Page | API | UI | Note |
|------|-----|-----|------|
| [Braxton WV](https://goodparty.org/elections/wv/braxton-county) | Open | No empty message | Marketing empty-state UX not on prod |
| [Kanawha WV](https://goodparty.org/elections/wv/kanawha-county) | Fixed | City list visible | Matches API fix |
| [Fairfax VA](https://goodparty.org/elections/va/fairfax-county) | Fixed | City list visible | Matches API fix |
| [Jefferson LA](https://goodparty.org/elections/la/jefferson-parish) | Fixed | City list visible | Matches API fix |
| [Haines AK](https://goodparty.org/elections/ak/haines-borough) | Open | No empty message | Marketing empty-state UX not on prod |
| [Fernley NV](https://goodparty.org/elections/nv/lyon-county/fernley) | Open | Facts visible | Guardrail not on prod (should hide) |
| [Smith Valley NV](https://goodparty.org/elections/nv/lyon-county/smith-valley) | Open | Facts visible | Guardrail not on prod |
| [Yerington NV](https://goodparty.org/elections/nv/lyon-county/yerington) | OK | Facts visible | Control OK |
| [Lyon NV](https://goodparty.org/elections/nv/lyon-county) | OK | Fernley + Yerington linked | Regression guard pass |

---

## Resolved since May 2026 (priority anchors)

| County | May 2026 | Jun 2026 |
|--------|----------|----------|
| `wv/kanawha-county` | LIM-01 — 0 children | **12 municipal places** via fallback |
| `va/fairfax-county` | LIM-01 — 0 children | **5 municipal places** |
| `la/jefferson-parish` | LIM-01 — 0 children | **6 municipal places** |

---

## Remaining limitations (priority)

### LIM-01 — municipal places missing

- `wv/braxton-county` — `cityLargest`: Gassaway; no merged children; `wv/gassaway` still 404
- `ak/haines-borough` — `cityLargest`: Haines; no merged children
- **281 counties nationally** still match LIM-01 pattern (see national scan)

Verify Braxton:

```bash
curl -sS "$BASE/v1/places?slug=wv/braxton-county&includeChildren=true&placeColumns=slug,name,cityLargest,mtfcc"
curl -sS "$BASE/v1/places?slug=wv/gassaway&placeColumns=slug,name"
```

### LIM-02 — duplicate fun facts

- `nv/fernley` vs `nv/lyon-county` — population, density, income, unemployment, homeValue all identical
- `nv/lyon-county/smith-valley` vs county — same
- **18,495 pairs nationally** (down from 20,201)

Verify Fernley:

```bash
curl -sS "$BASE/v1/places?slug=nv/fernley&placeColumns=slug,population,density,incomeHouseholdMedian,unemploymentRate,homeValue"
curl -sS "$BASE/v1/places?slug=nv/lyon-county&placeColumns=slug,population,density,incomeHouseholdMedian,unemploymentRate,homeValue"
```

### LIM-05/07 — orphan `countyName`

- **194 cities** (down from 203); CT planning regions and AK borough labels still dominate samples

---

## Regression checks

| Check | Result |
|-------|--------|
| Lyon NV merge | PASS — 3 cities |
| Harris TX fallback | MARGINAL — 27 cities (was 29+) |
| Hartford CT hierarchy | PASS — 26 towns |
| Androscoggin ME hierarchy | PASS — 2 towns |
| Yerington control | PASS — distinct facts |

---

## Recommendations

1. **ETL:** Continue LIM-01 ingest for Braxton/Gassaway, Haines, and remaining WV/VA/AL counties; localize Fernley and Smith Valley demographics (LIM-02).
2. **gp-marketing:** Deploy county empty-list messaging and city-facts guardrail to production so open limitations render correctly until ETL completes.
3. **Docs:** [`elections-known-limitations.md`](elections-known-limitations.md) updated with Jun 2026 scan counts and resolved anchor rows.
4. **Re-validate:** After next ETL place release, re-run `node scripts/elections-limitations/validate.mjs --api-only`.

---

## Appendix — LIM-01 sample (first 15)

| Slug | cityLargest |
|------|-------------|
| `al/pickens-county` | Aliceville |
| `al/sumter-county` | Livingston |
| `al/lawrence-county` | Moulton |
| `al/chilton-county` | Clanton |
| `al/greene-county` | Eutaw |
| `al/lowndes-county` | Fort Deposit |
| `al/bullock-county` | Union Springs |
| `al/randolph-county` | Roanoke |
| `al/henry-county` | Headland |
| `al/fayette-county` | Fayette |
| `al/butler-county` | Greenville |
| `al/clay-county` | Lineville |
| `al/dale-county` | Ozark |
| `al/conecuh-county` | Evergreen |
| `al/marion-county` | Hamilton |
