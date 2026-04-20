import { type NextRequest, NextResponse } from 'next/server';

type RedirectMap = Record<string, { to: string; permanent: boolean }>;

function normalizePath(path: string): string {
	return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
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

	return undefined;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/|studio).*)'],
};
