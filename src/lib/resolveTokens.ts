export type TokenMap = Record<string, string>;

/**
 * Replace CMS token placeholders in plain strings (e.g. "[office name]").
 * Callers must stegaClean string values before passing them in.
 */
export function resolveTokens(value: string | null | undefined, tokens?: TokenMap): string | undefined {
	if (value == null) return undefined;
	if (!tokens || Object.keys(tokens).length === 0) return value;

	let result = value;
	for (const [token, replacement] of Object.entries(tokens)) {
		if (!token || replacement == null) continue;
		result = result.split(token).join(replacement);
	}
	return result;
}
