const DEFAULT_ORIGIN = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://goodparty.org';

function isGoodPartyHost(host: string): boolean {
	return host === 'goodparty.org' || host.endsWith('.goodparty.org');
}

export function isExternalToEcosystem(href: string | undefined | null): boolean {
	if (!href) return false;

	const trimmed = href.trim();
	if (!trimmed) return false;

	// Fragment-only and root-relative paths are always internal.
	if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
		return false;
	}

	const lower = trimmed.toLowerCase();
	if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('sms:')) {
		return false;
	}

	let url: URL;
	try {
		url = new URL(trimmed, DEFAULT_ORIGIN);
	} catch {
		// Malformed URLs are treated as external to be safe.
		return true;
	}

	if (isGoodPartyHost(url.host)) {
		return false;
	}

	return true;
}
