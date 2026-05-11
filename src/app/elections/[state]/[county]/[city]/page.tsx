import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	COUNTY_MTFCC,
	getCountyChildPlaces,
	getPlacesByState,
	getPlaceBySlug,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	CAROUSEL_QUOTE_COLLECTION_ID,
	CAROUSEL_HEADER,
	STEPPER_HEADER,
	STEPPER_ITEMS,
} from '~/constants/electionsStaticSections';
import { sanityFetch } from '~/sanity/sanityClient';
import { quoteCollectionByIdQuery } from '~/sanity/groq';
import {
	getStateName,
	hasSuspiciousFactsMatch,
	isCityOrTownMtfcc,
	placeToFactsCards,
	resolveLocalityName,
} from '~/lib/electionsHelpers';
import { resolveAuthor } from '~/ui/_lib/resolveAuthor';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';
import { BreadcrumbBlock } from '~/ui/BreadcrumbBlock';
import { ElectionsLandingWithSearch } from '~/ui/ElectionsLandingWithSearch';
import { LocationFactsBlock } from '~/ui/LocationFactsBlock';
import { Carousel } from '~/ui/Carousel';
import { StepperBlock } from '~/ui/StepperBlock';

export const revalidate = 3600;

export async function generateStaticParams() {
	return [];
}

export default async function Page({
	params,
}: {
	params: Promise<{ state: string; county: string; city: string }>;
}) {
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

	const [counties, placeData, countyFactsData, quoteCollection, countyChildPlaces] = await Promise.all([
		getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC }),
		getPlaceBySlug({
			slug: fullSlug,
			includeChildren: false,
			includeRaces: true,
			raceColumns: 'slug,normalizedPositionName,electionDate,positionDescription,positionLevel',
		}),
		getPlaceBySlug({
			slug: countySlug,
			includeChildren: false,
			includeRaces: false,
		}),
		sanityFetch({
			query: quoteCollectionByIdQuery,
			params: { id: CAROUSEL_QUOTE_COLLECTION_ID },
			tags: ['quoteCollections'],
		}),
		getCountyChildPlaces({ state: stateCode, countySlug }),
	]);

	let resolvedPlaceData = placeData;
	if (!resolvedPlaceData) {
		resolvedPlaceData = await getPlaceBySlug({
			slug: shortSlug,
			includeChildren: false,
			includeRaces: true,
			raceColumns: 'slug,normalizedPositionName,electionDate,positionDescription,positionLevel',
		});
	}

	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);

	if (!countyPlace) {
		notFound();
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

	const cityName = cityPlace.name;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: `/elections/${countySlug}`, label: countyPlace.name },
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

	const cityRaces = (resolvedPlaceData?.Races ?? []).filter(r => {
		const level = r.positionLevel?.toUpperCase();
		return level === 'LOCAL' || level === 'CITY';
	});
	const cityOffices = cityRaces.map(race => {
		const positionSlug = race.slug.split('/').pop() ?? '';
		return {
			id: String(race.id),
			type: 'City',
			position: race.normalizedPositionName ?? race.name ?? 'Position',
			nextElectionDate: race.electionDate ?? '',
			href: `/elections/${state.toLowerCase()}/${county.toLowerCase()}/${city.toLowerCase()}/position/${positionSlug}`,
		};
	});

	const dataYears = [
		...new Set(
			cityRaces
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
					locationLevel: 'city',
					backgroundColor: 'midnight',
					stateName: `Upcoming elections in ${cityName}, ${stateName}`,
					bodyCopy: `Learn what positions are up for election and who is currently running for office in ${cityName}.`,
				}}
				listProps={{
					heading: `City Elections in ${cityName}`,
					headlineLabel: 'municipal',
					defaultYear,
					availableYears,
					offices: cityOffices,
				}}
			/>
			{factsCards.length > 0 && (
				<LocationFactsBlock
					backgroundColor="cream"
					header={{ title: `${cityName} facts` }}
					factsCards={factsCards}
				/>
			)}
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
	params: Promise<{ state: string; county: string; city: string }>;
}): Promise<Metadata> {
	const { state, county, city } = await params;
	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode)) return {};
	const stateName = getStateName(stateCode);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const shortSlug = `${state.toLowerCase()}/${city.toLowerCase()}`;
	const [counties, countyFactsData] = await Promise.all([
		getPlacesByState({ state: stateCode, mtfcc: COUNTY_MTFCC }),
		getPlaceBySlug({
			slug: countySlug,
			includeChildren: false,
			includeRaces: false,
		}),
	]);
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
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
