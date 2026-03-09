import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
	COUNTY_MTFCC,
	getPlacesByState,
	getPlacesBySlugWithChildren,
	getRaceBySlug,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	buildRaceSlug,
	formatElectionDateFromApi,
	formatFilingPeriodFromRace,
	getStateName,
} from '~/lib/electionsHelpers';
import { toAbsoluteUrl } from '~/lib/url';
import { PositionPageContent } from '~/ui/PositionPageContent';

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

	const raceSlug = buildRaceSlug(state, positionSlug, county, city);
	const race = await getRaceBySlug(raceSlug);

	if (!race && !county.endsWith('-county')) {
		const retrySlug = buildRaceSlug(state, positionSlug, `${county}-county`, city);
		const retryRace = await getRaceBySlug(retrySlug);
		if (retryRace) {
			redirect(
				`/elections/${state.toLowerCase()}/${county}-county/${city.toLowerCase()}/position/${positionSlug}`,
			);
		}
	}

	if (!race) {
		notFound();
	}

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${city.toLowerCase()}`;

	const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
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
	const cityPlace = children.find(c => c.slug.toLowerCase() === fullSlug);

	if (!cityPlace) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const cityName = cityPlace.name;
	const officeName = race.normalizedPositionName ?? race.name ?? 'Position';
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const candidatesHref = `/elections/${fullSlug}/position/${positionSlug}/candidates`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: `${countyName} County` },
		{ href: `/elections/${fullSlug}`, label: cityName },
		{ href: '', label: officeName },
	];

	const pageUrl = toAbsoluteUrl(`/elections/${fullSlug}/position/${positionSlug}`);

	return (
		<PositionPageContent
			officeName={officeName}
			stateName={stateName}
			countyName={`${countyName} County`}
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
	const raceSlug = buildRaceSlug(state, positionSlug, county, city);
	const race = await getRaceBySlug(raceSlug);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${city.toLowerCase()}`;
	const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyName = countyPlace?.name?.replace(/\s+County$/i, '') ?? county;
	const placesWithChildren = await getPlacesBySlugWithChildren({
		slug: countySlug,
		includeChildren: true,
	});
	const children = placesWithChildren[0]?.children ?? [];
	const cityPlace = children.find(c => c.slug.toLowerCase() === fullSlug);
	const cityName = cityPlace?.name ?? city;
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	return {
		title: `${positionName} in ${cityName}, ${stateName} | Good Party`,
		description: `Election details and candidates for ${positionName} in ${cityName}, ${countyName} County, ${stateName}.`,
	};
}
