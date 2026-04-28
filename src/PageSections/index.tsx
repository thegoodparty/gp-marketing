import { Fragment } from 'react';
import type { GoodpartyOrg_homeQueryResult } from 'sanity.types';
import { BannerBlockSection } from '~/PageSections/BannerBlockSection';
import { BlogBlockSection } from '~/PageSections/BlogBlockSection';
import { BlogTopicTagsBlockSection } from '~/PageSections/BlogTopicTagsBlockSection';
import { BreadcrumbBlockSection } from '~/PageSections/BreadcrumbBlockSection';
import { CalculatorTextBlockSection } from '~/PageSections/CalculatorTextBlockSection';
import { CandidatesBlockSection } from '~/PageSections/CandidatesBlockSection';
import { CarouselBlockSection } from '~/PageSections/CarouselBlockSection';
import { ClaimProfileBlockSection } from '~/PageSections/ClaimProfileBlockSection';
import { ComparisonBlockSection } from '~/PageSections/ComparisonBlockSection';
import { CTABannerBlockSection } from '~/PageSections/CTABannerBlockSection';
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

export type Sections = NonNullable<NonNullable<NonNullable<GoodpartyOrg_homeQueryResult>['pageSections']>['list_pageSections']>[number];

export type SectionOverrides = {
	component_candidatesBlock?: { candidates?: import('~/ui/CandidatesBlock').CandidateCard[] };
	component_electionsIndexBlock?: {
		elections?: import('~/ui/ElectionsIndexBlock').ElectionItem[];
		stateSlug?: string;
	};
	component_electionsPositionHero?: import('~/PageSections/ElectionsPositionHeroSection').OfficeData;
	component_electionsPositionContentBlock?: import('~/PageSections/ElectionsPositionContentBlockSection').ElectionsPositionContentBlockOverride;
	component_profileHero?: {
		candidateName: string;
		office: string;
		profileImageUrl?: string;
		isEmpowered?: boolean;
	};
	component_profileContentBlock?: {
		profileData?: import('~/PageSections/ProfileContentBlockSection').ProfileData;
		officeData?: import('~/PageSections/ProfileContentBlockSection').OfficeData;
	};
	component_claimProfileBlock?: {
		claimed?: boolean;
		candidateName?: string;
		partyAffiliation?: string;
	};
};

type Props = {
	pageSections?: Sections[] | null;
	sectionOverrides?: SectionOverrides;
};

export function PageSections(props: Props) {
	if (!props.pageSections) {
		return null;
	}

	return (
		<>
			{props.pageSections.map((section, i) => {
				switch (section._type) {
					case 'component_bannerBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Banner Block'>
								<BannerBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_breadcrumbBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Breadcrumb Block'>
								<BreadcrumbBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_blogBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Blog Block'>
								<BlogBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_blogTopicTagsBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Blog Topic Tags Block'>
								<BlogTopicTagsBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_candidatesBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Candidates Block'>
								<CandidatesBlockSection
									{...section}
									candidatesOverride={props.sectionOverrides?.component_candidatesBlock?.candidates}
								/>
							</ComponentErrorBoundary>
						);
					case 'component_calculatorTextBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Calculator Text Block'>
								<CalculatorTextBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_carouselBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Carousel Block'>
								<CarouselBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_claimProfileBlock':
						if (props.sectionOverrides?.component_claimProfileBlock?.claimed) {
							return <Fragment key={section._key} />;
						}
						return (
							<ComponentErrorBoundary key={section._key} componentName='Claim Profile Block'>
								<ClaimProfileBlockSection
									{...section}
									claimProfileOverride={props.sectionOverrides?.component_claimProfileBlock as SectionOverrides['component_claimProfileBlock']}
								/>
							</ComponentErrorBoundary>
						);
					case 'component_comparisonBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Comparison Block'>
								<ComparisonBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_ctaBannerBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='CTA Banner Block'>
								<CTABannerBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_ctaBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='CTA Block'>
								<CTABlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_ctaCardsBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='CTA Cards Block'>
								<CTACardsBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_ctaImageBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='CTA Image Block'>
								<CTAImageBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_faqBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='FAQ Block'>
								<FAQBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_featuredBlogBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Featured Blog Block'>
								<FeaturedBlogBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_featuresBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Features Block'>
								<FeaturesBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_jobOpeningsBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Job Openings Block'>
								<JobOpeningsBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_hero':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Hero Block'>
								<HeroBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_heroWithSubscribe':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Hero With Subscribe Block'>
								<HeroWithSubscribeBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_profileHero':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Profile Hero'>
								<ProfileHeroSection
									{...section}
									profileHeroOverride={props.sectionOverrides?.component_profileHero}
								/>
							</ComponentErrorBoundary>
						);
					case 'component_iconContentBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Icon Content Block'>
								<IconContentBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_imageContentBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Image Content Block'>
								<ImageContentBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_newsletterBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Newsletter Block'>
								<NewsletterBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_pricingBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Pricing Block'>
								<PricingBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_statsBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Stats Block'>
								<StatsBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_stepperBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Stepper Block'>
								<StepperBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_tabbedImageBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Tabbed Image Block'>
								<TabbedImageBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_teamBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Team Block'>
								<TeamBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_testimonialBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Testimonial Block'>
								<TestimonialBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_twoUpCardBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Two Up Card Block'>
								<TwoUpCardBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_electionsIndexBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Elections Index Block'>
								<ElectionsIndexBlockSection
									{...section}
									electionsOverride={props.sectionOverrides?.component_electionsIndexBlock?.elections}
									stateSlugOverride={props.sectionOverrides?.component_electionsIndexBlock?.stateSlug}
								/>
							</ComponentErrorBoundary>
						);
					case 'component_electionsPositionHero':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Elections Position Hero'>
								<ElectionsPositionHeroSection
									{...section}
									officeData={props.sectionOverrides?.component_electionsPositionHero}
								/>
							</ComponentErrorBoundary>
						);
					case 'component_electionsPositionContentBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Elections Position Content Block'>
								<ElectionsPositionContentBlockSection
									{...section}
									contentOverride={props.sectionOverrides?.component_electionsPositionContentBlock}
								/>
							</ComponentErrorBoundary>
						);
					case 'component_electionsSearchHero':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Elections Search Hero'>
								<ElectionsSearchHeroSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_featuredCitiesBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Featured Cities Block'>
								<FeaturedCitiesBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_goodPartyOrgPledge':
						return (
							<ComponentErrorBoundary key={section._key} componentName='GoodParty.org Pledge'>
								<GoodPartyOrgPledgeSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_locationLandingPageHero':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Location Landing Page Hero'>
								<LocationLandingPageHeroSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_locationFactsBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Location Facts Block'>
								<LocationFactsBlockSection {...section} />
							</ComponentErrorBoundary>
						);
					case 'component_profileContentBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Profile Content Block'>
								<ProfileContentBlockSection
									{...section}
									profileData={props.sectionOverrides?.component_profileContentBlock?.profileData}
									officeData={props.sectionOverrides?.component_profileContentBlock?.officeData}
								/>
							</ComponentErrorBoundary>
						);
					case 'component_listOfOfficesBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='List of Offices Block'>
								<ListOfOfficesBlockSection {...section} />
							</ComponentErrorBoundary>
						);
				case 'component_embeddedBlock':
					return (
						<ComponentErrorBoundary key={section._key} componentName='Embedded Block'>
							<EmbeddedBlockSection {...section} />
						</ComponentErrorBoundary>
					);
				case 'component_teamValuesBlock':
					return (
						<ComponentErrorBoundary key={section._key} componentName='Team Values Block'>
							<TeamValuesBlockSection {...section} />
						</ComponentErrorBoundary>
					);
				// @ts-expect-error — run `bun run sanity:generate` to add component_testimonialAutoScroll to the Sections union
				case 'component_testimonialAutoScroll':
					return (
						<ComponentErrorBoundary key={section._key} componentName='Testimonials Auto Scroll'>
							<TestimonialAutoScrollSection {...(section as any)} />
						</ComponentErrorBoundary>
					);
				default:
						console.warn('unknown section._type', section['_type']);
						return <Fragment key={`unknown section._type' ${i}`} />;
				}
			})}
		</>
	);
}
