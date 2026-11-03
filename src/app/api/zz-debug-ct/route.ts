import { type NextRequest, NextResponse } from 'next/server';
import { gpApiAuthHeaders } from '~/lib/electionApiAuth';

// TEMPORARY read-only probe for the Connecticut city investigation. Removed before merge.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const path = searchParams.get('path') ?? 'places';
	if (path !== 'places' && path !== 'races') return NextResponse.json({ error: 'bad path' }, { status: 400 });
	searchParams.delete('path');
	const base = (process.env['GP_API_BASE_URL'] ?? process.env['NEXT_PUBLIC_API_BASE'] ?? 'https://gp-api.goodparty.org').replace(/\/$/, '');
	const res = await fetch(`${base}/v1/elections/${path}?${searchParams}`, { headers: await gpApiAuthHeaders(), cache: 'no-store' });
	return NextResponse.json({ status: res.status, body: await res.json().catch(() => null) });
}
