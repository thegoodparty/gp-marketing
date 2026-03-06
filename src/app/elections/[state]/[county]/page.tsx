import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	getDistrictTypes,
	getDistrictNames,
	getPlacesByState,
	getPlaceBySlug,
	getPlacesBySlugWithChildren,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { DEFAULT_DISPLAY_COUNT, DEFAULT_YEAR_OFFSET } from '~/constants/display';
import {
	CAROUSEL_QUOTE_COLLECTION_ID,
	CAROUSEL_HEADER,
	STEPPER_HEADER,
	STEPPER_ITEMS,
} from '~/constants/electionsStaticSections';
import { sanityFetch } from '~/sanity/sanityClient';
import { quoteCollectionByIdQuery } from '~/sanity/groq';
import { formatElectionDate, getStateName, placeToFactsCards, slugifyPositionName } from '~/lib/electionsHelpers';
import { resolveAuthor } from '~/ui/_lib/resolveAuthor';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';
import { BreadcrumbBlock } from '~/ui/BreadcrumbBlock';
import { ListOfOfficesBlock } from '~/ui/ListOfOfficesBlock';
import { LocationLandingPageHero } from '~/ui/LocationLandingPageHero';
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
	const electionYear = new Date().getFullYear() + DEFAULT_YEAR_OFFSET;

	const [counties, districtTypes, placeData, quoteCollection, placesWithChildren] = await Promise.all([
		getPlacesByState({ state: stateCode, mtfcc: 'G4020' }),
		getDistrictTypes({
			state: stateCode,
			electionYear,
		}),
		getPlaceBySlug({ slug: fullSlug, includeChildren: false, includeRaces: false }),
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
		notFound();
	}

	const countyName = countyPlace.name.replace(/\s+County$/i, '') || countyPlace.name;
	const children = placesWithChildren[0]?.children ?? [];

	const municipalities = children.map(c => ({
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

	const municipalityTypes = districtTypes.filter(dt => {
		const t = dt.L2DistrictType.toUpperCase();
		return t.includes('CITY') || t.includes('TOWN');
	});

	const municipalityBaseNames = children.map(c =>
		c.name.replace(/\s+(Town|City|Township|Village)$/i, '').toLowerCase(),
	);

	const districtNamesByType = await Promise.all(
		municipalityTypes.map(async dt =>
			getDistrictNames({
				L2DistrictType: dt.L2DistrictType,
				state: stateCode,
				electionYear,
			}).then(names =>
				names
					.filter(n => {
						const lower = n.L2DistrictName.toLowerCase();
						return municipalityBaseNames.some(base => lower.includes(base));
					})
					.map(n => ({
						id: n.id,
						type: dt.L2DistrictType,
						position: n.L2DistrictName,
						nextElectionDate: formatElectionDate(electionYear),
						href: `/elections/${fullSlug}/position/${slugifyPositionName(n.L2DistrictName)}`,
					})),
			),
		),
	);

	const offices = districtNamesByType.flat();

	return (
		<>
			<BreadcrumbBlock backgroundColor="midnight" breadcrumbs={breadcrumbs} />
			<LocationLandingPageHero
				locationLevel="county"
				backgroundColor="midnight"
				stateName={`Upcoming elections in ${countyName},${stateName}`}
				bodyCopy={`Learn what positions are up for election and who is currently running for office in ${countyName}.`}
			/>
			<ListOfOfficesBlock
				heading={`Municipality Elections in ${countyName} County`}
				headline={`${offices.length} municipal positions up for election in ${electionYear}`}
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
					header={{ title: `${countyName} County facts` }}
					factsCards={factsCards}
				/>
			)}
			<ElectionsIndexBlock
				backgroundColor="midnight"
				stateSlug={fullSlug}
				elections={municipalities}
				header={{
					title: `Municipalities in ${countyName} County`,
					copy: `Browse elections by municipality in ${countyName} County, ${stateName}.`,
					backgroundColor: 'midnight',
				}}
				initialDisplayCount={DEFAULT_DISPLAY_COUNT}
				showSearch={true}
				searchPlaceholder="Search by municipality"
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
	if (!isValidStateCode(state)) return {};
	const stateName = getStateName(state);
	const fullSlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const counties = await getPlacesByState({ state: state.toUpperCase(), mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === fullSlug);
	const countyName = countyPlace?.name?.replace(/\s+County$/i, '') ?? county;
	return {
		title: `Elections in ${countyName}, ${stateName} | Good Party`,
		description: `Browse elections and municipalities in ${countyName}, ${stateName}.`,
	};
}
