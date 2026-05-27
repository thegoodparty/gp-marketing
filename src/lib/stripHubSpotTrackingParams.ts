const HUBSPOT_TRACKING_KEYS = ['__hstc', '__hssc', '__hsfp'] as const;

/**
 * If the URL's query string contains HubSpot tracking parameters, returns a new
 * URL with those keys removed. Other query keys are preserved. Returns null if
 * nothing was removed.
 */
export function urlWithoutHubSpotTrackingParams(url: URL): URL | null {
	const next = new URL(url.href);
	let removed = false;
	for (const key of HUBSPOT_TRACKING_KEYS) {
		if (next.searchParams.has(key)) {
			next.searchParams.delete(key);
			removed = true;
		}
	}
	if (!removed) return null;

	const qs = next.searchParams.toString();
	next.search = qs;
	return next;
}
