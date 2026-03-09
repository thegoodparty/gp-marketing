/**
 * Build elections page href from location segments.
 */
export function buildElectionsHref(segments: {
	state: string;
	county?: string;
	city?: string;
}): string {
	const parts = ['/elections', segments.state.toLowerCase()];
	if (segments.county) parts.push(segments.county.toLowerCase());
	if (segments.city) parts.push(segments.city.toLowerCase());
	return parts.join('/');
}

/**
 * Build position detail page href.
 */
export function buildPositionHref(state: string, positionId: string): string {
	return `/elections/${state.toLowerCase()}/position?positionId=${encodeURIComponent(positionId)}`;
}
