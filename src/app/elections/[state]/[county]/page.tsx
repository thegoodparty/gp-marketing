import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
	COUNTY_MTFCC,
	getCountyChildPlaces,
	getPlacesByState,
	getPlaceBySlug,
	isDistrictMtfcc,
	TOWN_MTFCC,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { getStateName, placeToFactsCards, redirectCityPlaceToFourLevelUrl, canonicalizeCountyEquivalentName, getCountySuffixLabel } from '~/lib/electionsHelpers';
import { renderElectionsIndexPage } from '~/lib/renderElectionsIndexPage';
import { toAbsoluteUrl } from '~/lib/url';

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

	const [counties, placeData] = await Promise.all([
		getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC }),
		getPlaceBySlug({
			slug: fullSlug,
			includeChildren: false,
			includeRaces: true,
			placeColumns: 'slug,name,mtfcc,countyName',
			raceColumns: 'slug,normalizedPositionName,electionDate,positionDescription,positionLevel',
		}),
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

	const placeName = isDistrict
		? (placeData?.name ?? county)
		: (normalizedCounty?.displayName ?? countyPlace!.name);
	const cities = isDistrict
		? []
		: cityPlaces.map(c => {
				const level: 'town' | 'city' = c.mtfcc === TOWN_MTFCC ? 'town' : 'city';
				return {
					name: c.name,
					href: `/elections/${fullSlug}/${c.slug?.split('/')?.pop() ?? c.name.toLowerCase().replace(/\s+/g, '-')}`,
					level,
				};
			});
	const hasTownEntries = cityPlaces.some(c => c.mtfcc === TOWN_MTFCC);

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
	const countyOffices = countyRaces.map(race => {
		const positionSlug = race.slug.split('/').slice(2).join('/');
		return {
			id: String(race.id),
			type: isDistrict ? 'District' : 'County',
			position: race.normalizedPositionName ?? race.name ?? 'Position',
			nextElectionDate: race.electionDate ?? '',
			href: `/elections/${state.toLowerCase()}/${county.toLowerCase()}/position/${positionSlug}`,
		};
	});

	const dataYears = [
		...new Set(
			countyRaces
				.map(r => (r.electionDate ? new Date(r.electionDate).getFullYear() : NaN))
				.filter((y): y is number => !isNaN(y)),
		),
	].sort((a, b) => a - b);
	const defaultYear = dataYears.includes(currentYear)
		? currentYear
		: (dataYears[0] ?? currentYear);
	const availableYears = dataYears.length > 0 ? dataYears : [currentYear];

	const pageUrl = toAbsoluteUrl(`/elections/${fullSlug}`);

	return renderElectionsIndexPage({
		placeSlug: fullSlug,
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
		listHeadline: isDistrict ? 'district' : 'county',
		defaultYear,
		availableYears,
		offices: countyOffices,
		elections: cities,
		stateSlug: fullSlug,
		pageUrl,
		pageTitle: `Elections in ${placeName}, ${stateName}`,
		pageDescription: isDistrict
			? `Browse elections and positions in ${placeName}, ${stateName}.`
			: `Browse elections, positions, and cities in ${placeName}, ${stateName}.`,
		electionsIndexHidden: isDistrict,
		electionsIndexHeader: isDistrict
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
	const [counties, placeData] = await Promise.all([
		getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC }),
		getPlaceBySlug({ slug: fullSlug, includeChildren: false, includeRaces: false }),
	]);
	const countyPlace = counties.find(c => c.slug.toLowerCase() === fullSlug);
	const isDistrict = placeData != null && isDistrictMtfcc(placeData.mtfcc);
	const normalizedCounty = countyPlace
		? canonicalizeCountyEquivalentName(stateCode, countyPlace.name)
		: null;
	const placeName = isDistrict
		? (placeData?.name ?? county)
		: (normalizedCounty?.displayName ?? county);
	return {
		title: `Elections in ${placeName}, ${stateName} | Good Party`,
		description: isDistrict
			? `Browse elections and positions in ${placeName}, ${stateName}.`
			: `Browse elections and cities in ${placeName}, ${stateName}.`,
	};
}
