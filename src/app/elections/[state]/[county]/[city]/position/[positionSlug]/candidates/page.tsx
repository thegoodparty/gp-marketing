import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	COUNTY_MTFCC,
	getCandidacies,
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
	mapCandidacyToCard,
	resolveLocalityName,
} from '~/lib/electionsHelpers';
import { CandidatesPageContent } from '~/ui/CandidatesPageContent';

export default async function Page({
	params,
}: {
	params: Promise<{
		state: string;
		county: string;
		city: string;
		positionSlug: string;
	}>;
}) {
	const { state, county, city, positionSlug } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const raceSlug = buildRaceSlug(state, positionSlug, city);
	const race = await getRaceBySlug(raceSlug);

	if (!race) {
		notFound();
	}

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${city.toLowerCase()}`;

	const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyName = resolveLocalityName(countyPlace, race.Place, countySlug);

	const cityPlaces = await getCityPlacesByCounty({ state: stateCode, countySlug });
	const cityPlace = cityPlaces.find(
		c => c.slug.toLowerCase() === `${state.toLowerCase()}/${city.toLowerCase()}`,
	);

	if (!cityPlace) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const cityName = cityPlace.name;
	const officeName = race.normalizedPositionName ?? race.name ?? 'Position';
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const candidacies = await getCandidacies({ raceSlug });

	const candidates = candidacies.map((c, i) => mapCandidacyToCard(c, i));

	const positionHref = `/elections/${fullSlug}/position/${positionSlug}`;
	const locationHref = `/elections/${fullSlug}`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: countyName },
		{ href: `/elections/${fullSlug}`, label: cityName },
		{ href: '', label: `Candidates for ${officeName}` },
	];

	return (
		<CandidatesPageContent
			officeName={officeName}
			stateName={stateName}
			countyName={countyName}
			cityName={cityName}
			electionDate={electionDate}
			filingDate={filingDate}
			breadcrumbs={breadcrumbs}
			positionHref={positionHref}
			locationHref={locationHref}
			candidates={candidates}
			race={race}
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
	const raceSlug = buildRaceSlug(state, positionSlug, city);
	const race = await getRaceBySlug(raceSlug);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyDisplayName = resolveLocalityName(countyPlace, race?.Place, countySlug);
	const cityPlaces = await getCityPlacesByCounty({ state: stateCode, countySlug });
	const cityPlace = cityPlaces.find(
		c => c.slug.toLowerCase() === `${state.toLowerCase()}/${city.toLowerCase()}`,
	);
	const cityName = cityPlace?.name ?? city;
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	return {
		title: `Candidates for ${positionName} in ${cityName}, ${stateName} | Good Party`,
		description: `View candidates running for ${positionName} in ${cityName}, ${countyDisplayName}, ${stateName}.`,
	};
}
