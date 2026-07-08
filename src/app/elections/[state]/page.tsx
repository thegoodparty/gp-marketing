import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	COUNTY_MTFCC,
	CITY_MTFCC,
	getPlacesByState,
	getPlaceBySlug,
	isStateIndexDistrictPlace,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	buildOfficeItemsFromPlaceRaces,
	getStateName,
	PLACE_RACE_COLUMNS,
	resolvePlaceRaceElectionDates,
} from '~/lib/electionsHelpers';
import { renderElectionsIndexPage } from '~/lib/renderElectionsIndexPage';
import { US_STATE_CODES } from '~/lib/sitemap-entries';
import { toAbsoluteUrl } from '~/lib/url';

export const revalidate = 3600;

export async function generateStaticParams() {
	return US_STATE_CODES.map((code) => ({ state: code.toLowerCase() }));
}

export default async function Page({
	params,
}: {
	params: Promise<{ state: string }>;
}) {
	const { state } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const currentYear = new Date().getFullYear();

	const [allPlaces, placeData] = await Promise.all([
		getPlacesByState({ state: stateCode }),
		getPlaceBySlug({
			slug: state.toLowerCase(),
			includeChildren: false,
			includeRaces: true,
			raceColumns: PLACE_RACE_COLUMNS,
		}),
	]);

	const countyPlaces = allPlaces.filter(p => p.mtfcc === COUNTY_MTFCC);
	const districtPlaces = allPlaces.filter(isStateIndexDistrictPlace);
	const isSingleCounty = countyPlaces.length <= 1;
	const cityPlaces = isSingleCounty
		? await getPlacesByState({ state: stateCode, mtfcc: CITY_MTFCC })
		: [];

	const countySlug = countyPlaces[0]?.slug;

	const countyAndCityItems =
		isSingleCounty && countySlug
			? [
					...cityPlaces.map(p => {
						const citySegment =
							p.slug.split('/').pop() ??
							p.name.toLowerCase().replace(/\s+/g, '-');
						return {
							name: p.name,
							href: `/elections/${countySlug}/${citySegment}`,
							level: 'city' as const,
						};
					}),
					{
						name: countyPlaces[0]?.name ?? '',
						href: `/elections/${countySlug}`,
						level: 'county' as const,
					},
				]
			: countyPlaces.map(p => ({
					name: p.name,
					href: `/elections/${p.slug}`,
					level: 'county' as const,
				}));

	const districtItems = districtPlaces.map(p => ({
		name: p.name,
		href: `/elections/${p.slug}`,
		level: 'district' as const,
	}));

	const locationItems = [...countyAndCityItems, ...districtItems];

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: '', label: stateName },
	];

	const stateRaces = isSingleCounty
		? (placeData?.Races ?? [])
		: (placeData?.Races ?? []).filter(
				r => r.positionLevel?.toUpperCase() === 'STATE',
			);
	const resolvedDates = await resolvePlaceRaceElectionDates(stateRaces);
	const { offices: stateOffices, dataYears } = buildOfficeItemsFromPlaceRaces(stateRaces, resolvedDates, {
		type: 'State',
		buildHref: race => {
			const positionSlug = race.slug.split('/').slice(1).join('/');
			return `/elections/${state}/position/${positionSlug}`;
		},
	});

	const defaultYear = dataYears.includes(currentYear)
		? currentYear
		: (dataYears[0] ?? currentYear);
	const availableYears = dataYears.length > 0 ? dataYears : [currentYear];
	const pageUrl = toAbsoluteUrl(`/elections/${state.toLowerCase()}`);

	return renderElectionsIndexPage({
		placeSlug: state.toLowerCase(),
		breadcrumbs,
		locationLevel: 'state',
		stateName,
		heroTitle: `Upcoming elections in ${stateName}`,
		bodyCopy: `Learn what state positions are up for election and who is currently running for office in ${stateName}.`,
		searchPlaceholder: 'Search positions',
		listHeading: isSingleCounty ? `Elections in ${stateName}` : `State Elections in ${stateName}`,
		listHeadline: 'state',
		defaultYear,
		availableYears,
		offices: stateOffices,
		elections: locationItems,
		stateSlug: state.toLowerCase(),
		pageUrl,
		pageTitle: `Elections in ${stateName}`,
		pageDescription: `Browse elections and positions in ${stateName}.`,
	});
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ state: string }>;
}): Promise<Metadata> {
	const { state } = await params;
	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode)) return {};
	const stateName = getStateName(stateCode);
	return {
		title: `Elections in ${stateName} | Good Party`,
		description: `Browse elections and positions in ${stateName}.`,
	};
}
