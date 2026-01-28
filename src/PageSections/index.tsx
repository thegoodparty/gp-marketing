import { Fragment } from 'react';
import type { GoodpartyOrg_homeQueryResult } from 'sanity.types';
import { BannerBlockSection } from '~/PageSections/BannerBlockSection';
import { BlogBlockSection } from '~/PageSections/BlogBlockSection';
import { BlogTopicTagsBlockSection } from '~/PageSections/BlogTopicTagsBlockSection';
import { BreadcrumbBlockSection } from '~/PageSections/BreadcrumbBlockSection';
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
import { HeroBlockSection } from '~/PageSections/HeroBlockSection';
import { HeroWithSubscribeBlockSection } from '~/PageSections/HeroWithSubscribeBlockSection';
import { IconContentBlockSection } from '~/PageSections/IconContentBlockSection';
import { ImageContentBlockSection } from '~/PageSections/ImageContentBlockSection';
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
import { ElectionsSearchHeroSection } from '~/PageSections/ElectionsSearchHeroSection';
import { ComponentErrorBoundary } from '~/ui/ComponentErrorBoundary';

export type Sections = NonNullable<NonNullable<NonNullable<GoodpartyOrg_homeQueryResult>['pageSections']>['list_pageSections']>[number];

type Props = {
	pageSections?: Sections[] | null;
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
							<CandidatesBlockSection {...section} />
						</ComponentErrorBoundary>
					);
				case 'component_carouselBlock':
						return (
							<ComponentErrorBoundary key={section._key} componentName='Carousel Block'>
								<CarouselBlockSection {...section} />
							</ComponentErrorBoundary>
						);
				case 'component_claimProfileBlock':
					return (
						<ComponentErrorBoundary key={section._key} componentName='Claim Profile Block'>
							<ClaimProfileBlockSection {...section} />
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
				case 'component_twoUpCardBlock':
					return (
						<ComponentErrorBoundary key={section._key} componentName='Two Up Card Block'>
							<TwoUpCardBlockSection {...section} />
						</ComponentErrorBoundary>
					);
				case 'component_electionsIndexBlock':
					return (
						<ComponentErrorBoundary key={section._key} componentName='Elections Index Block'>
							<ElectionsIndexBlockSection {...section} />
				case 'component_electionsPositionHero':
					return (
						<ComponentErrorBoundary key={section._key} componentName='Elections Position Hero'>
							<ElectionsPositionHeroSection {...section} />
				case 'component_electionsSearchHero':
					return (
						<ComponentErrorBoundary key={section._key} componentName='Elections Search Hero'>
							<ElectionsSearchHeroSection {...section} />
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
