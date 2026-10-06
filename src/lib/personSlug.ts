// Public /people/<base>-<id8> slug construction. Split out of peopleProfile so
// the elections position/candidates pages can build a person URL without
// importing the profile loader (which imports electionsHelpers, so the reverse
// import would close a cycle).

/**
 * Apostrophes are DELETED rather than folded to a separator, because the
 * election-api mart's `Person.slug` deletes them: the real slug for
 * "Robert O'Brien" is `robert-obrien`, not `robert-o-brien`. Folding to `-`
 * produced a near-miss base that the /people resolver answered with a 308 to
 * the real slug — so every O'/D' name cost an extra redirect hop on links built
 * from a name rather than read off the spine row.
 *
 * Periods go the same way for the same reason, which is what makes initials
 * work: "T.J. McSparrin" is `tj-mcsparrin` in the mart, and treating `.` as a
 * separator gave `t-j-mcsparrin`.
 *
 * Every apostrophe-shaped character has to be listed, because NFKD decomposes
 * none of them: an unlisted one falls through to the `[^a-z0-9]+` separator rule
 * and lands back on the near-miss path. So alongside the ASCII apostrophe this
 * deletes both curly quotation marks (U+2018/U+2019, which CMS round-trips and
 * spreadsheet exports routinely substitute for a typed apostrophe) and the two
 * modifier letters (U+02BB okina, U+02BC), which is the correctly-encoded
 * apostrophe in Hawaiian names like `Kaialii Kahele`.
 *
 * The 4,993 live candidacy names this was checked against carry only ASCII
 * apostrophes today, so the rest are defensive — but they cost nothing and the
 * failure they prevent is silent.
 *
 * Deliberately NOT here: the grave accent and the prime (U+2032). Both get typed
 * for an apostrophe occasionally, but neither is one, and there is no mart
 * evidence for how it slugs them — a separator stays the safer default.
 */
const DELETED_PUNCTUATION_RE = /[\u2018\u2019\u02bb\u02bc'.]/g;

export function slugifyName(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(DELETED_PUNCTUATION_RE, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * First 8 hex chars of the personId — the stable, collision-safe slug suffix.
 * The election-api resolves /people/<base>-<id8> by an indexed range scan on the
 * id PK, so this suffix (not the non-unique base slug) is the real lookup key.
 */
export function personIdSuffix(personId: string): string {
	return personId.replace(/-/g, '').slice(0, 8).toLowerCase();
}

/**
 * Builds the public `<base>-<id8>` slug from an already-slugified base.
 *
 * Idempotent, because the two kinds of base this is called with disagree about
 * whether the suffix is already there: a name-derived base (`slugifyName`) never
 * carries it, while the election-api mart's `Person.slug` already ends in it.
 * Appending unconditionally produced `jane-doe-11111111-11111111` for every
 * person sourced from the spine — pages still resolved (the resolver reads the
 * *trailing* 8 hex either way), but the canonical URL, the og:url, the sitemap
 * entries and every inter-profile link carried the doubled suffix, and the clean
 * URL cost a redirect hop to reach it.
 */
export function buildPersonSlugFromBase(base: string, personId: string): string {
	const suffix = personIdSuffix(personId);
	if (!base || base === suffix) return suffix;
	return base.endsWith(`-${suffix}`) ? base : `${base}-${suffix}`;
}

/**
 * Builds the public `first-last-<id8>` slug for a person from a display name.
 *
 * Only for callers that hold a personId but have no spine row to read
 * `Person.slug` off — the candidacy feed is the main one. Prefer the row's own
 * slug wherever it is available: the name on a candidacy row and the name on the
 * person row do diverge (`Eugene Bice` against `ej-bice`, `Kristine Douglas`
 * against `kristi-douglas`), and no slug rule can reconcile that. Those names
 * land on a 307 to the canonical URL, which is still one hop better than routing
 * the link through /candidate.
 */
export function buildPersonSlug(name: string, personId: string): string {
	return buildPersonSlugFromBase(slugifyName(name), personId);
}
