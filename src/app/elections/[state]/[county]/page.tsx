import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
	COUNTY_MTFCC,
	getPlacesByState,
	getPlaceBySlug,
	getPlacesBySlugWithChildren,
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
import { getStateName, placeToFactsCards } from '~/lib/electionsHelpers';
import { resolveAuthor } from '~/ui/_lib/resolveAuthor';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';
import { BreadcrumbBlock } from '~/ui/BreadcrumbBlock';
import { ElectionsLandingWithSearch } from '~/ui/ElectionsLandingWithSearch';
import { LocationFactsBlock } from '~/ui/LocationFactsBlock';
import { Carousel } from '~/ui/Carousel';
import { StepperBlock } from '~/ui/StepperBlock';
import { ElectionsIndexBlock } from '~/ui/ElectionsIndexBlock';

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

	const [counties, placeData, quoteCollection, placesWithChildren] = await Promise.all([
		getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC }),
		getPlaceBySlug({
			slug: fullSlug,
			includeChildren: false,
			includeRaces: true,
			raceColumns: 'slug,normalizedPositionName,electionDate,positionDescription,positionLevel',
		}),
		sanityFetch({
			query: quoteCollectionByIdQuery,
			params: { id: CAROUSEL_QUOTE_COLLECTION_ID },
		}),
		getPlacesBySlugWithChildren({
			slug: fullSlug,
			includeChildren: true,
		}),
	]);

	const countyPlace = counties.find(c => c.slug.toLowerCase() === fullSlug);

	if (!countyPlace) {
		if (placeData?.mtfcc && placeData.mtfcc !== COUNTY_MTFCC) {
			redirect(`/elections/${state.toLowerCase()}`);
		}
		notFound();
	}

	const countyName = countyPlace.name.replace(/\s+County$/i, '') || countyPlace.name;
	const children = placesWithChildren[0]?.children ?? [];

	const cities = children.map(c => ({
		name: c.name,
		href: `/elections/${c.slug}`,
		level: 'city' as const,
	}));

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: '', label: `${countyName} County` },
	];

	const factsCards = placeToFactsCards(placeData);

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

	// County and local positions (e.g. County Sheriff, Library District Board) from place Races
	const countyRaces = (placeData?.Races ?? []).filter(r => {
		const level = r.positionLevel?.toUpperCase();
		return level === 'COUNTY' || level === 'LOCAL';
	});
	const countyOffices = countyRaces.map(race => {
		const positionSlug = race.slug.split('/').slice(2).join('/');
		return {
			id: String(race.id),
			type: 'County',
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

	return (
		<>
			<BreadcrumbBlock backgroundColor="midnight" breadcrumbs={breadcrumbs} />
			<ElectionsLandingWithSearch
				heroProps={{
					locationLevel: 'county',
					backgroundColor: 'midnight',
					stateName: `Upcoming elections in ${countyName}, ${stateName}`,
					bodyCopy: `Learn what positions are up for election and who is currently running for office in ${countyName}.`,
				}}
				listProps={{
					heading: `County Elections in ${countyName} County`,
					headlineLabel: 'county',
					defaultYear,
					availableYears,
					offices: countyOffices,
				}}
			/>
			{factsCards.length > 0 && (
				<LocationFactsBlock
					backgroundColor="cream"
					header={{ title: `${countyName} County facts` }}
					factsCards={factsCards}
				/>
			)}
			<ElectionsIndexBlock
				backgroundColor="midnight"
				stateSlug={fullSlug}
				elections={cities}
				header={{
					title: `Cities in ${countyName} County`,
					copy: `Browse elections by city in ${countyName} County, ${stateName}.`,
					backgroundColor: 'midnight',
				}}
				initialDisplayCount={DEFAULT_DISPLAY_COUNT}
				showSearch={true}
				searchPlaceholder="Search by city"
				ctaLabel="Browse CTA"
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
	params: Promise<{ state: string; county: string }>;
}): Promise<Metadata> {
	const { state, county } = await params;
	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode)) return {};
	const stateName = getStateName(stateCode);
	const fullSlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const counties = await getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === fullSlug);
	const countyName = countyPlace?.name?.replace(/\s+County$/i, '') ?? county;
	return {
		title: `Elections in ${countyName}, ${stateName} | Good Party`,
		description: `Browse elections and cities in ${countyName}, ${stateName}.`,
	};
}
