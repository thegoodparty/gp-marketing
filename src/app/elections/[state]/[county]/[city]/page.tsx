import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import {
	COUNTY_MTFCC,
	getCountyChildPlaces,
	getPlacesByState,
	getPlaceBySlug,
	isCityOrTownMtfcc,
	isDistrictMtfcc,
	resolveCountySlugForPlace,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	buildOfficeItemsFromPlaceRaces,
	getStateName,
	hasSuspiciousFactsMatch,
	PLACE_RACE_COLUMNS,
	placeToFactsCards,
	resolveLocalityName,
	resolvePlaceRaceElectionDates,
} from '~/lib/electionsHelpers';
import { renderElectionsIndexPage } from '~/lib/renderElectionsIndexPage';
import { toAbsoluteUrl } from '~/lib/url';

export const revalidate = 3600;

export async function generateStaticParams() {
	return [];
}

export default async function Page({ params }: { params: Promise<{ state: string; county: string; city: string }> }) {
	const { state, county, city } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${city.toLowerCase()}`;
	const currentYear = new Date().getFullYear();

	const shortSlug = `${state.toLowerCase()}/${city.toLowerCase()}`;

	const [counties, placeData, countyFactsData, countyChildPlaces] = await Promise.all([
		getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC }),
		getPlaceBySlug({
			slug: fullSlug,
			includeChildren: false,
			includeRaces: true,
			placeColumns: 'slug,name,mtfcc,countyName',
			raceColumns: PLACE_RACE_COLUMNS,
		}),
		getPlaceBySlug({
			slug: countySlug,
			includeChildren: false,
			includeRaces: false,
		}),
		getCountyChildPlaces({ state: stateCode, countySlug }),
	]);

	let resolvedPlaceData = placeData;
	if (!resolvedPlaceData) {
		resolvedPlaceData = await getPlaceBySlug({
			slug: shortSlug,
			includeChildren: false,
			includeRaces: true,
			placeColumns: 'slug,name,mtfcc,countyName',
			raceColumns: PLACE_RACE_COLUMNS,
		});
	}

	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const isNestedDistrict =
		!countyPlace &&
		resolvedPlaceData != null &&
		isDistrictMtfcc(resolvedPlaceData.mtfcc) &&
		resolvedPlaceData.slug?.toLowerCase() === fullSlug;

	if (!countyPlace && !isNestedDistrict) {
		if (resolvedPlaceData?.countyName) {
			const canonicalCountySlug = await resolveCountySlugForPlace(stateCode, resolvedPlaceData.countyName);
			if (canonicalCountySlug && canonicalCountySlug.toLowerCase() !== countySlug) {
				permanentRedirect(`/elections/${canonicalCountySlug}/${city.toLowerCase()}`);
			}
		}
		notFound();
	}

	if (isNestedDistrict) {
		const districtPlace = resolvedPlaceData!;
		const districtName = districtPlace.name;
		const breadcrumbs = [
			{ href: '/elections', label: 'Elections' },
			{ href: `/elections/${state.toLowerCase()}`, label: stateName },
			{ href: '', label: districtName },
		];
		const districtRaces = (districtPlace.Races ?? []).filter(r => {
			const level = r.positionLevel?.toUpperCase();
			return level === 'LOCAL' || level === 'COUNTY';
		});
		const districtResolvedDates = await resolvePlaceRaceElectionDates(districtRaces);
		const { offices: districtOffices, dataYears } = buildOfficeItemsFromPlaceRaces(districtRaces, districtResolvedDates, {
			type: 'District',
			buildHref: race => {
				const positionSlug = race.slug.split('/').pop() ?? '';
				return `/elections/${state.toLowerCase()}/${county.toLowerCase()}/${city.toLowerCase()}/position/${positionSlug}`;
			},
		});
		const defaultYear = dataYears.includes(currentYear) ? currentYear : (dataYears[0] ?? currentYear);
		const availableYears = dataYears.length > 0 ? dataYears : [currentYear];
		const factsCards = placeToFactsCards(districtPlace);
		const pageUrl = toAbsoluteUrl(`/elections/${fullSlug}`);

		return renderElectionsIndexPage({
			placeSlug: fullSlug,
			breadcrumbs,
			locationLevel: 'district',
			stateName,
			heroTitle: `Upcoming elections in ${districtName}, ${stateName}`,
			countyName: districtName,
			bodyCopy: `Learn what positions are up for election and who is currently running for office in ${districtName}.`,
			listHeading: `Elections in ${districtName}`,
			listHeadline: 'district',
			defaultYear,
			availableYears,
			offices: districtOffices,
			electionsIndexHidden: true,
			locationFacts: factsCards.length > 0 ? { title: `${districtName} facts`, factsCards } : { hidden: true },
			pageUrl,
			pageTitle: `Elections in ${districtName}, ${stateName}`,
			pageDescription: `Browse elections and positions in ${districtName}, ${stateName}.`,
		});
	}

	const citySegment = city.toLowerCase();
	const cityPlace =
		countyChildPlaces.find(c => {
			const slug = c.slug?.toLowerCase();
			if (!slug) return false;
			if (slug === fullSlug || slug === shortSlug) return true;
			return slug.split('/').pop() === citySegment;
		}) ??
		(resolvedPlaceData &&
		(() => {
			const slug = resolvedPlaceData.slug?.toLowerCase();
			if (!slug) return false;
			return slug === fullSlug || slug === shortSlug || slug.split('/').pop() === citySegment;
		})()
			? resolvedPlaceData
			: null);

	if (!cityPlace) {
		notFound();
	}

	if (cityPlace.countyName) {
		const canonicalCountySlug = await resolveCountySlugForPlace(stateCode, cityPlace.countyName);
		if (canonicalCountySlug && canonicalCountySlug.toLowerCase() !== countySlug) {
			permanentRedirect(`/elections/${canonicalCountySlug}/${city.toLowerCase()}`);
		}
	}

	const cityName = cityPlace.name;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: countyPlace!.name },
		{ href: '', label: cityName },
	];

	const factsSourcePlace = resolvedPlaceData ?? cityPlace;
	const cityFactsEligible = isCityOrTownMtfcc(factsSourcePlace.mtfcc);
	const suspiciousFactsMatch = hasSuspiciousFactsMatch(factsSourcePlace, countyFactsData);
	const factsCards = cityFactsEligible ? placeToFactsCards(factsSourcePlace) : [];

	const factsDecisionLog = {
		requestedSlug: fullSlug,
		requestedShortSlug: shortSlug,
		resolvedCitySlug: cityPlace.slug,
		resolvedCityMtfcc: cityPlace.mtfcc ?? null,
		countySlug,
		countyFactsSlug: countyFactsData?.slug ?? null,
		cityFactsEligible,
		suspiciousFactsMatch,
		factsShown: factsCards.length > 0,
	};
	if (!cityFactsEligible) {
		console.warn('[city-facts] suppressed-invalid-locality-type', factsDecisionLog);
	} else if (suspiciousFactsMatch) {
		console.warn('[city-facts] suspicious-city-county-facts-match', factsDecisionLog);
	} else {
		console.info('[city-facts] resolved', factsDecisionLog);
	}

	const cityRaces = (resolvedPlaceData?.Races ?? []).filter(r => {
		const level = r.positionLevel?.toUpperCase();
		return level === 'LOCAL' || level === 'CITY';
	});
	const cityResolvedDates = await resolvePlaceRaceElectionDates(cityRaces);
	const { offices: cityOffices, dataYears } = buildOfficeItemsFromPlaceRaces(cityRaces, cityResolvedDates, {
		type: 'City',
		buildHref: race => {
			const positionSlug = race.slug.split('/').pop() ?? '';
			return `/elections/${state.toLowerCase()}/${county.toLowerCase()}/${city.toLowerCase()}/position/${positionSlug}`;
		},
	});

	const defaultYear = dataYears.includes(currentYear) ? currentYear : (dataYears[0] ?? currentYear);
	const availableYears = dataYears.length > 0 ? dataYears : [currentYear];
	const pageUrl = toAbsoluteUrl(`/elections/${fullSlug}`);

	return renderElectionsIndexPage({
		placeSlug: fullSlug,
		breadcrumbs,
		locationLevel: 'city',
		stateName,
		heroTitle: `Upcoming elections in ${cityName}, ${stateName}`,
		countyName: countyPlace!.name,
		cityName,
		bodyCopy: `Learn what positions are up for election and who is currently running for office in ${cityName}.`,
		listHeading: `City Elections in ${cityName}`,
		listHeadline: 'municipal',
		defaultYear,
		availableYears,
		offices: cityOffices,
		electionsIndexHidden: true,
		locationFacts: factsCards.length > 0 ? { title: `${cityName} facts`, factsCards } : { hidden: true },
		pageUrl,
		pageTitle: `Elections in ${cityName}, ${stateName}`,
		pageDescription: `Browse elections and local positions in ${cityName}, ${countyPlace!.name}, ${stateName}.`,
	});
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ state: string; county: string; city: string }>;
}): Promise<Metadata> {
	const { state, county, city } = await params;
	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode)) return {};
	const stateName = getStateName(stateCode);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${city.toLowerCase()}`;
	const shortSlug = `${state.toLowerCase()}/${city.toLowerCase()}`;
	const [counties, countyFactsData, placeData] = await Promise.all([
		getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC }),
		getPlaceBySlug({
			slug: countySlug,
			includeChildren: false,
			includeRaces: false,
		}),
		getPlaceBySlug({
			slug: fullSlug,
			includeChildren: false,
			includeRaces: false,
		}),
	]);
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const isNestedDistrict =
		!countyPlace && placeData != null && isDistrictMtfcc(placeData.mtfcc) && placeData.slug?.toLowerCase() === fullSlug;
	if (isNestedDistrict) {
		return {
			title: `Elections in ${placeData.name}, ${stateName} | Good Party`,
			description: `Browse elections and positions in ${placeData.name}, ${stateName}.`,
		};
	}
	const countyDisplayName = resolveLocalityName(countyPlace, countyFactsData ?? undefined, countySlug);
	const cityPlaces = await getCountyChildPlaces({ state: stateCode, countySlug });
	const citySegment = city.toLowerCase();
	let cityPlace = cityPlaces.find(c => {
		const slug = c.slug?.toLowerCase();
		if (!slug) return false;
		if (slug === `${countySlug}/${citySegment}` || slug === shortSlug) return true;
		return slug.split('/').pop() === citySegment;
	});
	if (!cityPlace) {
		const placeByShortSlug = await getPlaceBySlug({
			slug: shortSlug,
			includeChildren: false,
			includeRaces: false,
		});
		if (placeByShortSlug?.slug?.toLowerCase() === shortSlug) {
			cityPlace = placeByShortSlug;
		}
	}
	const cityName = cityPlace?.name ?? city;
	return {
		title: `Elections in ${cityName}, ${stateName} | Good Party`,
		description: `Browse elections and local positions in ${cityName}, ${countyDisplayName}, ${stateName}.`,
	};
}
