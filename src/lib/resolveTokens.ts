export type TokenMap = Record<string, string>;

/**
 * Canonical bracketed placeholders used across the election templates (see the various
 * `build*Tokens` helpers). A token valid for one template type (e.g. `[County]`) can leak
 * literally onto another that doesn't supply it; once we are resolving tokens we blank any
 * of these that went unreplaced so users never see a raw `[token]` in a title or H1.
 */
export const KNOWN_ELECTION_TOKENS = [
	'[State]',
	'[County]',
	'[City]',
	'[District]',
	'[County or City]',
	'[office name]',
	'[office]',
	'[location]',
	'[candidate name]',
] as const;

/**
 * Replace CMS token placeholders in plain strings (e.g. "[office name]").
 * Callers must stegaClean string values before passing them in.
 *
 * Only runs when `tokens` is provided (i.e. on templated election pages); other pages pass
 * no tokens and keep any bracketed text verbatim.
 */
export function resolveTokens(value: string | null | undefined, tokens?: TokenMap): string | undefined {
	if (value == null) return undefined;
	if (!tokens || Object.keys(tokens).length === 0) return value;

	let result = value;
	for (const [token, replacement] of Object.entries(tokens)) {
		if (!token || replacement == null) continue;
		result = result.split(token).join(replacement);
	}

	// Strip any known election token the caller didn't supply, so it doesn't render literally.
	for (const token of KNOWN_ELECTION_TOKENS) {
		if (token in tokens) continue;
		if (!result.includes(token)) continue;
		if (process.env.NODE_ENV !== 'production') {
			console.warn(`[election-template] unresolved token ${token} stripped (not supplied for this page)`);
		}
		result = result.split(token).join('');
	}

	return result;
}
