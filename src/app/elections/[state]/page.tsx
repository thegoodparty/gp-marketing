import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	getDistrictTypes,
	getDistrictNames,
	getPlacesByState,
	getPlaceBySlug,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { US_STATES } from '~/constants/usStates';
import { DEFAULT_DISPLAY_COUNT, DEFAULT_YEAR_OFFSET } from '~/constants/display';
import {
	CAROUSEL_QUOTE_COLLECTION_ID,
	CAROUSEL_HEADER,
	STEPPER_HEADER,
	STEPPER_ITEMS,
} from '~/constants/electionsStaticSections';
import { sanityFetch } from '~/sanity/sanityClient';
import { quoteCollectionByIdQuery } from '~/sanity/groq';
import type { PlaceWithFacts } from '~/types/elections';
import type { FactsCardProps } from '~/ui/FactsCard';
import { resolveAuthor } from '~/ui/_lib/resolveAuthor';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';
import { BreadcrumbBlock } from '~/ui/BreadcrumbBlock';
import { ListOfOfficesBlock } from '~/ui/ListOfOfficesBlock';
import { LocationLandingPageHero } from '~/ui/LocationLandingPageHero';
import { LocationFactsBlock } from '~/ui/LocationFactsBlock';
import { Carousel } from '~/ui/Carousel';
import { StepperBlock } from '~/ui/StepperBlock';
import { ElectionsIndexBlock } from '~/ui/ElectionsIndexBlock';

function formatElectionDate(year: number): string {
	const date = new Date(year, 10, 5);
	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function getStateName(code: string): string {
	const upper = code.toUpperCase();
	const found = US_STATES.find(s => s.value === upper);
	return found?.label ?? code;
}

function placeToFactsCards(place: PlaceWithFacts | null): FactsCardProps[] {
	if (!place) return [];
	const cards: FactsCardProps[] = [];
	const factTypeLabels: Record<string, string> = {
		'largest-city': 'Largest City',
		population: 'Population',
		density: 'Density (per sq mi)',
		'median-income': 'Median Income',
		'unemployment-rate': 'Unemployment Rate',
		'average-home-value': 'Average Home Value',
	};
	if (place.cityLargest != null) {
		cards.push({ factType: 'largest-city', label: factTypeLabels['largest-city']!, value: place.cityLargest });
	}
	if (place.population != null) {
		cards.push({ factType: 'population', label: factTypeLabels['population']!, value: place.population.toLocaleString() });
	}
	if (place.density != null) {
		// API returns people per sq km; display as people per sq mi
		const densityPerSqMi = place.density / 0.386102;
		cards.push({ factType: 'density', label: factTypeLabels['density']!, value: Math.round(densityPerSqMi).toLocaleString() });
	}
	if (place.incomeHouseholdMedian != null) {
		cards.push({
			factType: 'median-income',
			label: factTypeLabels['median-income']!,
			value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(place.incomeHouseholdMedian),
		});
	}
	if (place.unemploymentRate != null) {
		cards.push({
			factType: 'unemployment-rate',
			label: factTypeLabels['unemployment-rate']!,
			value: `${(place.unemploymentRate * 100).toFixed(1)}%`,
		});
	}
	if (place.homeValue != null) {
		cards.push({
			factType: 'average-home-value',
			label: factTypeLabels['average-home-value']!,
			value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(place.homeValue),
		});
	}
	return cards;
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
	const electionYear = new Date().getFullYear() + DEFAULT_YEAR_OFFSET;

	const [districtTypes, countyPlaces, placeData, quoteCollection] = await Promise.all([
		getDistrictTypes({
			state: stateCode,
			electionYear,
		}),
		getPlacesByState({ state: stateCode, mtfcc: 'G4020' }),
		getPlaceBySlug({ slug: state.toLowerCase(), includeChildren: false, includeRaces: false }),
		sanityFetch({
			query: quoteCollectionByIdQuery,
			params: { id: CAROUSEL_QUOTE_COLLECTION_ID },
		}),
	]);

	const counties = countyPlaces.map(p => ({
		name: p.name,
		href: `/elections/${p.slug}`,
		level: 'county' as const,
	}));

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: '', label: stateName },
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

	const countyTypes = districtTypes.filter(dt =>
		dt.L2DistrictType.toUpperCase().includes('COUNTY'),
	);

	const districtNamesByType = await Promise.all(
		countyTypes.map(async dt =>
			getDistrictNames({
				L2DistrictType: dt.L2DistrictType,
				state: stateCode,
				electionYear,
			}).then(names =>
				names.map(n => ({
					id: n.id,
					type: dt.L2DistrictType,
					position: n.L2DistrictName,
					nextElectionDate: formatElectionDate(electionYear),
					href: `/elections/${state}/position?positionId=${encodeURIComponent(n.id)}&name=${encodeURIComponent(n.L2DistrictName)}`,
				})),
			),
		),
	);

	const offices = districtNamesByType.flat();

	return (
		<>
			<BreadcrumbBlock backgroundColor="cream" breadcrumbs={breadcrumbs} />
			<LocationLandingPageHero
				locationLevel="state"
				stateName={stateName}
			/>
			<ListOfOfficesBlock
				heading={`County Elections in ${stateName}`}
				headline={`${offices.length} county positions up for election in ${electionYear}`}
				defaultYear={electionYear}
				availableYears={[
					electionYear - 2,
					electionYear - 1,
					electionYear,
					electionYear + 1,
				]}
				offices={offices}
			/>
			{factsCards.length > 0 && (
				<LocationFactsBlock
					backgroundColor="cream"
					header={{ title: `${stateName} facts` }}
					factsCards={factsCards}
				/>
			)}
			<ElectionsIndexBlock
				backgroundColor="midnight"
				stateSlug={state.toLowerCase()}
				elections={counties}
				header={{
					title: `Counties in ${stateName}`,
					copy: `Browse elections by county in ${stateName}.`,
					backgroundColor: 'midnight',
				}}
				initialDisplayCount={DEFAULT_DISPLAY_COUNT}
				showSearch={true}
				searchPlaceholder="Search by county"
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
	params: Promise<{ state: string }>;
}): Promise<Metadata> {
	const { state } = await params;
	if (!isValidStateCode(state)) return {};
	const stateName = getStateName(state);
	return {
		title: `Elections in ${stateName} | Good Party`,
		description: `Browse elections and positions in ${stateName}.`,
	};
}
