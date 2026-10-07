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
import { TestimonialBlockWithLinkSection } from '~/PageSections/TestimonialBlockWithLinkSection';
import { ComponentErrorBoundary } from '~/ui/ComponentErrorBoundary';
import type { TokenMap } from '~/lib/resolveTokens';

import { LocationEditorialBlockSection } from '~/PageSections/LocationEditorialBlockSection';

import { ElectionsNearYouBlockSection } from '~/PageSections/ElectionsNearYouBlockSection';

import { DemoRequestBlockSection } from '~/PageSections/DemoRequestBlockSection';

import { ElectionPositionResourcesBlockSection } from '~/PageSections/ElectionPositionResourcesBlockSection';
import { NearbyOfficesSection } from '~/PageSections/NearbyOfficesSection';

import { IllustratedColumnsBlockSection } from '~/PageSections/IllustratedColumnsBlockSection';

import { FeaturedCandidatesBlockSection } from '~/PageSections/FeaturedCandidatesBlockSection';

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
	component_locationEditorialBlock?: {
		/**
		 * Overrides the Sanity-authored heading (location index pages could set it
		 * per page, though today the token-driven CMS heading covers it).
		 */
		heading?: string;
		/**
		 * The page's own editorial prose, one string per paragraph. This is the
		 * seam the per-location copy attaches to: the block sits on the shared
		 * location templates, so a paragraph typed into Sanity would be identical
		 * on every page in that family. No route populates this yet — the writing
		 * pipeline that fills it is separate work — so on a real location page
		 * today the block falls back to the CMS field and, with that empty,
		 * renders nothing.
		 */
		paragraphs?: string[];
		/** When true the section renders nothing. */
		hidden?: boolean;
	};
	component_electionPositionResourcesBlock?: {
		/**
		 * The "how to run" article for this page's office, chosen from marketing's
		 * blog article matrix (`resolveHowToRunGuide`). It replaces the guide card's
		 * editor-set link. Only position pages supply it; without it the card falls
		 * back to the link set in Studio and, with neither, is left out.
		 */
		guideHref?: string;
		/**
		 * That article's own title, read from Sanity by the position renderer. It
		 * replaces the guide card's editor-set heading, whose "[office name]" token
		 * printed the raw office name ("How to Run for County Recorder-Register of
		 * Deeds-Register of Mesne Conveyance"); the article is written for the office
		 * type, so its title reads properly (Emily, 2026-10-06). Absent when the
		 * lookup fails, and the heading falls back to the editor copy.
		 */
		guideTitle?: string;
		/** When true the section renders nothing. */
		hidden?: boolean;
	};
	component_electionsPositionHero?: import('~/PageSections/ElectionsPositionHeroSection').OfficeData;
	component_electionsPositionContentBlock?: import('~/PageSections/ElectionsPositionContentBlockSection').ElectionsPositionContentBlockOverride;
	component_locationLandingPageHero?: {
		/** The whole headline. Without it the block falls back to the bare location name. */
		headline?: string;
		locationLevel?: 'state' | 'county' | 'city' | 'district';
		stateName?: string;
		countyName?: string;
		cityName?: string;
		bodyCopy?: string;
		/**
		 * The races on the page's ballot in the year the offices list opens on,
		 * counted off the same rows that list shows. The halo green card shows it
		 * (a real zero included) and hides when it is null.
		 */
		raceCount?: number | null;
		/**
		 * What the page knows about its independents, from the fetch that feeds
		 * `component_featuredCandidatesBlock`, scoped to the same year. The lavender
		 * card shows `candidateCount` (a real zero included) and hides when it is
		 * null; a button anchored to the featured block hides unless `hasAny`. Both
		 * this and `raceCount` are absent on pages that are not location pages,
		 * where the editor's figures and buttons render as written.
		 */
		independents?: import('~/lib/featuredPeople').IndependentsSummary;
	};
	component_listOfOfficesBlock?: {
		/**
		 * Fallback heading, used only when the template's own heading field is
		 * empty. The editor's field (with its location tokens) normally wins.
		 */
		headline?: string;
		defaultYear?: number;
		availableYears?: number[];
		offices?: import('~/ui/ListOfOfficesBlock').OfficeItem[];
		/**
		 * The level of the page itself, which sets the Level dropdown's default and
		 * which levels it offers. Populated by the location index routes; a block
		 * dropped on any other page falls back to showing its offices with no
		 * dropdown.
		 */
		pageLevel?: import('~/ui/ListOfOfficesBlock').OfficeLevel;
	};
	component_featuredCandidatesBlock?: {
		/**
		 * The candidates running in the page's own races and the people who
		 * currently hold its offices, as two lists so the block's Studio setting
		 * (candidates / representatives / both) can choose at render time. Only the
		 * location page routes populate this, through `getFeaturedPeople`; the
		 * section ranks pledged people first and caps at eight, and with nobody to
		 * show it renders nothing.
		 */
		candidates?: import('~/lib/featuredPeople').FeaturedPersonCard[];
		representatives?: import('~/lib/featuredPeople').FeaturedPersonCard[];
		/**
		 * The number of pledged people in the page's place and everything inside
		 * it, for the body copy's `[count of candidates]` placeholder. No route
		 * supplies it yet: election-api has no place-with-descendants filter on
		 * persons, so a count of all of Texas cannot be taken from a location page
		 * today (docs/election-redesign-components.md asks for one). Absent, the
		 * placeholder is left out of the sentence rather than published as a
		 * number taken from the partial carousel pool.
		 */
		pledgedCount?: number | null;
		/** When true the section renders nothing. */
		hidden?: boolean;
	};
	component_nearbyOffices?: {
		/**
		 * The heading the page computes for itself, used when the editor leaves the
		 * Heading field empty: "More offices in Bay City, Michigan", or just the state
		 * on a state position page, where the place and the state are the same name.
		 */
		heading?: string;
		/**
		 * The other upcoming positions near the one on the page, already picked and
		 * ordered (same place first, else one level up; capped at eight). Only the
		 * position page routes populate this, through `getNearbyOffices`; with no
		 * offices the section renders nothing.
		 */
		offices?: import('~/ui/ListOfOfficesBlock').OfficeItem[];
		/** When true the section renders nothing. */
		hidden?: boolean;
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
		/** When set, the hero office line links to the office/position page. */
		officeHref?: string;
		/** Second office line for someone serving and running at once (Figma C). */
		secondaryOffice?: string;
		/** When set, the second office line links to its own position page. */
		secondaryOfficeHref?: string;
		profileImageUrl?: string;
		isEmpowered?: boolean;
		/** Persona tag pills shown above the name (e.g. "Candidate", "Incumbent"). */
		tags?: string[];
		/**
		 * What the hero says about the person. `empowered` → the "Empowered by
		 * GoodParty.org" line (the /candidate framing); the three `pledge` variants
		 * are the /people ones and render the pledge callout, stating whether the
		 * person has taken the GoodParty.org Pledge, or is ineligible for it as a
		 * major-party affiliate; `none` → nothing. When omitted, falls back to
		 * `isEmpowered`.
		 */
		attribution?: 'empowered' | 'pledged' | 'notPledged' | 'pledgeIneligible' | 'none';
		/**
		 * Who the page is about, for the intro paragraph and the callout sentence
		 * ("This candidate…" / "This elected official…"). Only /people sets it; the
		 * legacy /candidate pages leave it out and render no intro.
		 */
		subject?: 'candidate' | 'elected official';
		/** GoodParty.org logo on the portrait and beside the attribution line. */
		showBrandMark?: boolean;
	};
	component_goodPartyOrgPledge?: {
		hidden?: boolean;
		/**
		 * Replaces the CMS-authored button under the band. Person profiles set it
		 * per state: "Take the pledge" into sign-up for someone who has not taken
		 * it, "Learn more" otherwise.
		 */
		button?: import('~/ui/Inputs/Button').ComponentButtonProps;
	};
	component_ctaBannerBlock?: {
		hidden?: boolean;
		/** Desktop content alignment. Person profiles center the CTA to match Figma. */
		align?: 'start' | 'center' | 'end';
		/** Overrides the Sanity-authored title (person profiles set it per state). */
		title?: string;
		/** Overrides the Sanity-authored body copy with plain text. */
		copy?: string;
		/** Overrides the CMS-authored button (person profiles supply "Learn more"). */
		button?: import('~/ui/Inputs/Button').ComponentButtonProps;
		/** Render the button's styleType as-is (skip the card-color inverse mapping). */
		preserveButtonStyle?: boolean;
		/** Align inner content with the profile content-card column (person profiles). */
		contentColumnAlign?: boolean;
		/**
		 * Full replacement node rendered in the CTA slot instead of the CMS banner.
		 * Used by unclaimed person profiles to render the interactive claim CTA band
		 * (heading + inline name/email form) in place of the "Join the movement" CTA.
		 */
		render?: import('react').ReactNode;
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
		/** Content-card layout ('separated' groups cards into Figma's white cards). */
		cardLayout?: 'joined' | 'separated';
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
					case 'component_ctaBannerBlock': {
						const ctaOverride = props.sectionOverrides?.component_ctaBannerBlock;
						if (ctaOverride?.hidden) {
							return <Fragment key={section._key} />;
						}
						if (ctaOverride?.render) {
							return (
								<Boundary key={section._key} componentName='CTA Banner Block'>
									{ctaOverride.render}
								</Boundary>
							);
						}
						return (
							<Boundary key={section._key} componentName='CTA Banner Block'>
								<CTABannerBlockSection {...section} tokens={props.tokens} ctaOverride={ctaOverride} />
							</Boundary>
						);
					}
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
									tokens={props.tokens}
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
					case 'component_goodPartyOrgPledge': {
						const pledgeOverride = props.sectionOverrides?.component_goodPartyOrgPledge;
						if (pledgeOverride?.hidden) {
							return <Fragment key={section._key} />;
						}
						return (
							<Boundary key={section._key} componentName='GoodParty.org Pledge'>
								<GoodPartyOrgPledgeSection {...section} tokens={props.tokens} pledgeOverride={pledgeOverride} />
							</Boundary>
						);
					}
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
									cardLayout={pcbOverride?.cardLayout}
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
					case 'component_testimonialBlockWithLink':
						return (
							<Boundary key={section._key} componentName='Testimonial Block With Link'>
								<TestimonialBlockWithLinkSection {...section} tokens={props.tokens} />
							</Boundary>
						);
					case 'component_locationEditorialBlock':
						return (
							<Boundary key={section._key} componentName='Location Editorial Block'>
								<LocationEditorialBlockSection
									{...section}
									editorialOverride={props.sectionOverrides?.component_locationEditorialBlock}
									tokens={props.tokens}
								/>
							</Boundary>
						);
					case 'component_electionsNearYouBlock':
						return (
							<Boundary key={section._key} componentName='Elections Near You Block'>
								<ElectionsNearYouBlockSection {...section} />
							</Boundary>
						);
					case 'component_demoRequestBlock':
						return (
							<Boundary key={section._key} componentName='Demo Request Block'>
								<DemoRequestBlockSection {...section} />
							</Boundary>
						);
					case 'component_nearbyOffices': {
						const nearbyOverride = props.sectionOverrides?.component_nearbyOffices;
						if (nearbyOverride?.hidden) {
							return <Fragment key={section._key} />;
						}
						return (
							<Boundary key={section._key} componentName='Nearby Offices'>
								<NearbyOfficesSection {...section} tokens={props.tokens} nearbyOverride={nearbyOverride} />
							</Boundary>
						);
					}
					case 'component_electionPositionResourcesBlock':
						return (
							<Boundary key={section._key} componentName='Election Position Resources Block'>
								<ElectionPositionResourcesBlockSection
									{...section}
									resourcesOverride={props.sectionOverrides?.component_electionPositionResourcesBlock}
									tokens={props.tokens}
								/>
							</Boundary>
						);
					case 'component_illustratedColumnsBlock':
						return (
							<Boundary key={section._key} componentName='Illustrated Columns Block'>
								<IllustratedColumnsBlockSection {...section} tokens={props.tokens} />
							</Boundary>
						);
					case 'component_featuredCandidatesBlock': {
					const featuredOverride = props.sectionOverrides?.component_featuredCandidatesBlock;
					if (featuredOverride?.hidden) {
						return <Fragment key={section._key} />;
					}
					return (
						<Boundary key={section._key} componentName='Featured Candidates Block'>
							<FeaturedCandidatesBlockSection {...section} tokens={props.tokens} featuredOverride={featuredOverride} />
						</Boundary>
					);
				}
				default:
						console.warn('unknown section._type', section['_type']);
						return <Fragment key={`unknown section._type' ${i}`} />;
				}
			})}
		</>
	);
}
