export const GP_ATTRIBUTION_COOKIE = 'gp_attribution';

export const ATTRIBUTION_PARAM_KEYS = [
	'fbclid',
	'gclid',
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_content',
	'utm_term',
] as const;

export type AttributionParamKey = (typeof ATTRIBUTION_PARAM_KEYS)[number];

export type AttributionData = Partial<Record<AttributionParamKey, string>> & {
	_ts?: number;
};

export const APP_GOODPARTY_HOST = 'app.goodparty.org';

const COOKIE_MAX_AGE_SECONDS = 7_776_000;

function isGoodPartyProductionHost(hostname: string): boolean {
	return hostname === 'goodparty.org' || hostname.endsWith('.goodparty.org');
}

export function parseAttributionFromSearch(search: string): AttributionData {
	const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
	const captured: AttributionData = {};

	for (const key of ATTRIBUTION_PARAM_KEYS) {
		const value = params.get(key);
		if (value) {
			captured[key] = value;
		}
	}

	return captured;
}

export function readGpAttributionCookie(cookieHeader?: string): AttributionData | null {
	const source =
		cookieHeader ??
		(typeof document !== 'undefined' ? document.cookie : undefined);
	if (!source) return null;

	const escapedName = GP_ATTRIBUTION_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const cookiePattern = new RegExp(`(?:^|;\\s*)${escapedName}=([^;]*)`);
	const match = cookiePattern.exec(source);
	if (!match?.[1]) return null;

	try {
		const parsed: unknown = JSON.parse(decodeURIComponent(match[1]));
		if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return null;
		}
		return parsed as AttributionData;
	} catch {
		return null;
	}
}

export function mergeAttribution(
	existing: AttributionData | null,
	incoming: AttributionData,
): AttributionData | null {
	const hasIncoming = ATTRIBUTION_PARAM_KEYS.some(key => incoming[key]);
	if (!hasIncoming) {
		return existing;
	}

	const merged: AttributionData = { ...(existing ?? {}) };

	for (const key of ATTRIBUTION_PARAM_KEYS) {
		const value = incoming[key];
		if (value) {
			merged[key] = value;
		}
	}

	if (incoming.fbclid) {
		if (!existing?.fbclid || existing.fbclid !== incoming.fbclid) {
			merged._ts = Date.now();
		} else if (existing._ts != null) {
			merged._ts = existing._ts;
		}
	} else if (existing?._ts != null) {
		merged._ts = existing._ts;
	}

	const hasAttributionParams = ATTRIBUTION_PARAM_KEYS.some(key => merged[key]);
	if (!hasAttributionParams) {
		return existing;
	}

	return merged;
}

export function serializeGpAttributionCookie(data: AttributionData): string {
	return encodeURIComponent(JSON.stringify(data));
}

export function writeGpAttributionCookie(data: AttributionData, hostname: string): void {
	if (typeof document === 'undefined') return;

	const parts = [
		`${GP_ATTRIBUTION_COOKIE}=${serializeGpAttributionCookie(data)}`,
		'path=/',
		`max-age=${COOKIE_MAX_AGE_SECONDS}`,
		'SameSite=Lax',
	];

	if (isGoodPartyProductionHost(hostname)) {
		parts.push('domain=.goodparty.org');
		if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
			parts.push('Secure');
		}
	}

	document.cookie = parts.join('; ');
}

export function captureAttributionFromSearch(search: string, hostname: string): AttributionData | null {
	const incoming = parseAttributionFromSearch(search);
	const hasIncoming = ATTRIBUTION_PARAM_KEYS.some(key => incoming[key]);
	if (!hasIncoming) {
		return readGpAttributionCookie();
	}

	const existing = readGpAttributionCookie();
	const merged = mergeAttribution(existing, incoming);
	if (!merged) return existing;

	writeGpAttributionCookie(merged, hostname);
	return merged;
}

export function isAppGoodPartyUrl(href: string): boolean {
	try {
		const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'https://goodparty.org');
		return url.hostname === APP_GOODPARTY_HOST;
	} catch {
		return false;
	}
}

export function decorateAppUrl(href: string, attribution: AttributionData | null): string {
	if (!attribution || !isAppGoodPartyUrl(href)) {
		return href;
	}

	let url: URL;
	try {
		url = new URL(href);
	} catch {
		return href;
	}

	for (const key of ATTRIBUTION_PARAM_KEYS) {
		const value = attribution[key];
		if (value && !url.searchParams.has(key)) {
			url.searchParams.set(key, value);
		}
	}

	return url.toString();
}

export function decorateAppLinksInDocument(attribution: AttributionData | null, root: ParentNode = document): void {
	if (!attribution || typeof document === 'undefined') return;

	const anchors = root.querySelectorAll<HTMLAnchorElement>(`a[href*="${APP_GOODPARTY_HOST}"]`);
	for (const anchor of anchors) {
		const href = anchor.getAttribute('href');
		if (!href) continue;
		const decorated = decorateAppUrl(href, attribution);
		if (decorated !== href) {
			anchor.href = decorated;
		}
	}
}

export function decorateAppLinkOnClick(event: MouseEvent, attribution: AttributionData | null): void {
	if (!attribution) return;

	const target = event.target;
	if (!(target instanceof Element)) return;

	const anchor = target.closest(`a[href*="${APP_GOODPARTY_HOST}"]`);
	if (!(anchor instanceof HTMLAnchorElement)) return;

	const href = anchor.getAttribute('href');
	if (!href) return;

	const decorated = decorateAppUrl(href, attribution);
	if (decorated !== href) {
		anchor.href = decorated;
	}
}
