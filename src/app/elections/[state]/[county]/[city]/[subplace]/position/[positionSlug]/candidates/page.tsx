import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	COUNTY_MTFCC,
	getCandidacies,
	getCityPlacesByCounty,
	getPlacesByState,
	getSubplaceRaceBySlug,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
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
		subplace: string;
		positionSlug: string;
	}>;
}) {
	const { state, county, city, subplace, positionSlug } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const race = await getSubplaceRaceBySlug({ state, county, city, subplace, positionSlug });
	if (!race) notFound();

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const cityPathSlug = `${countySlug}/${city.toLowerCase()}`;
	const pathBeforePosition = `${cityPathSlug}/${subplace.toLowerCase()}`;

	const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyName = resolveLocalityName(countyPlace, race.Place, countySlug);

	const cityPlaces = await getCityPlacesByCounty({ state: stateCode, countySlug });
	const cityPlace =
		cityPlaces.find(c => c.slug.toLowerCase() === `${state.toLowerCase()}/${city.toLowerCase()}`) ??
		race.Place ??
		null;
	if (!cityPlace) notFound();

	const isRealSubplace =
		race.Place?.slug?.toLowerCase().endsWith(`/${subplace.toLowerCase()}`) ?? false;

	const stateName = getStateName(stateCode);
	const cityName = cityPlace.name;
	const officeName = race.normalizedPositionName ?? race.name ?? 'Position';
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const candidacies = await getCandidacies({ raceSlug: race.slug });

	const candidates = candidacies.map((c, i) => mapCandidacyToCard(c, i));

	const positionHref = `/elections/${pathBeforePosition}/position/${positionSlug}`;
	const locationHref = `/elections/${cityPathSlug}`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: countyName },
		{ href: `/elections/${cityPathSlug}`, label: cityName },
		...(isRealSubplace ? [{ href: '', label: race.Place!.name }] : []),
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
		subplace: string;
		positionSlug: string;
	}>;
}): Promise<Metadata> {
	const { state, county, city, subplace, positionSlug } = await params;
	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode)) return {};
	const stateName = getStateName(stateCode);
	const race = await getSubplaceRaceBySlug({ state, county, city, subplace, positionSlug });
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
	const isRealSubplace =
		race?.Place?.slug?.toLowerCase().endsWith(`/${subplace.toLowerCase()}`) ?? false;
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	if (isRealSubplace) {
		const subplaceName = race!.Place!.name;
		return {
			title: `Candidates for ${positionName} in ${subplaceName}, ${cityName}, ${stateName} | Good Party`,
			description: `View candidates running for ${positionName} in ${subplaceName}, ${cityName}, ${countyDisplayName}, ${stateName}.`,
		};
	}
	return {
		title: `Candidates for ${positionName} in ${cityName}, ${stateName} | Good Party`,
		description: `View candidates running for ${positionName} in ${cityName}, ${countyDisplayName}, ${stateName}.`,
	};
}
