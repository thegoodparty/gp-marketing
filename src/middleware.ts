import { type NextRequest, NextResponse } from 'next/server';

type RedirectMap = Record<string, { to: string; permanent: boolean }>;

function normalizePath(path: string): string {
	return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

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
 * Bootstrap the same cookie shape the Browser SDK uses, forward it on this
 * request, and set it on the response so the client keeps the same device id.
 */
function maybeBootstrapAmplitudeDeviceCookie(
	request: NextRequest,
	pathname: string,
): NextResponse | null {
	if (pathname !== '/') return null;

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
	});

	return response;
}

export async function middleware(request: NextRequest): Promise<NextResponse | undefined> {
	const origin = request.nextUrl.origin;

	let map: RedirectMap;
	try {
		const res = await fetch(`${origin}/api/redirects`);
		if (!res.ok) return undefined;
		map = (await res.json()) as RedirectMap;
	} catch {
		return undefined;
	}

	const pathname = normalizePath(request.nextUrl.pathname);
	const match = map[pathname];

	if (match) {
		const destination = match.to.startsWith('http')
			? match.to
			: new URL(match.to, request.url).toString();

		return NextResponse.redirect(destination, match.permanent ? 308 : 307);
	}

	const bootstrapped = maybeBootstrapAmplitudeDeviceCookie(request, pathname);
	if (bootstrapped) return bootstrapped;

	return undefined;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/|studio).*)'],
};
