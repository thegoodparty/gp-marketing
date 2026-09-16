import { normalizePath } from '~/lib/redirect-map';

/**
 * Landing pages from the retired Unbounce account lived on lp.goodparty.org, and
 * Unbounce served their redirects itself. With the account gone, the host points
 * at this app, which must answer for the old marketing links. These stay in code
 * (not the CMS redirects document) because that map is path-only: `/serve` must
 * redirect on lp.goodparty.org while still rendering on goodparty.org.
 */
export const LP_HOSTNAME = 'lp.goodparty.org';

const LP_FALLBACK_DESTINATION = 'https://goodparty.org/';

const LP_REDIRECTS: Record<string, string> = {
	'/voter-data': 'https://goodparty.org/voter-data',
	'/sms-tools': 'https://goodparty.org/sms-tools',
	'/yard-signs': 'https://goodparty.org/yard-signs',
	'/serve': 'https://goodparty.org/serve',
	'/circle-community': 'https://goodparty.org/community',
	'/website-builder': LP_FALLBACK_DESTINATION,
	'/pricing-page': 'https://goodparty.org/pricing',
	'/template-library': 'https://goodparty.org/templates',
	'/e-book': 'https://goodparty.org/e-book',
	'/pro-lp': 'https://goodparty.org/pro-lp',
	'/pro-demo': 'https://goodparty.org/pro-demo',
	'/iva': 'https://goodparty.org/iva',
	'/sticker-recipient': 'https://goodparty.org/sticker-recipient',
};

// Takes the Host header, not nextUrl.hostname — the latter is always the bound
// address (e.g. localhost) in `next dev`, so host-based routing would silently
// never match locally.
export const lpRedirectDestination = (hostHeader: string | null, pathname: string): string | null => {
	const hostname = hostHeader?.split(':')[0]?.toLowerCase();
	if (hostname !== LP_HOSTNAME) return null;
	return LP_REDIRECTS[normalizePath(pathname)] ?? LP_FALLBACK_DESTINATION;
};
