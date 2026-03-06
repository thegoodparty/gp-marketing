import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlacesByState, getPositionById } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	formatElectionDateFromApi,
	formatFilingPeriod,
	getStateName,
} from '~/lib/electionsHelpers';
import { PositionPageContent } from '~/ui/PositionPageContent';

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ state: string; county: string }>;
	searchParams: Promise<{ positionId?: string; name?: string }>;
}) {
	const { state, county } = await params;
	const { positionId, name: nameParam } = await searchParams;

	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode) || !positionId) {
		notFound();
	}

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const counties = await getPlacesByState({ state: stateCode, mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);

	if (!countyPlace) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const countyName = countyPlace.name.replace(/\s+County$/i, '') || countyPlace.name;

	const position = await getPositionById(positionId);

	const officeName =
		position?.position?.name ??
		position?.name ??
		(typeof nameParam === 'string' ? decodeURIComponent(nameParam) : 'Position');
	const electionDate = formatElectionDateFromApi(position?.election?.electionDay);
	const filingDate = formatFilingPeriod(position?.filingPeriods);

	const candidatesHref = `/elections/${countySlug}/position/candidates?positionId=${encodeURIComponent(positionId)}`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: `${countyName} County` },
		{ href: '', label: officeName },
	];

	return (
		<PositionPageContent
			officeName={officeName}
			stateName={stateName}
			countyName={`${countyName} County`}
			electionDate={electionDate || 'TBD'}
			filingDate={filingDate}
			breadcrumbs={breadcrumbs}
			backHref={`/elections/${countySlug}`}
			backLabel={`Back to ${countyName} County elections`}
			candidatesHref={candidatesHref}
		/>
	);
}

export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ state: string; county: string }>;
	searchParams: Promise<{ positionId?: string; name?: string }>;
}): Promise<Metadata> {
	const { state, county } = await params;
	const { name } = await searchParams;
	if (!isValidStateCode(state)) return {};
	const stateName = getStateName(state);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const counties = await getPlacesByState({ state: state.toUpperCase(), mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyName = countyPlace?.name?.replace(/\s+County$/i, '') ?? county;
	const positionName =
		typeof name === 'string' ? decodeURIComponent(name) : 'Position';
	return {
		title: `${positionName} in ${countyName} County, ${stateName} | Good Party`,
		description: `Election details and candidates for ${positionName} in ${countyName} County, ${stateName}.`,
	};
}
