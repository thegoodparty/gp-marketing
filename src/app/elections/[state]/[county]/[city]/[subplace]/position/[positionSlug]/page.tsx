import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	COUNTY_MTFCC,
	getCityPlacesByCounty,
	getPlacesByState,
	getRaceBySlug,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	formatElectionDateFromApi,
	formatFilingPeriodFromRace,
	getStateName,
	resolveLocalityName,
} from '~/lib/electionsHelpers';
import { getCachedElectionRouteParams } from '~/lib/sitemap-entries';
import { toAbsoluteUrl } from '~/lib/url';
import { PositionPageContent } from '~/ui/PositionPageContent';

export const revalidate = 3600;

/** 5-part API slug: state/county/city/subplace/positionSlug */
function buildFivePartRaceSlug(
	state: string,
	county: string,
	city: string,
	subplace: string,
	positionSlug: string,
): string {
	return `${state.toLowerCase()}/${county.toLowerCase()}/${city.toLowerCase()}/${subplace.toLowerCase()}/${positionSlug}`;
}

function humanizeSegment(segment: string): string {
	return segment
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

export async function generateStaticParams() {
	const { subplacePositionParams } = await getCachedElectionRouteParams();
	return subplacePositionParams;
}

export default async function Page({
	params,
}: {
	params: Promise<{
		state: string;
		county: string;
		city: string;
		subplace: string;
		positionSlug: string;
	}>;
}) {
	const { state, county, city, subplace, positionSlug } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const raceSlug = buildFivePartRaceSlug(state, county, city, subplace, positionSlug);
	const race = await getRaceBySlug(raceSlug);
	if (!race) notFound();

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const cityPathSlug = `${countySlug}/${city.toLowerCase()}`;
	const pathBeforePosition = `${cityPathSlug}/${subplace.toLowerCase()}`;

	const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);

	if (!countyPlace) {
		notFound();
	}

	const cityPlaces = await getCityPlacesByCounty({ state: stateCode, countySlug });
	const cityPlace =
		cityPlaces.find(c => c.slug.toLowerCase() === `${state.toLowerCase()}/${city.toLowerCase()}`) ??
		race.Place ??
		null;
	if (!cityPlace) notFound();

	const subplaceLabel =
		race.Place && race.Place.slug?.toLowerCase().endsWith(`/${subplace.toLowerCase()}`)
			? race.Place.name
			: humanizeSegment(subplace);

	const stateName = getStateName(stateCode);
	const cityName = cityPlace.name;
	const officeName = race.normalizedPositionName ?? race.name ?? 'Position';
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const candidatesHref = `/elections/${pathBeforePosition}/position/${positionSlug}/candidates`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: countyPlace.name },
		{ href: `/elections/${cityPathSlug}`, label: cityName },
		{ href: '', label: subplaceLabel },
		{ href: '', label: officeName },
	];

	const pageUrl = toAbsoluteUrl(`/elections/${pathBeforePosition}/position/${positionSlug}`);

	return (
		<PositionPageContent
			officeName={officeName}
			stateName={stateName}
			countyName={countyPlace.name}
			cityName={cityName}
			electionDate={electionDate}
			filingDate={filingDate}
			breadcrumbs={breadcrumbs}
			candidatesHref={candidatesHref}
			race={race}
			pageUrl={pageUrl}
		/>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{
		state: string;
		county: string;
		city: string;
		subplace: string;
		positionSlug: string;
	}>;
}): Promise<Metadata> {
	const { state, county, city, subplace, positionSlug } = await params;
	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode)) return {};
	const stateName = getStateName(stateCode);
	const raceSlug = buildFivePartRaceSlug(state, county, city, subplace, positionSlug);
	const race = await getRaceBySlug(raceSlug);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyDisplayName = resolveLocalityName(countyPlace, race?.Place, countySlug);
	const cityPlaces = await getCityPlacesByCounty({ state: stateCode, countySlug });
	const cityPlace =
		cityPlaces.find(c => c.slug.toLowerCase() === `${state.toLowerCase()}/${city.toLowerCase()}`) ??
		race?.Place ??
		null;
	const cityName = cityPlace?.name ?? city;
	const subplaceLabel =
		race?.Place && race.Place.slug?.toLowerCase().endsWith(`/${subplace.toLowerCase()}`)
			? race.Place.name
			: humanizeSegment(subplace);
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	return {
		title: `${positionName} in ${subplaceLabel}, ${cityName}, ${stateName} | Good Party`,
		description: `Election details and candidates for ${positionName} in ${subplaceLabel}, ${cityName}, ${countyDisplayName}, ${stateName}.`,
	};
}
