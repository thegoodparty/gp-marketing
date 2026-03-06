import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	getPlacesByState,
	getPlacesBySlugWithChildren,
	getPositionById,
} from '~/lib/electionsApi';
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
	params: Promise<{ state: string; county: string; municipality: string }>;
	searchParams: Promise<{ positionId?: string; name?: string }>;
}) {
	const { state, county, municipality } = await params;
	const { positionId, name: nameParam } = await searchParams;

	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode) || !positionId) {
		notFound();
	}

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${municipality.toLowerCase()}`;

	const counties = await getPlacesByState({ state: stateCode, mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);

	if (!countyPlace) {
		notFound();
	}

	const countyName = countyPlace.name.replace(/\s+County$/i, '') || countyPlace.name;

	const placesWithChildren = await getPlacesBySlugWithChildren({
		slug: countySlug,
		includeChildren: true,
	});
	const children = placesWithChildren[0]?.children ?? [];
	const municipalityPlace = children.find(c => c.slug.toLowerCase() === fullSlug);

	if (!municipalityPlace) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const cityName = municipalityPlace.name;

	const position = await getPositionById(positionId);

	const officeName =
		position?.position?.name ??
		position?.name ??
		(typeof nameParam === 'string' ? decodeURIComponent(nameParam) : 'Position');
	const electionDate = formatElectionDateFromApi(position?.election?.electionDay);
	const filingDate = formatFilingPeriod(position?.filingPeriods);

	const candidatesHref = `/elections/${fullSlug}/position/candidates?positionId=${encodeURIComponent(positionId)}`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: `${countyName} County` },
		{ href: `/elections/${fullSlug}`, label: cityName },
		{ href: '', label: officeName },
	];

	return (
		<PositionPageContent
			officeName={officeName}
			stateName={stateName}
			countyName={`${countyName} County`}
			cityName={cityName}
			electionDate={electionDate || 'TBD'}
			filingDate={filingDate}
			breadcrumbs={breadcrumbs}
			backHref={`/elections/${fullSlug}`}
			backLabel={`Back to ${cityName} elections`}
			candidatesHref={candidatesHref}
		/>
	);
}

export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ state: string; county: string; municipality: string }>;
	searchParams: Promise<{ positionId?: string; name?: string }>;
}): Promise<Metadata> {
	const { state, county, municipality } = await params;
	const { name } = await searchParams;
	if (!isValidStateCode(state)) return {};
	const stateName = getStateName(state);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${municipality.toLowerCase()}`;
	const counties = await getPlacesByState({ state: state.toUpperCase(), mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyName = countyPlace?.name?.replace(/\s+County$/i, '') ?? county;
	const placesWithChildren = await getPlacesBySlugWithChildren({
		slug: countySlug,
		includeChildren: true,
	});
	const children = placesWithChildren[0]?.children ?? [];
	const municipalityPlace = children.find(c => c.slug.toLowerCase() === fullSlug);
	const cityName = municipalityPlace?.name ?? municipality;
	const positionName =
		typeof name === 'string' ? decodeURIComponent(name) : 'Position';
	return {
		title: `${positionName} in ${cityName}, ${stateName} | Good Party`,
		description: `Election details and candidates for ${positionName} in ${cityName}, ${countyName} County, ${stateName}.`,
	};
}
