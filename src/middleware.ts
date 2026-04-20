import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

interface RedirectEntry {
	field_fromUrl?: string;
	field_toUrl?: string;
	field_permanentRedirect?: boolean;
}

const client = createClient({
	projectId: '3rbseux7',
	dataset: 'production',
	apiVersion: '2025-10-08',
	useCdn: true,
});

const QUERY = `*[_type=="goodpartyOrg_redirects"][0].list_redirects[]{field_fromUrl,field_toUrl,field_permanentRedirect}`;

let redirectMap: Map<string, { to: string; permanent: boolean }> | null = null;
let refreshPromise: Promise<void> | null = null;

async function loadRedirects(): Promise<Map<string, { to: string; permanent: boolean }>> {
	const entries = await client.fetch<RedirectEntry[] | null>(QUERY);
	const map = new Map<string, { to: string; permanent: boolean }>();
	if (entries) {
		for (const entry of entries) {
			if (entry.field_fromUrl && entry.field_toUrl) {
				map.set(normalizePath(entry.field_fromUrl), {
					to: entry.field_toUrl,
					permanent: entry.field_permanentRedirect ?? false,
				});
			}
		}
	}
	return map;
}

function normalizePath(path: string): string {
	return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

async function getRedirectMap(): Promise<Map<string, { to: string; permanent: boolean }>> {
	if (redirectMap) return redirectMap;

	if (!refreshPromise) {
		refreshPromise = loadRedirects().then((map) => {
			redirectMap = map;
			refreshPromise = null;
		});
	}
	await refreshPromise;
	return redirectMap!;
}

export function invalidateRedirectCache(): void {
	redirectMap = null;
}

export async function middleware(request: NextRequest): Promise<NextResponse | undefined> {
	const pathname = normalizePath(request.nextUrl.pathname);
	const map = await getRedirectMap();
	const match = map.get(pathname);

	if (match) {
		const destination = match.to.startsWith('http')
			? match.to
			: new URL(match.to, request.url).toString();

		return NextResponse.redirect(destination, match.permanent ? 308 : 307);
	}

	return undefined;
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon\\.ico|api/|studio).*)',
	],
};
