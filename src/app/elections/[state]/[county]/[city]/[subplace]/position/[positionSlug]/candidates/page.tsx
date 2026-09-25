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
	isRealPlaceSegment,
	mapCandidacyToCard,
	resolveLocalityName,
} from '~/lib/electionsHelpers';
import { SITE_NAME, toAbsoluteUrl } from '~/lib/url';
import { renderElectionsCandidatesPage } from '~/lib/renderElectionsCandidatesPage';

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

	return renderElectionsCandidatesPage({
		placeSlug: pathBeforePosition,
		raceSlug: race.slug,
		officeName,
		stateName,
		countyName,
		cityName,
		electionDate,
		filingDate,
		breadcrumbs,
		positionHref,
		locationHref,
		candidates,
		race,
	});
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
	// A joint office fills the city slot with an office name, and the place then resolves to the
	// county, so naming it as both city and county would say the county twice.
	const isRealCity = isRealPlaceSegment(cityPlace?.slug, city);
	// Equal names mean the city and county slots resolved to the same place, which happens on a
	// district nested under the city slot: the race's own place fills both, so the join would
	// read "Dutton/Brady K-12 Schools, Dutton/Brady K-12 Schools".
	const placePhrase =
		isRealCity && cityName !== countyDisplayName ? `${cityName}, ${countyDisplayName}` : countyDisplayName;
	const isRealSubplace =
		race?.Place?.slug?.toLowerCase().endsWith(`/${subplace.toLowerCase()}`) ?? false;
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	const canonical = toAbsoluteUrl(
		`/elections/${countySlug}/${city.toLowerCase()}/${subplace.toLowerCase()}/position/${positionSlug}/candidates`,
	);
	if (isRealSubplace) {
		const subplaceName = race!.Place!.name;
		// Same collapse one level up. Either slot below can fall back to the race's own place, so
		// compare against the names placePhrase was built from rather than against the joined
		// string: "Brady K-12, Teton County" matches neither slot but already carries the subplace.
		const alreadyNamed = subplaceName === cityName || subplaceName === countyDisplayName;
		const locationPhrase = alreadyNamed ? placePhrase : `${subplaceName}, ${placePhrase}`;
		return {
			title: `Candidates for ${positionName} in ${locationPhrase}, ${stateName} | ${SITE_NAME}`,
			description: `View candidates running for ${positionName} in ${locationPhrase}, ${stateName}.`,
			alternates: { canonical },
		};
	}
	return {
		title: `Candidates for ${positionName} in ${placePhrase}, ${stateName} | ${SITE_NAME}`,
		description: `View candidates running for ${positionName} in ${placePhrase}, ${stateName}.`,
		alternates: { canonical },
	};
}
