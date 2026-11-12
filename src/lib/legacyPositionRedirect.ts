/**
 * The race slug inside an old `/elections/position/...` URL, or null when the
 * path cannot be one. Old URLs also had a `/candidates` listing under each
 * office; it goes to the same office. A race slug is a state plus at least the
 * office, and at most state, county, city, subplace and office.
 */
export const resolveLegacyPositionRaceSlug = (segments: readonly string[]): string | null => {
	const parts = segments.map(s => s.toLowerCase()).filter(Boolean);
	if (parts.at(-1) === 'candidates') parts.pop();
	if (parts.length < 2 || parts.length > 5) return null;
	return parts.join('/');
};
