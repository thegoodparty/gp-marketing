import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	COUNTY_MTFCC,
	CITY_MTFCC,
	getPlacesByState,
	getPlaceBySlug,
	isDistrictMtfcc,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { DEFAULT_DISPLAY_COUNT } from '~/constants/display';
import {
	CAROUSEL_QUOTE_COLLECTION_ID,
	CAROUSEL_HEADER,
	STEPPER_HEADER,
	STEPPER_ITEMS,
} from '~/constants/electionsStaticSections';
import { sanityFetch } from '~/sanity/sanityClient';
import { quoteCollectionByIdQuery } from '~/sanity/groq';
import { getStateName } from '~/lib/electionsHelpers';
import { resolveAuthor } from '~/ui/_lib/resolveAuthor';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';
import { BreadcrumbBlock } from '~/ui/BreadcrumbBlock';
import { ElectionsLandingWithSearch } from '~/ui/ElectionsLandingWithSearch';
import { Carousel } from '~/ui/Carousel';
import { StepperBlock } from '~/ui/StepperBlock';
import { ElectionsIndexBlock } from '~/ui/ElectionsIndexBlock';
import { US_STATE_CODES } from '~/lib/sitemap-entries';

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

	const [allPlaces, placeData, quoteCollection] = await Promise.all([
		getPlacesByState({ state: stateCode }),
		getPlaceBySlug({
			slug: state.toLowerCase(),
			includeChildren: false,
			includeRaces: true,
			raceColumns: 'slug,normalizedPositionName,electionDate,positionDescription,positionLevel',
		}),
		sanityFetch({
			query: quoteCollectionByIdQuery,
			params: { id: CAROUSEL_QUOTE_COLLECTION_ID },
			tags: ['quoteCollections'],
		}),
	]);

	const countyPlaces = allPlaces.filter(p => p.mtfcc === COUNTY_MTFCC);
	const districtPlaces = allPlaces.filter(p => isDistrictMtfcc(p.mtfcc));
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

	const quoteItems = quoteCollection?.quoteCollectionContent?.list_chooseQuotes ?? [];
	const carouselCards = quoteItems.map(item => ({
		copy: item.quote?.field_quote ?? undefined,
		author: resolveAuthor(item.quote?.ref_quoteBy as Parameters<typeof resolveAuthor>[0]),
	}));

	const stepperHeader = {
		title: STEPPER_HEADER.title,
		copy: STEPPER_HEADER.copy,
		backgroundColor: 'cream' as const,
		textSize: resolveTextSize('Medium'),
	};

	const stateRaces = isSingleCounty
		? (placeData?.Races ?? [])
		: (placeData?.Races ?? []).filter(
				r => r.positionLevel?.toUpperCase() === 'STATE',
			);
	const stateOffices = stateRaces.map(race => {
		const positionSlug = race.slug.split('/').slice(1).join('/');
		return {
			id: String(race.id),
			type: 'State',
			position: race.normalizedPositionName ?? race.name ?? 'Position',
			nextElectionDate: race.electionDate ?? '',
			href: `/elections/${state}/position/${positionSlug}`,
		};
	});

	const dataYears = [
		...new Set(
			stateRaces
				.map(r => (r.electionDate ? new Date(r.electionDate).getFullYear() : NaN))
				.filter((y): y is number => !isNaN(y)),
		),
	].sort((a, b) => a - b);

	const defaultYear = dataYears.includes(currentYear)
		? currentYear
		: (dataYears[0] ?? currentYear);
	const availableYears = dataYears.length > 0 ? dataYears : [currentYear];

	return (
		<>
			<BreadcrumbBlock backgroundColor="midnight" breadcrumbs={breadcrumbs} />
			<ElectionsLandingWithSearch
				heroProps={{
					backgroundColor: 'midnight',
					locationLevel: 'state',
					stateName: `Upcoming elections in ${stateName}`,
					bodyCopy: `Learn what state positions are up for election and who is currently running for office in ${stateName}.`,
				}}
				listProps={{
					heading: isSingleCounty
						? `Elections in ${stateName}`
						: `State Elections in ${stateName}`,
					headlineLabel: 'state',
					defaultYear,
					availableYears,
					offices: stateOffices,
				}}
			/>
			<ElectionsIndexBlock
				backgroundColor="midnight"
				stateSlug={state.toLowerCase()}
				elections={locationItems}
				header={{
					title:
						isSingleCounty && countySlug
							? `Cities & Districts in ${stateName}`
							: `Counties & Districts in ${stateName}`,
					copy:
						isSingleCounty && countySlug
							? `Browse elections by city or district in ${stateName}.`
							: `Browse elections by county or district in ${stateName}.`,
					backgroundColor: 'midnight',
				}}
				initialDisplayCount={DEFAULT_DISPLAY_COUNT}
				showSearch={true}
				searchPlaceholder={
					isSingleCounty && countySlug
						? 'Search by city or district'
						: 'Search by county or district'
				}
			/>
			{carouselCards.length > 0 && (
				<Carousel
					backgroundColor="cream"
					header={{
						title: CAROUSEL_HEADER.title,
						copy: CAROUSEL_HEADER.copy,
						backgroundColor: 'cream',
						textSize: resolveTextSize('Medium'),
					}}
					cards={carouselCards}
				/>
			)}
			<StepperBlock
				backgroundColor="cream"
				header={stepperHeader}
				items={STEPPER_ITEMS.map(i => ({ ...i, buttons: [...i.buttons] }))}
			/>
		</>
	);
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
