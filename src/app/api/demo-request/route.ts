import { type NextRequest, NextResponse } from 'next/server';

// The qualifier's address is fixed here on purpose. It used to be a Sanity field, which
// would have let any Studio account point the browser's PII POST at an arbitrary host.
const QUALIFIER_URL = process.env['DEMO_QUALIFIER_URL'] ?? 'https://demo-qualifier-production.up.railway.app/qualify';

const MAX_BODY_BYTES = 8 * 1024;

/**
 * POST /api/demo-request
 * Same-origin proxy for the Demo Request block. Forwards the form answers to the
 * demo qualifier service server-side so the browser never calls it cross-origin and
 * the destination cannot be changed from content.
 */
export async function POST(request: NextRequest) {
	const raw = await request.text();
	if (raw.length > MAX_BODY_BYTES) {
		return NextResponse.json({ error: 'Request too large' }, { status: 413 });
	}
	let body: unknown;
	try {
		body = JSON.parse(raw);
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}
	if (typeof body !== 'object' || body === null || Array.isArray(body)) {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	// The qualifier rate-limits per visitor IP; without this every request would look
	// like it came from Vercel. Vercel sets x-real-ip from the TCP connection and appends
	// the same address as the LAST x-forwarded-for entry; anything to the left of it is
	// visitor-supplied and untrusted.
	const forwarded = request.headers.get('x-forwarded-for')?.split(',').map(s => s.trim()).filter(Boolean);
	const clientIp = request.headers.get('x-real-ip')?.trim() || forwarded?.at(-1);

	try {
		const res = await fetch(QUALIFIER_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(clientIp ? { 'X-Forwarded-For': clientIp } : {}),
			},
			body: JSON.stringify(body),
		});
		const payload: unknown = await res.json().catch(() => null);
		if (!res.ok) {
			const isClientError = res.status >= 400 && res.status < 500;
			const message =
				isClientError && typeof payload === 'object' && payload !== null && typeof (payload as { error?: unknown }).error === 'string'
					? (payload as { error: string }).error
					: 'Demo request failed';
			return NextResponse.json({ error: message }, { status: isClientError ? res.status : 502 });
		}
		return NextResponse.json(payload ?? { error: 'Demo request failed' }, { status: payload ? 200 : 502 });
	} catch {
		return NextResponse.json({ error: 'Demo request failed' }, { status: 502 });
	}
}
