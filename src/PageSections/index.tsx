import { Fragment, type PropsWithChildren } from 'react';
import type { GoodpartyOrg_homeQueryResult } from 'sanity.types';
import { BannerBlockSection } from '~/PageSections/BannerBlockSection';
import { BlogBlockSection } from '~/PageSections/BlogBlockSection';
import { BlogTopicTagsBlockSection } from '~/PageSections/BlogTopicTagsBlockSection';
import { BreadcrumbBlockSection } from '~/PageSections/BreadcrumbBlockSection';
import { CalculatorTextBlockSection } from '~/PageSections/CalculatorTextBlockSection';
import { CandidatesBlockSection } from '~/PageSections/CandidatesBlockSection';
import { CarouselBlockSection } from '~/PageSections/CarouselBlockSection';
import { ClaimProfileBlockSection } from '~/PageSections/ClaimProfileBlockSection';
import { VoterDensityBlockSection } from '~/PageSections/VoterDensityBlockSection';
import { ComparisonBlockSection } from '~/PageSections/ComparisonBlockSection';
import { CTABannerBlockSection } from '~/PageSections/CTABannerBlockSection';
import { ClickToCallBlockSection } from '~/PageSections/ClickToCallBlockSection';
import { CTABlockSection } from '~/PageSections/CTABlockSection';
import { CTACardsBlockSection } from '~/PageSections/CTACardsBlockSection';
import { CTAImageBlockSection } from '~/PageSections/CTAImageBlockSection';
import { FAQBlockSection } from '~/PageSections/FAQBlockSection';
import { FeaturedBlogBlockSection } from '~/PageSections/FeaturedBlogBlockSection';
import { FeaturesBlockSection } from '~/PageSections/FeaturesBlockSection';
import { JobOpeningsBlockSection } from '~/PageSections/JobOpeningsBlockSection';
import { HeroBlockSection } from '~/PageSections/HeroBlockSection';
import { HeroWithSubscribeBlockSection } from '~/PageSections/HeroWithSubscribeBlockSection';
import { ProfileHeroSection } from '~/PageSections/ProfileHeroSection';
import { IconContentBlockSection } from '~/PageSections/IconContentBlockSection';
import { ImageContentBlockSection } from '~/PageSections/ImageContentBlockSection';
import { LocationLandingPageHeroSection } from '~/PageSections/LocationLandingPageHeroSection';
import { NewsletterBlockSection } from '~/PageSections/NewsletterBlockSection';
import { PricingBlockSection } from '~/PageSections/PricingBlockSection';
import { StatsBlockSection } from '~/PageSections/StatsBlockSection';
import { StepperBlockSection } from '~/PageSections/StepperBlockSection';
import { TabbedImageBlockSection } from '~/PageSections/TabbedImageBlockSection';
import { TeamBlockSection } from '~/PageSections/TeamBlockSection';
import { TestimonialBlockSection } from '~/PageSections/TestimonialBlockSection';
import { TwoUpCardBlockSection } from '~/PageSections/TwoUpCardBlockSection';
import { ElectionsIndexBlockSection } from '~/PageSections/ElectionsIndexBlockSection';
import { ElectionsPositionHeroSection } from '~/PageSections/ElectionsPositionHeroSection';
import { ElectionsPositionContentBlockSection } from '~/PageSections/ElectionsPositionContentBlockSection';
import { ElectionsSearchHeroSection } from '~/PageSections/ElectionsSearchHeroSection';
import { FeaturedCitiesBlockSection } from '~/PageSections/FeaturedCitiesBlockSection';
import { GoodPartyOrgPledgeSection } from '~/PageSections/GoodPartyOrgPledgeSection';
import { LocationFactsBlockSection } from '~/PageSections/LocationFactsBlockSection';
import { ProfileContentBlockSection } from '~/PageSections/ProfileContentBlockSection';
import { ListOfOfficesBlockSection } from '~/PageSections/ListOfOfficesBlockSection';
import { EmbeddedBlockSection } from '~/PageSections/EmbeddedBlockSection';
import { TeamValuesBlockSection } from '~/PageSections/TeamValuesBlockSection';
import { TestimonialAutoScrollSection } from '~/PageSections/TestimonialAutoScrollSection';
import { ComponentErrorBoundary } from '~/ui/ComponentErrorBoundary';
import type { TokenMap } from '~/lib/resolveTokens';

export type Sections = NonNullable<NonNullable<NonNullable<GoodpartyOrg_homeQueryResult>['pageSections']>['list_pageSections']>[number];

export type { TokenMap };

export type SectionOverrides = {
	component_candidatesBlock?: {
		candidates?: import('~/ui/CandidatesBlock').CandidateCard[];
		header?: { title?: string; copy?: string };
		/**
		 * Per-section-`_key` overrides. A page may render the same candidatesBlock
		 * type more than once (e.g. person profiles show "Other candidates" and
		 * "Nearby officials"); this lets each instance receive its own data. Falls
		 * back to the type-level `candidates`/`header` when a `_key` isn't listed.
		 */
		byKey?: Record<
			string,
			{ candidates?: import('~/ui/CandidatesBlock').CandidateCard[]; header?: { title?: string; copy?: string }; hidden?: boolean }
		>;
	};
	component_electionsIndexBlock?: {
		elections?: import('~/ui/ElectionsIndexBlock').ElectionItem[];
		stateSlug?: string;
		hidden?: boolean;
		header?: { title?: string; copy?: string; searchPlaceholder?: string };
	};
	component_locationFactsBlock?: {
		headerTitle?: string;
		factsCards?: Array<{ factType: string; label: string; value: string }>;
		hidden?: boolean;
	};
	component_electionsPositionHero?: import('~/PageSections/ElectionsPositionHeroSection').OfficeData;
	component_electionsPositionContentBlock?: import('~/PageSections/ElectionsPositionContentBlockSection').ElectionsPositionContentBlockOverride;
	component_locationLandingPageHero?: {
		locationLevel?: 'state' | 'county' | 'city' | 'district';
		stateName?: string;
		countyName?: string;
		cityName?: string;
		bodyCopy?: string;
		searchPlaceholder?: string;
	};
	component_listOfOfficesBlock?: {
		heading?: string;
		headline?: string;
		defaultYear?: number;
		availableYears?: number[];
		offices?: import('~/ui/ListOfOfficesBlock').OfficeItem[];
	};
	component_faqBlock?: {
		items?: Array<{ title: string; copy: string }>;
	};
	component_ctaBlock?: {
		primaryButtonHref?: string;
	};
	component_ctaImageBlock?: {
		primaryButtonHref?: string;
	};
	component_profileHero?: {
		candidateName: string;
		office: string;
		profileImageUrl?: string;
		isEmpowered?: boolean;
		/** Person profiles: renders a "Took the GoodParty.org Pledge" badge under the hero. */
		pledged?: boolean;
	};
	component_goodPartyOrgPledge?: {
		hidden?: boolean;
	};
	component_ctaBannerBlock?: {
		hidden?: boolean;
	};
	component_profileContentBlock?: {
		profileData?: import('~/PageSections/ProfileContentBlockSection').ProfileData;
		officeData?: import('~/PageSections/ProfileContentBlockSection').OfficeData;
		/**
		 * Prebuilt content cards / sidebar for callers whose content is richer than
		 * the plain-string `profileData` (e.g. person profiles render numbered
		 * issues with status tags, accomplishments, and recent experience). When
		 * provided these win over `profileData`/`officeData`.
		 */
		contentCards?: import('~/ui/ProfileContentCard').ProfileContentCardProps[];
		sidebar?: import('~/ui/ElectionsSidebar').ElectionsSidebarProps;
		/**
		 * @deprecated The district voter-density map is now its own
		 * `component_voterDensityBlock` section; person profiles no longer inject it
		 * here. Retained for any non-person caller still rendering it inline.
		 */
		districtMap?: import('react').ReactNode;
		/** When true the section renders nothing (used to gate empty/removed states). */
		hidden?: boolean;
	};
	component_voterDensityBlock?: {
		/** Prebuilt district voter-density map node (coverage/k-anon gating already applied). */
		map?: import('react').ReactNode;
		/** When true the section renders nothing. */
		hidden?: boolean;
	};
	component_breadcrumbBlock?: {
		breadcrumbs: import('~/ui/BreadcrumbBlock').BreadcrumbItem[];
	};
	component_claimProfileBlock?: {
		claimed?: boolean;
		candidateName?: string;
		partyAffiliation?: string;
		layout?: 'card' | 'banner';
		// When set, render the interactive claim/notify modal (which posts the
		// personId to the claim-request endpoint → ProfileClaimRequest) instead of
		// the static CMS banner. Populated for unclaimed person profiles.
		interactive?: boolean;
		personId?: string;
		displayName?: string;
		persona?: 'candidate' | 'officeholder' | 'both' | 'past';
	};
};

type Props = {
	pageSections?: Sections[] | null;
	sectionOverrides?: SectionOverrides;
	tokens?: TokenMap;
	pageSlug?: string;
	faqSlugMap?: ReadonlyMap<string, string>;
	/**
	 * The default `ComponentErrorBoundary` is an async server component (it awaits
	 * `draftMode()`), so it can't render in client-only contexts like Storybook.
	 * Set this in direct/preview renders (e.g. the PersonProfile component) to swap
	 * in a synchronous passthrough. Server pages leave it off for real boundaries.
	 */
	disableErrorBoundary?: boolean;
};

/** Sync no-op boundary for client/preview render contexts (see `disableErrorBoundary`). */
function PassthroughBoundary({ children }: PropsWithChildren & { componentName?: string }) {
	return <>{children}</>;
}

export function PageSections(props: Props) {
	if (!props.pageSections) {
		return null;
	}

	const Boundary = props.disableErrorBoundary ? PassthroughBoundary : ComponentErrorBoundary;

	return (
		<>
			{props.pageSections.map((section, i) => {
				switch (section._type) {
					case 'component_bannerBlock':
						return (
							<Boundary key={section._key} componentName='Banner Block'>
								<BannerBlockSection {...section} />
							</Boundary>
						);
					case 'component_breadcrumbBlock':
						return (
							<Boundary key={section._key} componentName='Breadcrumb Block'>
								<BreadcrumbBlockSection {...section} breadcrumbOverride={props.sectionOverrides?.component_breadcrumbBlock} />
							</Boundary>
						);
					case 'component_blogBlock':
						return (
							<Boundary key={section._key} componentName='Blog Block'>
								<BlogBlockSection {...section} />
							</Boundary>
						);
					case 'component_blogTopicTagsBlock':
						return (
							<Boundary key={section._key} componentName='Blog Topic Tags Block'>
								<BlogTopicTagsBlockSection {...section} />
							</Boundary>
						);
					case 'component_candidatesBlock': {
						const cbOverride = props.sectionOverrides?.component_candidatesBlock;
						const cbPerKey = section._key ? cbOverride?.byKey?.[section._key] : undefined;
						if (cbPerKey?.hidden) {
							return <Fragment key={section._key} />;
						}
						return (
							<Boundary key={section._key} componentName='Candidates Block'>
								<CandidatesBlockSection
									{...section}
									tokens={props.tokens}
									candidatesOverride={cbPerKey?.candidates ?? cbOverride?.candidates}
									headerOverride={cbPerKey?.header ?? cbOverride?.header}
								/>
							</Boundary>
						);
					}
					case 'component_calculatorTextBlock':
						return (
							<Boundary key={section._key} componentName='Calculator Text Block'>
								<CalculatorTextBlockSection {...section} />
							</Boundary>
						);
					case 'component_carouselBlock':
						return (
							<Boundary key={section._key} componentName='Carousel Block'>
								<CarouselBlockSection {...section} tokens={props.tokens} />
							</Boundary>
						);
					case 'component_claimProfileBlock':
						if (props.sectionOverrides?.component_claimProfileBlock?.claimed) {
							return <Fragment key={section._key} />;
						}
						return (
							<Boundary key={section._key} componentName='Claim Profile Block'>
								<ClaimProfileBlockSection
									{...section}
									tokens={props.tokens}
									claimProfileOverride={props.sectionOverrides?.component_claimProfileBlock}
								/>
							</Boundary>
						);
					case 'component_voterDensityBlock':
						if (props.sectionOverrides?.component_voterDensityBlock?.hidden) {
							return <Fragment key={section._key} />;
						}
						return (
							<Boundary key={section._key} componentName='Voter Density Map Block'>
								<VoterDensityBlockSection {...section} voterDensityOverride={props.sectionOverrides?.component_voterDensityBlock} />
							</Boundary>
						);
					case 'component_comparisonBlock':
						return (
							<Boundary key={section._key} componentName='Comparison Block'>
								<ComparisonBlockSection {...section} />
							</Boundary>
						);
					case 'component_ctaBannerBlock':
						if (props.sectionOverrides?.component_ctaBannerBlock?.hidden) {
							return <Fragment key={section._key} />;
						}
						return (
							<Boundary key={section._key} componentName='CTA Banner Block'>
								<CTABannerBlockSection {...section} tokens={props.tokens} />
							</Boundary>
						);
					case 'component_ctaBlock':
						return (
							<Boundary key={section._key} componentName='CTA Block'>
								<CTABlockSection {...section} tokens={props.tokens} ctaOverride={props.sectionOverrides?.component_ctaBlock} />
							</Boundary>
						);
					case 'component_clickToCallBlock':
						return (
							<Boundary key={section._key} componentName='Click to Call Block'>
								<ClickToCallBlockSection {...section} />
							</Boundary>
						);
					case 'component_ctaCardsBlock':
						return (
							<Boundary key={section._key} componentName='CTA Cards Block'>
								<CTACardsBlockSection {...section} tokens={props.tokens} />
							</Boundary>
						);
					case 'component_ctaImageBlock':
						return (
							<Boundary key={section._key} componentName='CTA Image Block'>
								<CTAImageBlockSection {...section} tokens={props.tokens} ctaOverride={props.sectionOverrides?.component_ctaImageBlock} />
							</Boundary>
						);
					case 'component_faqBlock':
						return (
							<Boundary key={section._key} componentName='FAQ Block'>
								<FAQBlockSection
									{...section}
									tokens={props.tokens}
									faqOverride={props.sectionOverrides?.component_faqBlock}
									pageSlug={props.pageSlug}
									faqSlugMap={props.faqSlugMap}
								/>
							</Boundary>
						);
					case 'component_featuredBlogBlock':
						return (
							<Boundary key={section._key} componentName='Featured Blog Block'>
								<FeaturedBlogBlockSection {...section} />
							</Boundary>
						);
					case 'component_featuresBlock':
						return (
							<Boundary key={section._key} componentName='Features Block'>
								<FeaturesBlockSection {...section} />
							</Boundary>
						);
					case 'component_jobOpeningsBlock':
						return (
							<Boundary key={section._key} componentName='Job Openings Block'>
								<JobOpeningsBlockSection {...section} />
							</Boundary>
						);
					case 'component_hero':
						return (
							<Boundary key={section._key} componentName='Hero Block'>
								<HeroBlockSection {...section} />
							</Boundary>
						);
					case 'component_heroWithSubscribe':
						return (
							<Boundary key={section._key} componentName='Hero With Subscribe Block'>
								<HeroWithSubscribeBlockSection {...section} />
							</Boundary>
						);
					case 'component_profileHero':
						return (
							<Boundary key={section._key} componentName='Profile Hero'>
								<ProfileHeroSection
									{...section}
									tokens={props.tokens}
									profileHeroOverride={props.sectionOverrides?.component_profileHero}
								/>
							</Boundary>
						);
					case 'component_iconContentBlock':
						return (
							<Boundary key={section._key} componentName='Icon Content Block'>
								<IconContentBlockSection {...section} />
							</Boundary>
						);
					case 'component_imageContentBlock':
						return (
							<Boundary key={section._key} componentName='Image Content Block'>
								<ImageContentBlockSection {...section} />
							</Boundary>
						);
					case 'component_newsletterBlock':
						return (
							<Boundary key={section._key} componentName='Newsletter Block'>
								<NewsletterBlockSection {...section} />
							</Boundary>
						);
					case 'component_pricingBlock':
						return (
							<Boundary key={section._key} componentName='Pricing Block'>
								<PricingBlockSection {...section} />
							</Boundary>
						);
					case 'component_statsBlock':
						return (
							<Boundary key={section._key} componentName='Stats Block'>
								<StatsBlockSection {...section} />
							</Boundary>
						);
					case 'component_stepperBlock':
						return (
							<Boundary key={section._key} componentName='Stepper Block'>
								<StepperBlockSection {...section} tokens={props.tokens} />
							</Boundary>
						);
					case 'component_tabbedImageBlock':
						return (
							<Boundary key={section._key} componentName='Tabbed Image Block'>
								<TabbedImageBlockSection {...section} />
							</Boundary>
						);
					case 'component_teamBlock':
						return (
							<Boundary key={section._key} componentName='Team Block'>
								<TeamBlockSection {...section} />
							</Boundary>
						);
					case 'component_testimonialBlock':
						return (
							<Boundary key={section._key} componentName='Testimonial Block'>
								<TestimonialBlockSection {...section} />
							</Boundary>
						);
					case 'component_twoUpCardBlock':
						return (
							<Boundary key={section._key} componentName='Two Up Card Block'>
								<TwoUpCardBlockSection {...section} tokens={props.tokens} />
							</Boundary>
						);
					case 'component_electionsIndexBlock':
						return (
							<Boundary key={section._key} componentName='Elections Index Block'>
								<ElectionsIndexBlockSection
									{...section}
									tokens={props.tokens}
									electionsOverride={props.sectionOverrides?.component_electionsIndexBlock?.elections}
									stateSlugOverride={props.sectionOverrides?.component_electionsIndexBlock?.stateSlug}
									indexOverride={props.sectionOverrides?.component_electionsIndexBlock}
								/>
							</Boundary>
						);
					case 'component_electionsPositionHero':
						return (
							<Boundary key={section._key} componentName='Elections Position Hero'>
								<ElectionsPositionHeroSection
									{...section}
									tokens={props.tokens}
									officeData={props.sectionOverrides?.component_electionsPositionHero}
								/>
							</Boundary>
						);
					case 'component_electionsPositionContentBlock':
						return (
							<Boundary key={section._key} componentName='Elections Position Content Block'>
								<ElectionsPositionContentBlockSection
									{...section}
									contentOverride={props.sectionOverrides?.component_electionsPositionContentBlock}
								/>
							</Boundary>
						);
					case 'component_electionsSearchHero':
						return (
							<Boundary key={section._key} componentName='Elections Search Hero'>
								<ElectionsSearchHeroSection {...section} />
							</Boundary>
						);
					case 'component_featuredCitiesBlock':
						return (
							<Boundary key={section._key} componentName='Featured Cities Block'>
								<FeaturedCitiesBlockSection {...section} />
							</Boundary>
						);
					case 'component_goodPartyOrgPledge':
						if (props.sectionOverrides?.component_goodPartyOrgPledge?.hidden) {
							return <Fragment key={section._key} />;
						}
						return (
							<Boundary key={section._key} componentName='GoodParty.org Pledge'>
								<GoodPartyOrgPledgeSection {...section} tokens={props.tokens} />
							</Boundary>
						);
					case 'component_locationLandingPageHero':
						return (
							<Boundary key={section._key} componentName='Location Landing Page Hero'>
								<LocationLandingPageHeroSection
									{...section}
									tokens={props.tokens}
									locationOverride={props.sectionOverrides?.component_locationLandingPageHero}
								/>
							</Boundary>
						);
					case 'component_locationFactsBlock':
						return (
							<Boundary key={section._key} componentName='Location Facts Block'>
								<LocationFactsBlockSection
									{...section}
									factsOverride={props.sectionOverrides?.component_locationFactsBlock}
									tokens={props.tokens}
								/>
							</Boundary>
						);
					case 'component_profileContentBlock': {
						const pcbOverride = props.sectionOverrides?.component_profileContentBlock;
						if (pcbOverride?.hidden) {
							return <Fragment key={section._key} />;
						}
						return (
							<Boundary key={section._key} componentName='Profile Content Block'>
								<ProfileContentBlockSection
									{...section}
									profileData={pcbOverride?.profileData}
									officeData={pcbOverride?.officeData}
									contentCardsOverride={pcbOverride?.contentCards}
									sidebarOverride={pcbOverride?.sidebar}
									districtMap={pcbOverride?.districtMap}
								/>
							</Boundary>
						);
					}
					case 'component_listOfOfficesBlock':
						return (
							<Boundary key={section._key} componentName='List of Offices Block'>
								<ListOfOfficesBlockSection
									{...section}
									tokens={props.tokens}
									officesOverride={props.sectionOverrides?.component_listOfOfficesBlock}
								/>
							</Boundary>
						);
					case 'component_embeddedBlock':
						return (
							<Boundary key={section._key} componentName='Embedded Block'>
								<EmbeddedBlockSection {...section} />
							</Boundary>
						);
					case 'component_teamValuesBlock':
						return (
							<Boundary key={section._key} componentName='Team Values Block'>
								<TeamValuesBlockSection {...section} />
							</Boundary>
						);
					case 'component_testimonialAutoScroll':
						return (
							<Boundary key={section._key} componentName='Testimonials Auto Scroll'>
								<TestimonialAutoScrollSection {...section} />
							</Boundary>
						);
					default:
						console.warn('unknown section._type', section['_type']);
						return <Fragment key={`unknown section._type' ${i}`} />;
				}
			})}
		</>
	);
}
