import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	COUNTY_MTFCC,
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
	resolveLocalityName,
} from '~/lib/electionsHelpers';
import { getCachedElectionRouteParams } from '~/lib/sitemap-entries';
import { SITE_NAME, toAbsoluteUrl } from '~/lib/url';
import { renderElectionsPositionPage } from '~/lib/renderElectionsPositionPage';

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
		candidatesHref,
		race,
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
	const cityName = cityPlace?.name ?? city;
	// A joint office fills the city slot with an office name, and the place then resolves to the
	// county, so naming it as both city and county would say the county twice.
	const isRealCity = isRealPlaceSegment(cityPlace?.slug, city);
	const placePhrase = isRealCity ? `${cityName}, ${countyDisplayName}` : countyDisplayName;
	const isRealSubplace =
		race?.Place?.slug?.toLowerCase().endsWith(`/${subplace.toLowerCase()}`) ?? false;
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	const canonical = toAbsoluteUrl(
		`/elections/${countySlug}/${city.toLowerCase()}/${subplace.toLowerCase()}/position/${positionSlug}`,
	);
	if (isRealSubplace) {
		const subplaceName = race!.Place!.name;
		return {
			title: `${positionName} in ${subplaceName}, ${placePhrase}, ${stateName} | ${SITE_NAME}`,
			description: `Election details and candidates for ${positionName} in ${subplaceName}, ${placePhrase}, ${stateName}.`,
			alternates: { canonical },
		};
	}
	return {
		title: `${positionName} in ${placePhrase}, ${stateName} | ${SITE_NAME}`,
		description: `Election details and candidates for ${positionName} in ${placePhrase}, ${stateName}.`,
		alternates: { canonical },
	};
}
