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
	buildRaceSlug,
	formatElectionDateFromApi,
	formatFilingPeriodFromRace,
	getStateName,
	resolveLocalityName,
} from '~/lib/electionsHelpers';
import { toAbsoluteUrl } from '~/lib/url';
import { PositionPageContent } from '~/ui/PositionPageContent';

export const revalidate = 3600;

export async function generateStaticParams() {
	return [];
}

export default async function Page({
	params,
}: {
	params: Promise<{ state: string; county: string; city: string; positionSlug: string }>;
}) {
	const { state, county, city, positionSlug } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	// Some races have 4-part slugs (state/county/city/position) instead of 3-part
	// (state/city/position). Try 3-part first for the common case, then fall back.
	let race = await getRaceBySlug(buildRaceSlug(state, positionSlug, city));
	if (!race) race = await getRaceBySlug(buildRaceSlug(state, positionSlug, county, city));
	if (!race) notFound();

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${city.toLowerCase()}`;

	const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);

	if (!countyPlace) {
		notFound();
	}

	// Cities queried by G4110 (incorporated places). Non-incorporated places (e.g. WI townships
	// which are G4040) won't appear in that list, so fall back to the place on the race itself.
	const cityPlaces = await getCityPlacesByCounty({ state: stateCode, countySlug });
	const cityPlace =
		cityPlaces.find(c => c.slug.toLowerCase() === `${state.toLowerCase()}/${city.toLowerCase()}`) ??
		race.Place ??
		null;
	if (!cityPlace) notFound();

	const stateName = getStateName(stateCode);
	const cityName = cityPlace.name;
	const officeName = race.normalizedPositionName ?? race.name ?? 'Position';
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const candidatesHref = `/elections/${fullSlug}/position/${positionSlug}/candidates`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: countyPlace.name },
		{ href: `/elections/${fullSlug}`, label: cityName },
		{ href: '', label: officeName },
	];

	const pageUrl = toAbsoluteUrl(`/elections/${fullSlug}/position/${positionSlug}`);

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
		positionSlug: string;
	}>;
}): Promise<Metadata> {
	const { state, county, city, positionSlug } = await params;
	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode)) return {};
	const stateName = getStateName(stateCode);
	let race = await getRaceBySlug(buildRaceSlug(state, positionSlug, city));
	if (!race) race = await getRaceBySlug(buildRaceSlug(state, positionSlug, county, city));
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
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	return {
		title: `${positionName} in ${cityName}, ${stateName} | Good Party`,
		description: `Election details and candidates for ${positionName} in ${cityName}, ${countyDisplayName}, ${stateName}.`,
	};
}
