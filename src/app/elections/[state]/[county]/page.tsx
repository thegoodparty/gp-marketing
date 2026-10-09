import type { Metadata } from 'next';
import { displayPlaceName } from '~/lib/placeDisplayName';
import { notFound, redirect } from 'next/navigation';
import {
	COUNTY_MTFCC,
	getCountyChildPlaces,
	getFeaturedCities,
	getElectionsPagePlace,
	getPlacesByState,
	isDistrictMtfcc,
	TOWN_MTFCC,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	buildOfficeItemsFromPlaceRaces,
	mergeOfficeItems,
	buildOverlappingOfficeItems,
	buildPlaceRacePositionHref,
	canonicalizeCountyEquivalentName,
	getCountySuffixLabel,
	getStateName,
	placeToFactsCards,
	redirectCityPlaceToFourLevelUrl,
	resolveLocationDefaultYear,
	resolvePlaceRaceElectionDates,
} from '~/lib/electionsHelpers';
import { renderElectionsIndexPage, startFeaturedPeople } from '~/lib/renderElectionsIndexPage';
import { SITE_NAME, toAbsoluteUrl } from '~/lib/url';

export const revalidate = 3600;

export async function generateStaticParams() {
	return [];
}

export default async function Page({
	params,
}: {
	params: Promise<{ state: string; county: string }>;
}) {
	const { state, county } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const fullSlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const currentYear = new Date().getFullYear();

	const [counties, placeData, featuredCities] = await Promise.all([
		getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC }),
		getElectionsPagePlace({ slug: fullSlug }),
		getFeaturedCities({ stateCode, countySlug: fullSlug }),
	]);

	const countyPlace = counties.find(c => c.slug.toLowerCase() === fullSlug);
	const isDistrict = placeData != null && isDistrictMtfcc(placeData.mtfcc);
	const normalizedCounty = countyPlace
		? canonicalizeCountyEquivalentName(stateCode, countyPlace.name)
		: null;

	const cityPlaces = isDistrict
		? []
		: await getCountyChildPlaces({ state: stateCode, countySlug: fullSlug });

	if (!countyPlace && !isDistrict) {
		await redirectCityPlaceToFourLevelUrl(placeData, stateCode, fullSlug);
		if (placeData?.mtfcc && placeData.mtfcc !== COUNTY_MTFCC) {
			redirect(`/elections/${state.toLowerCase()}`);
		}
		notFound();
	}

	// The longest chain on the page, started once the page is known to render so
	// the date and overlapping-office reads below run alongside it.
	const featuredPeoplePromise = startFeaturedPeople({ placeSlug: fullSlug, locationLevel: isDistrict ? 'district' : 'county' });

	const placeName = isDistrict
		? displayPlaceName(placeData?.name ?? county)
		: (normalizedCounty?.displayName ?? countyPlace!.name);
	const cities = isDistrict
		? []
		: cityPlaces.map(c => {
				const level: 'town' | 'city' = c.mtfcc === TOWN_MTFCC ? 'town' : 'city';
				return {
					name: displayPlaceName(c.name),
					href: `/elections/${fullSlug}/${c.slug?.split('/')?.pop() ?? c.name.toLowerCase().replace(/\s+/g, '-')}`,
					level,
				};
			});
	const hasTownEntries = cityPlaces.some(c => c.mtfcc === TOWN_MTFCC);
	const hasCities = cities.length > 0;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: '', label: isDistrict ? placeName : (normalizedCounty?.displayName ?? countyPlace!.name) },
	];

	const factsCards = placeToFactsCards(placeData);

	const countyRaces = (placeData?.Races ?? []).filter(r => {
		const level = r.positionLevel?.toUpperCase();
		return level === 'COUNTY' || level === 'LOCAL';
	});
	// The state races this place's voters also vote in, for the Level dropdown.
	// A district reached on this route has no county in its path (the slug is the
	// district itself), so it offers Local and State but not County. Its date
	// refresh and this place's own are independent, so they run side by side.
	const [resolvedDates, overlapping] = await Promise.all([
		resolvePlaceRaceElectionDates(countyRaces),
		buildOverlappingOfficeItems({ stateSlug: state.toLowerCase() }),
	]);
	const officeType = isDistrict ? 'District' : 'County';
	// A district page is a local ballot, so it opens on Local; a county page on County.
	const ownLevel = isDistrict ? 'local' : 'county';
	const { offices: countyOffices, dataYears } = buildOfficeItemsFromPlaceRaces(
		countyRaces,
		resolvedDates,
		{
			type: officeType,
			level: ownLevel,
			placeName: countyPlace?.name ?? placeData?.name,
			buildHref: race => buildPlaceRacePositionHref([state, county], race.slug),
		},
	);

	const allYears = [...new Set([...dataYears, ...overlapping.dataYears])].sort((a, b) => a - b);
	/**
	 * Open on a year this place's own level has races in, so the list it opens on
	 * is populated, and fall back to the union (what the dropdown offers) when the
	 * own level has nothing this year or ahead, so a page never opens on a past
	 * year while the state still votes. See `resolveLocationDefaultYear`.
	 */
	const defaultYear = resolveLocationDefaultYear(dataYears, allYears, currentYear);
	const availableYears = allYears.length > 0 ? allYears : [currentYear];

	const pageUrl = toAbsoluteUrl(`/elections/${fullSlug}`);

	return renderElectionsIndexPage({
		placeSlug: fullSlug,
		featuredPeoplePromise,
		breadcrumbs,
		locationLevel: isDistrict ? 'district' : 'county',
		stateName,
		heroTitle: `Upcoming elections in ${placeName}, ${stateName}`,
		countyName: placeName,
		bodyCopy: `Learn what positions are up for election and who is currently running for office in ${placeName}.`,
		searchPlaceholder: 'Search positions',
		listHeading: isDistrict
			? `Elections in ${placeName}`
			: `${normalizedCounty?.suffixLabel ?? getCountySuffixLabel(countyPlace!.name)} Elections in ${normalizedCounty?.displayName ?? countyPlace!.name}`,
		defaultYear,
		availableYears,
		offices: mergeOfficeItems(countyOffices, overlapping.offices),
		elections: cities,
		stateSlug: fullSlug,
		// A district page has no cities of its own, so it features none.
		featuredCities: isDistrict ? [] : featuredCities,
		pageUrl,
		pageTitle: `Elections in ${placeName}, ${stateName}`,
		pageDescription:
			isDistrict || !hasCities
				? `Browse elections and positions in ${placeName}, ${stateName}.`
				: `Browse elections, positions, and cities in ${placeName}, ${stateName}.`,
		electionsIndexHidden: isDistrict || !hasCities,
		electionsIndexHeader:
			isDistrict || !hasCities
				? undefined
				: {
						title: `${hasTownEntries ? 'Cities & Towns' : 'Cities'} in ${normalizedCounty?.displayName ?? countyPlace!.name}`,
						copy: `Browse elections by city in ${normalizedCounty?.displayName ?? countyPlace!.name}, ${stateName}.`,
						searchPlaceholder: 'Search by city',
					},
		locationFacts:
			factsCards.length > 0
				? {
						title: isDistrict
							? `${placeName} facts`
							: `${normalizedCounty?.displayName ?? countyPlace!.name} facts`,
						factsCards,
					}
				: { hidden: true },
	});
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ state: string; county: string }>;
}): Promise<Metadata> {
	const { state, county } = await params;
	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode)) return {};
	const stateName = getStateName(stateCode);
	const fullSlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const [counties, placeData, cityPlaces] = await Promise.all([
		getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC }),
		getElectionsPagePlace({ slug: fullSlug }),
		getCountyChildPlaces({ state: stateCode, countySlug: fullSlug }),
	]);
	const countyPlace = counties.find(c => c.slug.toLowerCase() === fullSlug);
	const isDistrict = placeData != null && isDistrictMtfcc(placeData.mtfcc);
	const hasCities = cityPlaces.length > 0;
	const normalizedCounty = countyPlace
		? canonicalizeCountyEquivalentName(stateCode, countyPlace.name)
		: null;
	const placeName = isDistrict
		? displayPlaceName(placeData?.name ?? county)
		: (normalizedCounty?.displayName ?? county);
	return {
		title: `Elections in ${placeName}, ${stateName} | ${SITE_NAME}`,
		description:
			isDistrict || !hasCities
				? `Browse elections and positions in ${placeName}, ${stateName}.`
				: `Browse elections and cities in ${placeName}, ${stateName}.`,
		alternates: { canonical: toAbsoluteUrl(`/elections/${fullSlug}`) },
	};
}
