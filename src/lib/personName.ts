// Display casing for names sourced from the civics spine. A large share of
// election-api's Person rows carry an unformatted, entirely-lowercase name
// ("chris lewis"), which reaches the page title, the hero and the JSON-LD
// verbatim. The real fix is upstream normalization; this is the display-time
// guard that keeps an unformatted row from rendering as one.

/**
 * Only an ENTIRELY lowercase string is re-cased. Any uppercase character is
 * taken as evidence the source was already formatted, and the value is returned
 * byte-for-byte.
 *
 * This guard is the whole safety argument. Title-casing is lossy — it cannot
 * distinguish `McDonald` from `Mcdonald`, `DeAngelo` from `Deangelo`, or
 * `van der Berg` from `Van Der Berg` — so applying it to a correctly-cased name
 * destroys information that upstream got right. Restricting it to the one input
 * shape that is unambiguously unformatted means a correct name can never be
 * made incorrect; the worst case is that an unformatted name stays unformatted.
 */
function isUnformatted(name: string): boolean {
	return /[a-z]/.test(name) && name === name.toLowerCase();
}

/**
 * Suffix tokens that are Roman numerals rather than words. Restricted to the
 * range that actually occurs in personal names — beyond `X` the numerals start
 * colliding with real surnames (`Li`, `Mi`, `Di` are not numerals, and a longer
 * list would eventually swallow one).
 *
 * Applied to the FINAL token only. Several entries are also ordinary names in
 * their own right — `Vi` is a common Vietnamese given name and `Ix` a surname —
 * so matching position-blindly turned `vi nguyen` into `VI Nguyen`. A trailing
 * numeral is overwhelmingly a generational suffix; a leading or middle one is
 * overwhelmingly a name.
 *
 * The residual case this cannot reach is a person whose LAST token is one of
 * these words (`nguyen vi` still yields `Nguyen VI`). Nothing in an
 * all-lowercase string separates that from a dropped-period `Nguyen VI`, and
 * the suffix reading is the commoner one in this corpus.
 */
const ROMAN_SUFFIXES = new Set(['ii', 'iii', 'iv', 'vi', 'vii', 'viii', 'ix', 'x']);

/**
 * `Mc` is capitalized on the following letter (`mcdonald` → `McDonald`) because
 * the prefix is essentially always patronymic in English-language name data.
 *
 * `Mac` deliberately gets no such rule: it is a genuine prefix in `MacArthur`
 * but an ordinary word-start in `Mackenzie`, `Mackey` and `Macias`, and nothing
 * in an all-lowercase string distinguishes them. Guessing would corrupt more
 * names than it repaired, so `macdonald` becomes `Macdonald`.
 */
const MC_PREFIX_RE = /^mc([a-z]{2,})$/;

/**
 * Elided prefixes that capitalize the letter after the apostrophe
 * (`o'brien` → `O'Brien`, `d'angelo` → `D'Angelo`).
 *
 * Only these two, and only in the leading position: an interior apostrophe is
 * usually a possessive or a contraction inside a transliteration, where
 * capitalizing the next letter would be wrong.
 *
 * Both the ASCII apostrophe and the curly right single quotation mark (U+2019)
 * are matched, and whichever one arrived is echoed back: CMS round-trips and
 * spreadsheet exports routinely substitute the curly form, and matching only
 * ASCII would drop those names through to the plain path as `O’brien`.
 */
const ELIDED_PREFIX_RE = /^([od])([\u2019'])([a-z].*)$/;

function capitalizeFirst(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Cases one whitespace-delimited token, recursing through hyphens so each half
 * of a compound surname is capitalized (`smith-jones` → `Smith-Jones`).
 */
function formatToken(token: string, isSuffix = false): string {
	if (!token) return token;
	if (isSuffix && ROMAN_SUFFIXES.has(token.replace(/\./g, ''))) return token.toUpperCase();
	// Neither half of a compound surname is in suffix position, so the numeral
	// rule stays off for both.
	if (token.includes('-')) return token.split('-').map(part => formatToken(part)).join('-');

	const [, elidedPrefix, elidedApostrophe, elidedRest] = ELIDED_PREFIX_RE.exec(token) ?? [];
	if (elidedPrefix && elidedApostrophe && elidedRest) {
		return `${elidedPrefix.toUpperCase()}${elidedApostrophe}${capitalizeFirst(elidedRest)}`;
	}

	const [, mcRest] = MC_PREFIX_RE.exec(token) ?? [];
	if (mcRest) return `Mc${capitalizeFirst(mcRest)}`;

	return capitalizeFirst(token);
}

/**
 * Formats a display name for rendering, re-casing only unformatted input.
 *
 * Nobiliary particles (`van`, `de`, `del`, `di`, …) are capitalized like any
 * other token rather than being kept lowercase. From an all-lowercase string
 * there is no way to tell a Dutch tussenvoegsel, which convention lowercases,
 * from a Hispanic compound surname, which US civic records overwhelmingly
 * render capitalized — and the latter is far more common in this corpus. A
 * source that sends `van der Berg` already cased keeps it, via the guard above.
 *
 * Whitespace is normalized because the same rows that arrive uncased also
 * arrive with doubled and trailing spaces.
 *
 * There is deliberately no `string → string` overload: blank and
 * whitespace-only input returns null, so promising a string for every string
 * would hand callers a compile-time guarantee the implementation breaks.
 */
export function formatPersonName(name: null | undefined): null;
export function formatPersonName(name: string | null | undefined): string | null;
export function formatPersonName(name: string | null | undefined): string | null {
	if (name == null) return null;
	const trimmed = name.trim().replace(/\s+/g, ' ');
	if (!trimmed) return null;
	if (!isUnformatted(trimmed)) return trimmed;
	const tokens = trimmed.split(' ');
	// A lone token is the whole name, never a generational suffix — a row
	// carrying only a first name would otherwise render `vi` as `VI`.
	const lastIndex = tokens.length > 1 ? tokens.length - 1 : -1;
	return tokens.map((token, i) => formatToken(token, i === lastIndex)).join(' ');
}
