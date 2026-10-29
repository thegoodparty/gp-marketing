import type { Metadata } from 'next';
import { displayPlaceName } from '~/lib/placeDisplayName';
import { notFound, permanentRedirect } from 'next/navigation';
import {
	COUNTY_MTFCC,
	getCityPlacesByCounty,
	getPlacesByState,
	getSubplaceRaceBySlug,
	isCityOrTownMtfcc,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	formatElectionDateFromApi,
	formatFilingPeriodFromRace,
	getStateName,
	isRealPlaceSegment,
	joinPlaceNames,
	resolveLocalityName,
} from '~/lib/electionsHelpers';
import { getCachedElectionRouteParams } from '~/lib/sitemap-entries';
import { SITE_NAME, toAbsoluteUrl } from '~/lib/url';
import { renderElectionsPositionPage } from '~/lib/renderElectionsPositionPage';
import { positionPageMetadata, resolvePositionHeroState } from '~/lib/positionHeroState';
import { loadPositionHeroCandidates } from '~/lib/positionHeroCandidates';
import { officeDisplayName } from '~/lib/officeDisplayName';

export const revalidate = 3600;

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

	const race = await getSubplaceRaceBySlug({ state, county, city, subplace, positionSlug });
	if (!race) notFound();

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;

	// "Rainy Creek/Cheyenne Township" is one place whose slash split its slug, not a city and a
	// subplace. Its page lives under the last segment; see resolveElectionPositionFromRaceSlug.
	const racePlaceSlug = race.Place?.slug?.toLowerCase();
	const splitPlaceSlugs = [
		`${countySlug}/${city.toLowerCase()}/${subplace.toLowerCase()}`,
		`${state.toLowerCase()}/${city.toLowerCase()}/${subplace.toLowerCase()}`,
	];
	if (isCityOrTownMtfcc(race.Place?.mtfcc) && racePlaceSlug && splitPlaceSlugs.includes(racePlaceSlug)) {
		permanentRedirect(`/elections/${countySlug}/${subplace.toLowerCase()}/position/${positionSlug}`);
	}
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

	const isRealSubplace =
		race.Place?.slug?.toLowerCase().endsWith(`/${subplace.toLowerCase()}`) ?? false;
	const isRealCity = isRealPlaceSegment(cityPlace.slug, city);

	const heroCandidates = await loadPositionHeroCandidates(race.slug, { raceElectionDate: race.electionDate });
	const stateName = getStateName(stateCode);
	const cityName = displayPlaceName(cityPlace.name);
	const officeName = officeDisplayName(race, race.Place);
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: countyPlace.name },
		...(isRealCity ? [{ href: `/elections/${cityPathSlug}`, label: cityName }] : []),
		...(isRealSubplace ? [{ href: '', label: race.Place!.name }] : []),
		{ href: '', label: officeName },
	];

	const pageUrl = toAbsoluteUrl(`/elections/${pathBeforePosition}/position/${positionSlug}`);

	return renderElectionsPositionPage({
		placeSlug: pathBeforePosition,
		raceSlug: race.slug,
		officeName,
		stateName,
		countyName: countyPlace.name,
		cityName: isRealCity ? cityName : undefined,
		electionDate,
		filingDate,
		breadcrumbs,
		race,
		heroCandidates,
		pageUrl,
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
	const cityName = displayPlaceName(cityPlace?.name ?? city);
	// A joint office fills the city slot with an office name, and the place then resolves to the
	// county, so naming it as both city and county would say the county twice.
	const isRealCity = isRealPlaceSegment(cityPlace?.slug, city);
	// Either slot can resolve to the race's own place, so the names are deduplicated rather than
	// joined blindly; see joinPlaceNames.
	const placePhrase = isRealCity ? joinPlaceNames(cityName, countyDisplayName) : countyDisplayName;
	const isRealSubplace =
		race?.Place?.slug?.toLowerCase().endsWith(`/${subplace.toLowerCase()}`) ?? false;
	const positionName = (race ? officeDisplayName(race, race.Place) : 'Position');
	// The same resolver the page's hero and content block read, so the title cannot name a different phase.
	const positionState = resolvePositionHeroState({
		filingDateStart: race?.filingDateStart,
		filingDateEnd: race?.filingDateEnd,
		electionDate: race?.electionDate,
	});
	const canonical = toAbsoluteUrl(
		`/elections/${countySlug}/${city.toLowerCase()}/${subplace.toLowerCase()}/position/${positionSlug}`,
	);
	if (isRealSubplace) {
		const subplaceName = displayPlaceName(race!.Place!.name);
		// The same slots again, with the subplace ahead of them; any two can be one place.
		const locationPhrase = joinPlaceNames(subplaceName, isRealCity ? cityName : null, countyDisplayName);
		return {
			...positionPageMetadata(positionState, positionName, `${locationPhrase}, ${stateName}`, SITE_NAME),
			alternates: { canonical },
		};
	}
	return {
		...positionPageMetadata(positionState, positionName, `${placePhrase}, ${stateName}`, SITE_NAME),
		alternates: { canonical },
	};
}
