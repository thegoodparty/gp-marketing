import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

const DEFAULT_PORTAL_ID = '21589597';

type SubmissionBody = {
	formId?: string;
	firstname?: string;
	lastname?: string;
	email?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/hubspot/newsletter
 * Forwards a native newsletter submission to HubSpot's Forms Submissions API,
 * preserving visitor attribution via the `hubspotutk` cookie. Replaces the
 * iframe embed so the form can be styled to match the site.
 */
export async function POST(request: NextRequest) {
	let body: SubmissionBody;
	try {
		body = (await request.json()) as SubmissionBody;
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { formId, firstname, lastname, email } = body;

	if (!formId) {
		return NextResponse.json({ error: 'Missing formId' }, { status: 400 });
	}
	if (!email || !EMAIL_PATTERN.test(email)) {
		return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
	}

	const portalId = process.env['NEXT_PUBLIC_HUBSPOT_PORTAL_ID'] ?? DEFAULT_PORTAL_ID;
	const hutk = (await cookies()).get('hubspotutk')?.value;

	const fields = [
		{ objectTypeId: '0-1', name: 'firstname', value: firstname ?? '' },
		{ objectTypeId: '0-1', name: 'lastname', value: lastname ?? '' },
		{ objectTypeId: '0-1', name: 'email', value: email },
	].filter(field => field.value !== '');

	const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

	const hubspotResponse = await fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			fields,
			context: {
				...(hutk ? { hutk } : {}),
				pageUri: request.headers.get('referer') ?? undefined,
			},
		}),
	});

	const result = await hubspotResponse.json().catch(() => ({}));

	if (!hubspotResponse.ok) {
		return NextResponse.json({ error: 'HubSpot submission failed', details: result }, { status: hubspotResponse.status });
	}

	return NextResponse.json({ ok: true });
}
