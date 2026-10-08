import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	COUNTY_MTFCC,
	getCandidaciesOrNull,
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
	joinPlaceNames,
	mapCandidacyToCard,
	resolveLocalityName,
} from '~/lib/electionsHelpers';
import { SITE_NAME, toAbsoluteUrl } from '~/lib/url';
import { renderElectionsCandidatesPage } from '~/lib/renderElectionsCandidatesPage';
import { currentCycleCandidacies, heroCandidatesFromCandidacies } from '~/lib/positionHeroCandidates';
import { officeDisplayName } from '~/lib/officeDisplayName';

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
	const isRealCity = isRealPlaceSegment(cityPlace.slug, city);

	const stateName = getStateName(stateCode);
	const cityName = cityPlace.name;
	const officeName = officeDisplayName(race, race.Place);
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const candidacies = await getCandidaciesOrNull({ raceSlug: race.slug });

	const candidates = currentCycleCandidacies(candidacies ?? [], { raceElectionDate: race?.electionDate }).map((c, i) => mapCandidacyToCard(c, i));
	const heroCandidates = candidacies ? await heroCandidatesFromCandidacies(candidacies, { raceElectionDate: race?.electionDate }) : undefined;

	const positionHref = `/elections/${pathBeforePosition}/position/${positionSlug}`;
	// A joint office in the city slot has no location page of its own — that path 404s —
	// so the CTA falls back to the county, which is the nearest place that does resolve.
	const locationHref = isRealCity ? `/elections/${cityPathSlug}` : `/elections/${countySlug}`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: countyName },
		...(isRealCity ? [{ href: `/elections/${cityPathSlug}`, label: cityName }] : []),
		...(isRealSubplace ? [{ href: '', label: race.Place!.name }] : []),
		{ href: '', label: `Candidates for ${officeName}` },
	];

	return renderElectionsCandidatesPage({
		placeSlug: pathBeforePosition,
		raceSlug: race.slug,
		officeName,
		stateName,
		countyName,
		cityName: isRealCity ? cityName : undefined,
		electionDate,
		filingDate,
		breadcrumbs,
		positionHref,
		locationHref,
		candidates,
		race,
		heroCandidates,
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
	// Either slot can resolve to the race's own place, so the names are deduplicated rather than
	// joined blindly; see joinPlaceNames.
	const placePhrase = isRealCity ? joinPlaceNames(cityName, countyDisplayName) : countyDisplayName;
	const isRealSubplace =
		race?.Place?.slug?.toLowerCase().endsWith(`/${subplace.toLowerCase()}`) ?? false;
	const positionName = (race ? officeDisplayName(race, race.Place) : 'Position');
	const canonical = toAbsoluteUrl(
		`/elections/${countySlug}/${city.toLowerCase()}/${subplace.toLowerCase()}/position/${positionSlug}/candidates`,
	);
	if (isRealSubplace) {
		const subplaceName = race!.Place!.name;
		// The same slots again, with the subplace ahead of them; any two can be one place.
		const locationPhrase = joinPlaceNames(subplaceName, isRealCity ? cityName : null, countyDisplayName);
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
