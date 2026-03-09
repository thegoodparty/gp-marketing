import { type NextRequest, NextResponse } from 'next/server';
import { getDistrictTypes, getDistrictNames, getPlacesBySlugWithChildren } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	formatElectionDate,
	findCityForDistrictName,
	slugifyPositionName,
} from '~/lib/electionsHelpers';
import type { OfficeItem } from '~/ui/ListOfOfficesBlock';

/**
 * GET /api/elections/county-offices?state=TX&fullSlug=tx/harris-county&year=2026
 * Returns { offices: OfficeItem[] } for the given county and election year.
 */
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const state = searchParams.get('state');
	const fullSlug = searchParams.get('fullSlug');
	const yearParam = searchParams.get('year');

	if (!state || !fullSlug || yearParam == null) {
		return NextResponse.json(
			{ error: 'Missing state, fullSlug, or year' },
			{ status: 400 },
		);
	}

	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode)) {
		return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
	}

	const electionYear = parseInt(yearParam, 10);
	if (Number.isNaN(electionYear) || electionYear < 2000 || electionYear > 2100) {
		return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
	}

	const normalizedSlug = fullSlug.toLowerCase();

	const [districtTypes, placesWithChildren] = await Promise.all([
		getDistrictTypes({ state: stateCode, electionYear }),
		getPlacesBySlugWithChildren({ slug: normalizedSlug, includeChildren: true }),
	]);

	const children = placesWithChildren[0]?.children ?? [];
	const cityTypes = districtTypes.filter(dt => {
		const t = dt.L2DistrictType.toUpperCase();
		return t.includes('CITY') || t.includes('TOWN');
	});
	const cityBaseNames = children.map(c =>
		c.name.replace(/\s+(Town|City|Township|Village)$/i, '').toLowerCase(),
	);

	const districtNamesByType = await Promise.all(
		cityTypes.map(async dt => {
			const names = await getDistrictNames({
				L2DistrictType: dt.L2DistrictType,
				state: stateCode,
				electionYear,
			});
			return names
				.filter(n => {
					const lower = n.L2DistrictName.toLowerCase();
					return cityBaseNames.some(base => lower.includes(base));
				})
				.map(n => {
					const positionSlug = slugifyPositionName(n.L2DistrictName);
					const city = findCityForDistrictName(n.L2DistrictName, children);
					const href = city
						? `/elections/${normalizedSlug}/${city.slug.split('/').pop()}/position/${positionSlug}`
						: `/elections/${normalizedSlug}/position/${positionSlug}`;
					return {
						id: n.id,
						type: dt.L2DistrictType,
						position: n.L2DistrictName,
						nextElectionDate: formatElectionDate(electionYear),
						href,
					};
				});
		}),
	);

	const offices: OfficeItem[] = districtNamesByType.flat();

	return NextResponse.json({ offices });
}
