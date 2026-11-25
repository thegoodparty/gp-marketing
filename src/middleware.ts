import { type NextRequest, NextResponse } from 'next/server';
import { isGoodPartyProductionHost, shouldNoIndexHost } from '~/lib/crawlableHosts';
import { lpRedirectDestination } from '~/lib/lp-redirects';
import { retiredDdhqAnswer } from '~/lib/people-retired-ddhq';
import {
	type RedirectMap,
	fetchRedirectMapFromSanityCdn,
	normalizePath,
} from '~/lib/redirect-map';
import { urlWithoutHubSpotTrackingParams } from '~/lib/stripHubSpotTrackingParams';

/**
 * Browser SDK 2.0 cookie name. Must match {@link AmplitudeCookie.cookieName} in
 * `@amplitude/experiment-node-server` (newFormat: true).
 */
function amplitudeBrowserSdk20CookieName(apiKey: string): string | null {
	if (apiKey.length < 10) return null;
	return `AMP_${apiKey.substring(0, 10)}`;
}

/**
 * Browser SDK 2.0 cookie value. Must match {@link AmplitudeCookie.generate} in
 * `@amplitude/experiment-node-server` (newFormat: true), without Node `Buffer`.
 */
function encodeAmplitudeBrowserSdk20Cookie(deviceId: string): string {
	const json = JSON.stringify({ deviceId });
	const encoded = encodeURIComponent(json);
	return btoa(encoded);
}

/**
 * First-time visitors have no `AMP_*` cookie yet, so SSR cannot bucket them.
 * Runs on every page route the matcher allows so experiments can be resolved
 * server-side on first visit, not just on the homepage. Bootstrap the same
 * cookie shape the Browser SDK uses, forward it on this request, and set it
 * on the response so the client keeps the same device id.
 */
function maybeBootstrapAmplitudeDeviceCookie(request: NextRequest): NextResponse | null {
	const apiKey = process.env['NEXT_PUBLIC_AMPLITUDE_API_KEY'];
	const cookieName = apiKey ? amplitudeBrowserSdk20CookieName(apiKey) : null;
	if (!cookieName) return null;

	if (request.cookies.get(cookieName)?.value) return null;

	const deviceId = crypto.randomUUID();
	const cookieValue = encodeAmplitudeBrowserSdk20Cookie(deviceId);

	const requestHeaders = new Headers(request.headers);
	const preceding = requestHeaders.get('cookie');
	requestHeaders.set(
		'cookie',
		preceding ? `${preceding}; ${cookieName}=${cookieValue}` : `${cookieName}=${cookieValue}`,
	);

	const response = NextResponse.next({
		request: { headers: requestHeaders },
	});

	response.cookies.set(cookieName, cookieValue, {
		path: '/',
		maxAge: 365 * 24 * 60 * 60,
		sameSite: 'lax',
		secure: request.nextUrl.protocol === 'https:',
		...(isGoodPartyProductionHost(request.nextUrl.hostname)
			? { domain: '.goodparty.org' }
			: {}),
	});

	return response;
}

const RETIRED_PROFILE_GONE_BODY =
	'<!doctype html><title>Profile no longer available</title>' +
	'<p>This profile is no longer on GoodParty.org. <a href="/elections">Browse elections we know about</a>.</p>';

export async function middleware(request: NextRequest): Promise<NextResponse> {
	const noIndex = shouldNoIndexHost(request.headers.get('host') ?? request.nextUrl.hostname);
	const withNoIndex = (response: NextResponse): NextResponse => {
		if (noIndex) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
		return response;
	};

	const lpDestination = lpRedirectDestination(request.headers.get('host'), request.nextUrl.pathname);
	if (lpDestination) {
		// Keep the query string so UTM/ad params on old lp links survive the hop.
		const destination = new URL(lpDestination);
		destination.search = request.nextUrl.search;
		return withNoIndex(NextResponse.redirect(destination, 308));
	}

	const withoutHubSpot = urlWithoutHubSpotTrackingParams(request.nextUrl);
	if (withoutHubSpot) {
		return withNoIndex(NextResponse.redirect(withoutHubSpot, 308));
	}

	let map: RedirectMap = {};
	try {
		map = await fetchRedirectMapFromSanityCdn();
	} catch {
		// CMS fetch failed — continue without CMS redirects (still run Amplitude cookie bootstrap).
	}

	const pathname = normalizePath(request.nextUrl.pathname);
	const match = map[pathname];

	if (match) {
		const destination = match.to.startsWith('http')
			? match.to
			: new URL(match.to, request.url).toString();

		return withNoIndex(
			NextResponse.redirect(destination, match.permanent ? 308 : 307),
		);
	}

	// Retired DDHQ-only profiles (see people-retired-ddhq.ts). Answered here, not
	// in the /people route, because a page can only 404; a 410 needs a response.
	// After the CMS map so an editor's redirect for one of these URLs still wins.
	const retired = retiredDdhqAnswer(pathname);
	if (retired?.kind === 'redirect') {
		return withNoIndex(NextResponse.redirect(new URL(retired.destination, request.url), 308));
	}
	if (retired?.kind === 'gone') {
		return withNoIndex(
			new NextResponse(RETIRED_PROFILE_GONE_BODY, {
				status: 410,
				headers: { 'content-type': 'text/html; charset=utf-8' },
			}),
		);
	}

	const bootstrapped = maybeBootstrapAmplitudeDeviceCookie(request);
	if (bootstrapped) return withNoIndex(bootstrapped);

	return withNoIndex(NextResponse.next());
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/|studio).*)'],
};
