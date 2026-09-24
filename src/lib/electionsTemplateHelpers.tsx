import Link from 'next/link';
import type { ReactNode } from 'react';

import type { SectionOverrides } from '~/PageSections';
import type { TokenMap } from '~/lib/resolveTokens';
import type { RaceDetail } from '~/types/elections';
import type { CandidateCard } from '~/ui/CandidatesBlock';
import type { BreadcrumbItem } from '~/ui/BreadcrumbBlock';
import type { OfficeItem } from '~/ui/ListOfOfficesBlock';
import type { ElectionItem } from '~/ui/ElectionsIndexBlock';
import { secondaryButtonStyleType } from '~/ui/_lib/designTypesStore';
import {
	buildDynamicFAQItems,
	buildPositionPageSchema,
} from '~/lib/electionsHelpers';
import {
	buildBreadcrumbSchema,
	buildFAQSchema,
	buildGovernmentOrganizationSchema,
	buildSchemaGraph,
	buildWebPageSchema,
} from '~/lib/schema';
import { resolveHowToRunGuide } from '~/lib/howToRunGuide';
import { toAbsoluteUrl } from '~/lib/url';
import { POSITION_PAGE_FAQ } from '~/constants/positionPageStaticSections';

export type PositionPageContext = {
	officeName: string;
	stateName: string;
	countyName?: string;
	cityName?: string;
	electionDate: string;
	filingDate: string;
	breadcrumbs: BreadcrumbItem[];
	// Required by the position template overrides; candidates pages legitimately omit it.
	candidatesHref?: string;
	positionHref?: string;
	locationHref?: string;
	race?: RaceDetail | null;
	// Used only by the position-page schema builders; optional for candidates pages.
	pageUrl?: string;
	/** From `getNearbyOffices`; set by the position page renderer, absent on candidates pages. */
	nearbyOffices?: OfficeItem[];
};

function formatFrequency(frequency: (string | number)[]): string {
	return frequency
		.map(v => {
			const s = String(v ?? '').trim();
			if (/^\d+$/.test(s)) return `Every ${s} years`;
			return s;
		})
		.filter(Boolean)
		.join(', ');
}

export function buildPositionGridItems(race: RaceDetail) {
	const items: { subhead: string; bodyCopy: ReactNode }[] = [];
	if (race.employmentType) items.push({ subhead: 'Employment Type', bodyCopy: race.employmentType });
	if (race.salary) items.push({ subhead: 'Salary', bodyCopy: race.salary });
	if (race.partisanType) items.push({ subhead: 'Partisan Type', bodyCopy: race.partisanType });
	if (race.frequency?.length) {
		items.push({ subhead: 'Election Frequency', bodyCopy: formatFrequency(race.frequency) });
	}
	return items;
}

export function buildPositionBottomItems(race: RaceDetail) {
	const items: { headline: string; bodyCopy: ReactNode }[] = [];
	if (race.eligibilityRequirements) {
		items.push({ headline: 'Eligibility Requirements', bodyCopy: race.eligibilityRequirements });
	}
	if (race.filingRequirements) {
		items.push({ headline: 'Filing Requirements', bodyCopy: race.filingRequirements });
	}
	if (race.paperworkInstructions) {
		items.push({ headline: 'Paperwork Instructions', bodyCopy: race.paperworkInstructions });
	}
	if (race.filingOfficeAddress) {
		items.push({
			headline: 'Filing Office',
			bodyCopy: (
				<Link
					href={`https://maps.google.com/?q=${encodeURIComponent(race.filingOfficeAddress)}`}
					target='_blank'
					rel='noopener noreferrer'
					className='text-goodparty-blue hover:underline'
				>
					{race.filingOfficeAddress}
				</Link>
			),
		});
	}
	if (race.filingPhoneNumber) {
		items.push({
			headline: 'Filing Phone',
			bodyCopy: (
				<Link href={`tel:${race.filingPhoneNumber}`} className='text-goodparty-blue hover:underline'>
					{race.filingPhoneNumber}
				</Link>
			),
		});
	}
	return items;
}

export function buildPositionTokens(ctx: Pick<PositionPageContext, 'officeName' | 'stateName' | 'countyName' | 'cityName'>): TokenMap {
	const locationName = ctx.cityName ?? ctx.countyName ?? ctx.stateName;
	const locationParts = [ctx.cityName, ctx.countyName, ctx.stateName].filter(Boolean);
	return {
		'[office name]': ctx.officeName,
		'[office]': ctx.officeName,
		'[State]': ctx.stateName,
		'[County or City]': locationName,
		'[location]': locationParts.join(', '),
	};
}

export function buildCandidatesTokens(
	ctx: Pick<PositionPageContext, 'officeName' | 'stateName' | 'countyName' | 'cityName'>,
): TokenMap {
	const locationName = ctx.cityName ?? ctx.countyName ?? ctx.stateName;
	const locationParts = [ctx.cityName, ctx.countyName, ctx.stateName].filter(Boolean);
	return {
		'[office]': ctx.officeName,
		'[office name]': ctx.officeName,
		'[State]': ctx.stateName,
		'[County or City]': locationName,
		'[location]': locationParts.join(', '),
	};
}

export function buildProfileTokens(ctx: { candidateName: string; officeName: string }): TokenMap {
	return {
		'[candidate name]': ctx.candidateName,
		'[office name]': ctx.officeName,
	};
}

export function buildPositionSectionOverrides(ctx: PositionPageContext): SectionOverrides {
	const race = ctx.race;
	return {
		component_breadcrumbBlock: { breadcrumbs: ctx.breadcrumbs },
		component_electionsPositionHero: {
			officeName: ctx.officeName,
			stateName: ctx.stateName,
			countyName: ctx.countyName,
			cityName: ctx.cityName,
			electionDate: ctx.electionDate,
			filingDate: ctx.filingDate,
			ctaHref: ctx.candidatesHref,
			ctaLabel: 'Run for office',
		},
		component_electionsPositionContentBlock: {
			topHeadline: 'Position Details',
			gridItems: race ? buildPositionGridItems(race) : [],
			bottomItems: race ? buildPositionBottomItems(race) : [],
			card: race?.positionDescription
				? {
						headline: ctx.officeName,
						subhead: 'About this position',
						bodyCopy: race.positionDescription,
						primaryCTA: {
							buttonType: 'external',
							href: '/get-a-demo',
							label: 'Book now',
							buttonProps: { styleType: secondaryButtonStyleType },
						},
					}
				: undefined,
			...(ctx.candidatesHref
				? {
						rightColumnCTA: {
							buttonType: 'internal' as const,
							href: ctx.candidatesHref,
							label: 'View candidates',
							buttonProps: { styleType: secondaryButtonStyleType },
						},
					}
				: {}),
		},
		component_faqBlock: {
			items: race
				? buildDynamicFAQItems(race, ctx.officeName, ctx.stateName)
				: POSITION_PAGE_FAQ.items.map(item => ({ title: item.title, copy: item.copy })),
		},
		component_ctaBlock: {
			primaryButtonHref: ctx.candidatesHref,
		},
		component_electionPositionResourcesBlock: {
			guideHref: resolveHowToRunGuide({ officeName: ctx.officeName, race }).href,
		},
		component_nearbyOffices: {
			offices: ctx.nearbyOffices ?? [],
			hidden: !ctx.nearbyOffices || ctx.nearbyOffices.length === 0,
		},
	};
}

export function buildCandidatesSectionOverrides(
	ctx: PositionPageContext & { candidates: CandidateCard[] },
): SectionOverrides {
	return {
		component_breadcrumbBlock: { breadcrumbs: ctx.breadcrumbs },
		component_electionsPositionHero: {
			officeName: ctx.officeName,
			stateName: ctx.stateName,
			countyName: ctx.countyName,
			cityName: ctx.cityName,
			electionDate: ctx.electionDate,
			filingDate: ctx.filingDate,
			ctaHref: ctx.positionHref,
			ctaLabel: 'Back to position',
		},
		component_candidatesBlock: {
			candidates: ctx.candidates,
			header: {
				title: `Candidates for ${ctx.officeName}`,
				copy: `Candidates running for ${ctx.officeName} in ${[ctx.cityName, ctx.countyName, ctx.stateName].filter(Boolean).join(', ')}.`,
			},
		},
		component_ctaImageBlock: {
			primaryButtonHref: ctx.locationHref,
		},
	};
}

export function buildPositionPageSchemas(ctx: PositionPageContext) {
	const race = ctx.race;
	const pageUrl = ctx.pageUrl;
	const positionPageSchema =
		race && pageUrl
			? buildPositionPageSchema({
					race,
					officeName: ctx.officeName,
					stateName: ctx.stateName,
					countyName: ctx.countyName,
					cityName: ctx.cityName,
					pageUrl,
				})
			: undefined;
	const breadcrumbSchema = buildBreadcrumbSchema(ctx.breadcrumbs, toAbsoluteUrl);
	const faqItems = race
		? buildDynamicFAQItems(race, ctx.officeName, ctx.stateName)
		: POSITION_PAGE_FAQ.items.map(item => ({ title: item.title, copy: item.copy }));
	const faqSchema = buildFAQSchema(faqItems);
	return { positionPageSchema, breadcrumbSchema, faqSchema };
}

export function buildCandidatesPageSchema(ctx: PositionPageContext) {
	const locationParts = [ctx.cityName, ctx.countyName, ctx.stateName].filter(Boolean);
	const locationName = locationParts.join(', ');
	const lastCrumbHref = ctx.breadcrumbs[ctx.breadcrumbs.length - 1]?.href;
	const candidatesPageUrl = lastCrumbHref ? toAbsoluteUrl(lastCrumbHref) : undefined;
	return buildSchemaGraph([
		candidatesPageUrl
			? buildWebPageSchema({
					url: candidatesPageUrl,
					name: `Candidates for ${ctx.officeName} in ${locationName}`,
					description: `Candidates running for ${ctx.officeName} in ${locationName}.`,
					pageType: 'CollectionPage',
				})
			: null,
		buildBreadcrumbSchema(ctx.breadcrumbs, toAbsoluteUrl),
	]);
}

export type ElectionsIndexPageContext = {
	breadcrumbs: BreadcrumbItem[];
	locationLevel: 'state' | 'county' | 'city' | 'district';
	stateName: string;
	countyName?: string;
	cityName?: string;
	bodyCopy?: string;
	heroTitle?: string;
	/** Kept for the search block that takes over the input the location hero used to render. */
	searchPlaceholder?: string;
	listHeading?: string;
	defaultYear?: number;
	availableYears?: number[];
	offices?: OfficeItem[];
	elections?: ElectionItem[];
	stateSlug?: string;
	pageUrl?: string;
	pageTitle?: string;
	pageDescription?: string;
	electionsIndexHeader?: { title?: string; copy?: string; searchPlaceholder?: string };
	electionsIndexHidden?: boolean;
	locationFacts?: {
		title?: string;
		factsCards?: Array<{ factType: string; label: string; value: string }>;
		hidden?: boolean;
	};
	/**
	 * The page's editorial prose for `component_locationEditorialBlock`, one
	 * string per paragraph. No route sets it yet: the copy is written per
	 * location outside this repo and the source it will be read from is not
	 * decided, so the block stays hidden on location pages until this is fed.
	 */
	locationEditorial?: {
		heading?: string;
		paragraphs?: string[];
	};
};

export function buildElectionsIndexSectionOverrides(ctx: ElectionsIndexPageContext): SectionOverrides {
	return {
		component_breadcrumbBlock: { breadcrumbs: ctx.breadcrumbs },
		component_locationLandingPageHero: {
			locationLevel: ctx.locationLevel,
			stateName: ctx.heroTitle ?? ctx.stateName,
			countyName: ctx.countyName,
			cityName: ctx.cityName,
			bodyCopy: ctx.bodyCopy,
		},
		component_listOfOfficesBlock: {
			// The block renders `headline`, so that is where the location-named
			// heading has to go. It used to be sent the bare level label instead,
			// which published a card headed "state" / "county" / "municipal".
			headline: ctx.listHeading,
			defaultYear: ctx.defaultYear,
			availableYears: ctx.availableYears,
			offices: ctx.offices,
		},
		component_electionsIndexBlock: {
			elections: ctx.elections,
			stateSlug: ctx.stateSlug,
			hidden: ctx.electionsIndexHidden,
			header: ctx.electionsIndexHeader,
		},
		component_locationFactsBlock: ctx.locationFacts
			? {
					headerTitle: ctx.locationFacts.title,
					factsCards: ctx.locationFacts.factsCards,
					hidden: ctx.locationFacts.hidden,
				}
			: undefined,
		component_locationEditorialBlock: ctx.locationEditorial
			? {
					heading: ctx.locationEditorial.heading,
					paragraphs: ctx.locationEditorial.paragraphs,
				}
			: undefined,
	};
}

export function buildElectionsIndexPageSchema(ctx: ElectionsIndexPageContext) {
	if (!ctx.pageUrl) return undefined;
	// Most-specific jurisdiction the page represents (city > county > state).
	const localityName = ctx.cityName ?? ctx.countyName ?? ctx.stateName;
	return buildSchemaGraph([
		buildWebPageSchema({
			url: ctx.pageUrl,
			name: ctx.pageTitle ?? ctx.stateName,
			description: ctx.pageDescription,
		}),
		buildBreadcrumbSchema(ctx.breadcrumbs, toAbsoluteUrl),
		buildGovernmentOrganizationSchema({
			url: ctx.pageUrl,
			name: `${localityName} Government`,
			areaServed: localityName,
		}),
	]);
}
