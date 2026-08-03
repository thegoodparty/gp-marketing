import { type NextRequest, NextResponse } from 'next/server';

const ELECTION_API_BASE = process.env['ELECTIONS_API_BASE_URL'] ?? 'https://election-api.goodparty.org';

const GP_API_BASE =
	process.env['GP_API_BASE_URL'] ??
	process.env['NEXT_PUBLIC_API_BASE'] ??
	ELECTION_API_BASE.replace('election-api', 'gp-api');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERSON_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ClaimBody = { personId?: string; email?: string; firstname?: string };

/**
 * POST /api/people/claim-request
 * Same-origin proxy for the unclaimed-profile modal's "notify / claim" form.
 * Forwards to gp-api's public claim-request endpoint server-side so the browser
 * never calls gp-api cross-origin and the API base stays off the client.
 */
export async function POST(request: NextRequest) {
	let body: ClaimBody;
	try {
		body = (await request.json()) as ClaimBody;
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { personId, email, firstname } = body;

	if (!personId || !PERSON_ID_PATTERN.test(personId)) {
		return NextResponse.json({ error: 'Invalid personId' }, { status: 400 });
	}
	if (!email || !EMAIL_PATTERN.test(email)) {
		return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
	}

	const endpoint = `${GP_API_BASE.replace(/\/$/, '')}/v1/public-person-profiles/claim-request`;

	try {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				personId,
				requesterEmail: email,
				...(firstname ? { requesterName: firstname } : {}),
			}),
		});
		if (!res.ok) {
			const isClientError = res.status >= 400 && res.status < 500;
			return NextResponse.json({ error: 'Claim request failed' }, { status: isClientError ? res.status : 502 });
		}
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: 'Claim request failed' }, { status: 502 });
	}
}
