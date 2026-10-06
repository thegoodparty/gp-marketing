import { type NextRequest, NextResponse } from 'next/server';
import { resolvePlace } from '~/lib/resolvePlace';
import { isValidStateCode } from '~/constants/usStateCodes';

/**
 * GET /api/elections/resolve-place?city=&county=&state=
 * Resolves a visitor-chosen place to an existing /elections/... URL via a
 * city -> county -> state fallback ladder. Returns 200 with { error: 'unresolved' }
 * when nothing resolves — that outcome is a payload state, not an HTTP failure.
 */
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const city = searchParams.get('city')?.trim() || undefined;
	const county = searchParams.get('county')?.trim() || undefined;
	const stateParam = searchParams.get('state')?.trim() || undefined;

	if (stateParam && !isValidStateCode(stateParam)) {
		return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
	}

	const result = await resolvePlace({ city, county, state: stateParam });
	return NextResponse.json(result);
}
