/**
 * Default section layouts for elections CMS template singletons.
 * Used by scripts/seed-elections-cms-templates.ts to populate Sanity.
 */
import { PROFILE_PAGE_SECTIONS } from '~/app/candidate/[...slug]/profilePageSections';
import { CAROUSEL_QUOTE_COLLECTION_ID, CAROUSEL_HEADER, STEPPER_HEADER } from '~/constants/electionsStaticSections';
import { POSITION_PAGE_CTA_BANNER, POSITION_PAGE_CTA_BLOCK, POSITION_PAGE_FAQ, POSITION_PAGE_TWO_UP_CARD } from '~/constants/positionPageStaticSections';

const contactInternalLink = {
	_type: 'field_internalLink' as const,
	href: { _ref: '1876f6cd-0d57-4e50-911b-2dee7b7fceed', _type: 'reference' as const },
};

import { CANDIDATES_PAGE_CTA_BANNER, CANDIDATES_PAGE_CTA_IMAGE } from '~/constants/candidatesPageStaticSections';

export const tmplCandidateProfileSections = PROFILE_PAGE_SECTIONS;

// Person profiles (/people/<slug>) render a profile-flavored layout: hero +
// claim block + content (bio/why/issues + sidebar + district map) + the two
// interlink candidate lists + pledge + state elections index + sign-up CTA.
// Editors clone this into per-state Custom Templates (see field_profileState) to
// tune copy / sections for individual Figma states A–L. Defined in
// personProfileSections so the code default and this seed stay in lockstep.
import { PERSON_PROFILE_SECTIONS as tmplPersonProfileSections } from '~/components/people/personProfileSections';
export { tmplPersonProfileSections };

const profileStepperSection = tmplCandidateProfileSections.find(
	section => section._type === 'component_stepperBlock',
);

export const tmplElectionsPositionSections = [
	{
		_key: 'pos-breadcrumb',
		_type: 'component_breadcrumbBlock',
		breadcrumbBlockDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
	},
	{
		_key: 'pos-hero',
		_type: 'component_electionsPositionHero',
		electionsPositionHeroDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
		ctaAction: {
			_type: 'ctaActionWithShared',
			field_buttonText: 'Run for office',
			text: 'Run for office',
			field_ctaActionWithShared: 'Internal',
		},
	},
	{
		_key: 'pos-cta-banner',
		_type: 'component_ctaBannerBlock',
		field_ctaType: 'Manual',
		smallCtaMessaging: {
			field_title: POSITION_PAGE_CTA_BANNER.title,
			block_summaryText: [
				{
					_key: 'pos-cta-banner-copy',
					_type: 'block',
					children: [{ _key: 'pos-cta-banner-span', _type: 'span', marks: [], text: POSITION_PAGE_CTA_BANNER.copy }],
					markDefs: [],
					style: 'normal',
				},
			],
		},
		ctaAction: {
			_type: 'ctaAction',
			field_buttonText: POSITION_PAGE_CTA_BANNER.button.label,
			field_ctaActionWithShared: 'Internal',
			field_internalLink: contactInternalLink,
		},
		ctaBannerBlockDesignSettings: {
			field_blockColorCreamMidnight: 'Cream',
			field_componentColor6ColorsInverse: 'Lavender',
		},
	},
	{
		_key: 'pos-content',
		_type: 'component_electionsPositionContentBlock',
		electionsPositionContentBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
	},
	{
		_key: 'pos-faq',
		_type: 'component_faqBlock',
		summaryInfo: {
			field_title: POSITION_PAGE_FAQ.title,
			block_summaryText: [
				{
					_key: 'pos-faq-copy',
					_type: 'block',
					children: [{ _key: 'pos-faq-span', _type: 'span', marks: [], text: POSITION_PAGE_FAQ.copy }],
					markDefs: [],
					style: 'normal',
				},
			],
			list_buttons: [
				{
					_key: 'pos-faq-btn',
					_type: 'button',
					field_buttonHierarchy: 'Primary',
					field_buttonText: POSITION_PAGE_FAQ.buttons[0]?.label,
					field_ctaActionWithShared: 'Internal',
					field_internalLink: contactInternalLink,
				},
			],
		},
		faqBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
	},
	{
		_key: 'pos-cta-block',
		_type: 'component_ctaBlock',
		overview: {
			field_label: POSITION_PAGE_CTA_BLOCK.label,
			field_title: POSITION_PAGE_CTA_BLOCK.title,
			block_summaryText: [
				{
					_key: 'pos-cta-block-copy',
					_type: 'block',
					children: [{ _key: 'pos-cta-block-span', _type: 'span', marks: [], text: POSITION_PAGE_CTA_BLOCK.copy }],
					markDefs: [],
					style: 'normal',
				},
			],
		},
		primaryCTA: {
			_type: 'button',
			field_buttonHierarchy: 'Primary',
			field_buttonText: POSITION_PAGE_CTA_BLOCK.primaryButtonLabel,
			field_ctaActionWithShared: 'Internal',
		},
		designSettings: {
			field_blockColorCreamMidnight: 'Cream',
			field_componentColor6ColorsInverse: 'Lavender',
		},
	},
	{
		_key: 'pos-two-up',
		_type: 'component_twoUpCardBlock',
		twoUpCardBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
		twoUpCardBlockOne: {
			field_twoUpCardBlockCardType: 'Value Proposition Card',
			valuePropositionCard: {
				field_title: POSITION_PAGE_TWO_UP_CARD.card1.title,
				field_componentColor6ColorsInverse: 'BrightYellow',
				list_valuePropositionCardItems: POSITION_PAGE_TWO_UP_CARD.card1.list.map((item, index) => ({
					_key: `pos-card1-item-${index}`,
					field_icon: item.icon,
					block_summaryText: [
						{
							_key: `pos-card1-item-copy-${index}`,
							_type: 'block',
							children: [{ _key: `pos-card1-item-span-${index}`, _type: 'span', marks: [], text: item.title }],
							markDefs: [],
							style: 'normal',
						},
					],
				})),
				button: {
					_type: 'button',
					field_buttonHierarchy: 'Primary',
					field_buttonText: POSITION_PAGE_TWO_UP_CARD.card1.button.label,
					field_ctaActionWithShared: 'Internal',
					field_internalLink: contactInternalLink,
				},
			},
		},
		twoUpCardBlockTwo: {
			field_twoUpCardBlockCardType: 'Value Proposition Card',
			valuePropositionCard: {
				field_title: POSITION_PAGE_TWO_UP_CARD.card2.title,
				field_componentColor6ColorsInverse: 'Lavender',
				list_valuePropositionCardItems: POSITION_PAGE_TWO_UP_CARD.card2.list.map((item, index) => ({
					_key: `pos-card2-item-${index}`,
					field_icon: item.icon,
					block_summaryText: [
						{
							_key: `pos-card2-item-copy-${index}`,
							_type: 'block',
							children: [{ _key: `pos-card2-item-span-${index}`, _type: 'span', marks: [], text: item.title }],
							markDefs: [],
							style: 'normal',
						},
					],
				})),
				button: {
					_type: 'button',
					field_buttonHierarchy: 'Primary',
					field_buttonText: POSITION_PAGE_TWO_UP_CARD.card2.button.label,
					field_ctaActionWithShared: 'External',
					field_externalLink: POSITION_PAGE_TWO_UP_CARD.card2.button.href,
				},
			},
		},
	},
];

export const tmplElectionsCandidatesSections = [
	{
		_key: 'cand-breadcrumb',
		_type: 'component_breadcrumbBlock',
		breadcrumbBlockDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
	},
	{
		_key: 'cand-hero',
		_type: 'component_electionsPositionHero',
		electionsPositionHeroDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
		ctaAction: {
			_type: 'ctaActionWithShared',
			field_buttonText: 'Back to position',
			text: 'Back to position',
			field_ctaActionWithShared: 'Internal',
		},
	},
	{
		_key: 'cand-list',
		_type: 'component_candidatesBlock',
		candidatesBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
		candidatesBlockFilterSettings: { field_enableFilters: true },
	},
	{
		_key: 'cand-cta-banner',
		_type: 'component_ctaBannerBlock',
		field_ctaType: 'Manual',
		smallCtaMessaging: {
			field_title: CANDIDATES_PAGE_CTA_BANNER.title,
			block_summaryText: [
				{
					_key: 'cand-cta-banner-copy',
					_type: 'block',
					children: [{ _key: 'cand-cta-banner-span', _type: 'span', marks: [], text: CANDIDATES_PAGE_CTA_BANNER.copy }],
					markDefs: [],
					style: 'normal',
				},
			],
		},
		ctaAction: {
			_type: 'ctaAction',
			field_buttonText: CANDIDATES_PAGE_CTA_BANNER.button.label,
			field_ctaActionWithShared: 'External',
			field_externalLink: CANDIDATES_PAGE_CTA_BANNER.button.href,
		},
		ctaBannerBlockDesignSettings: {
			field_blockColorCreamMidnight: 'Cream',
			field_componentColor6ColorsInverse: 'BrightYellow',
		},
	},
	{
		_key: 'cand-cta-image',
		_type: 'component_ctaImageBlock',
		overview: {
			field_title: CANDIDATES_PAGE_CTA_IMAGE.title,
			block_summaryText: [
				{
					_key: 'cand-cta-image-copy',
					_type: 'block',
					children: [{ _key: 'cand-cta-image-span', _type: 'span', marks: [], text: CANDIDATES_PAGE_CTA_IMAGE.copy }],
					markDefs: [],
					style: 'normal',
				},
			],
		},
		primaryCTA: {
			_type: 'button',
			field_buttonHierarchy: 'Primary',
			field_buttonText: CANDIDATES_PAGE_CTA_IMAGE.primaryButton.label,
			field_ctaActionWithShared: 'Internal',
		},
		image: {
			img_featuredImage: {
				_type: 'img_image',
				asset: { _ref: CANDIDATES_PAGE_CTA_IMAGE.imageAssetRef, _type: 'reference' },
			},
			showFullImage: CANDIDATES_PAGE_CTA_IMAGE.showFullImage,
		},
		designSettings: {
			field_blockColorCreamMidnight: 'Cream',
			field_componentColor6ColorsInverse: 'Blue',
		},
	},
	...tmplElectionsPositionSections.filter(section => section._key === 'pos-two-up'),
];

const electionsIndexMarketingSections = [
	{
		_key: 'idx-carousel',
		_type: 'component_carouselBlock',
		carouselBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
		summaryInfo: {
			field_title: CAROUSEL_HEADER.title,
			block_summaryText: [
				{
					_key: 'idx-carousel-copy',
					_type: 'block',
					children: [{ _key: 'idx-carousel-span', _type: 'span', marks: [], text: CAROUSEL_HEADER.copy }],
					markDefs: [],
					style: 'normal',
				},
			],
			field_textSize: 'Medium',
		},
		quotesContentCollection: {
			field_quotesContentOptions: 'Collection',
			ref_quoteCollection: {
				_type: 'ref_quoteCollection',
				_ref: CAROUSEL_QUOTE_COLLECTION_ID,
			},
		},
	},
	profileStepperSection
		? {
				...profileStepperSection,
				_key: 'idx-stepper',
				summaryInfo: {
					...profileStepperSection.summaryInfo,
					field_title: STEPPER_HEADER.title,
					block_summaryText: [
						{
							_key: 'idx-stepper-copy',
							_type: 'block',
							children: [{ _key: 'idx-stepper-span', _type: 'span', marks: [], text: STEPPER_HEADER.copy }],
							markDefs: [],
							style: 'normal',
						},
					],
				},
			}
		: null,
].filter(Boolean);

export const tmplElectionsStateIndexSections = [
	{
		_key: 'idx-breadcrumb',
		_type: 'component_breadcrumbBlock',
		breadcrumbBlockDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
	},
	{
		_key: 'idx-hero',
		_type: 'component_locationLandingPageHero',
		locationLandingPageHeroDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
		locationLandingPageHeroContent: {
			field_bodyCopy: 'Learn what state positions are up for election and who is currently running for office in [State].',
			field_searchPlaceholder: 'Search positions',
		},
	},
	{
		_key: 'idx-offices',
		_type: 'component_listOfOfficesBlock',
		listOfOfficesBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
		field_heading: 'State Elections in [State]',
		field_headline: 'state',
	},
	{
		_key: 'idx-facts',
		_type: 'component_locationFactsBlock',
		locationFactsBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
	},
	{
		_key: 'idx-elections',
		_type: 'component_electionsIndexBlock',
		electionsIndexBlockDesignSettings: {
			field_blockColorCreamMidnight: 'MidnightDark',
			field_showSearch: true,
			field_searchPlaceholder: 'Search by county or district',
		},
		electionsIndexBlockHeader: {
			field_title: 'Counties & Districts in [State]',
			block_summaryText: [
				{
					_key: 'idx-elections-copy',
					_type: 'block',
					children: [{ _key: 'idx-elections-span', _type: 'span', marks: [], text: 'Browse elections by county or district in [State].' }],
					markDefs: [],
					style: 'normal',
				},
			],
		},
	},
	...electionsIndexMarketingSections,
];

export const tmplElectionsCountyIndexSections = [
	{
		_key: 'county-breadcrumb',
		_type: 'component_breadcrumbBlock',
		breadcrumbBlockDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
	},
	{
		_key: 'county-hero',
		_type: 'component_locationLandingPageHero',
		locationLandingPageHeroDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
		locationLandingPageHeroContent: {
			field_bodyCopy: 'Learn what positions are up for election and who is currently running for office in [County].',
			field_searchPlaceholder: 'Search positions',
		},
	},
	{
		_key: 'county-offices',
		_type: 'component_listOfOfficesBlock',
		listOfOfficesBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
		field_heading: 'County Elections in [County]',
		field_headline: 'county',
	},
	{
		_key: 'county-facts',
		_type: 'component_locationFactsBlock',
		locationFactsBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
	},
	{
		_key: 'county-elections',
		_type: 'component_electionsIndexBlock',
		electionsIndexBlockDesignSettings: {
			field_blockColorCreamMidnight: 'MidnightDark',
			field_showSearch: true,
			field_searchPlaceholder: 'Search by city',
		},
		electionsIndexBlockHeader: {
			field_title: 'Cities & Towns in [County]',
			block_summaryText: [
				{
					_key: 'county-elections-copy',
					_type: 'block',
					children: [{ _key: 'county-elections-span', _type: 'span', marks: [], text: 'Browse elections by city in [County], [State].' }],
					markDefs: [],
					style: 'normal',
				},
			],
		},
	},
	...electionsIndexMarketingSections,
];

export const tmplElectionsCityIndexSections = [
	{
		_key: 'city-breadcrumb',
		_type: 'component_breadcrumbBlock',
		breadcrumbBlockDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
	},
	{
		_key: 'city-hero',
		_type: 'component_locationLandingPageHero',
		locationLandingPageHeroDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
		locationLandingPageHeroContent: {
			field_bodyCopy: 'Learn what positions are up for election and who is currently running for office in [City].',
			field_searchPlaceholder: 'Search positions',
		},
	},
	{
		_key: 'city-offices',
		_type: 'component_listOfOfficesBlock',
		listOfOfficesBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
		field_heading: 'City Elections in [City]',
		field_headline: 'municipal',
	},
	{
		_key: 'city-facts',
		_type: 'component_locationFactsBlock',
		locationFactsBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
	},
	...electionsIndexMarketingSections,
];

export const tmplElectionsDistrictIndexSections = [
	{
		_key: 'district-breadcrumb',
		_type: 'component_breadcrumbBlock',
		breadcrumbBlockDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
	},
	{
		_key: 'district-hero',
		_type: 'component_locationLandingPageHero',
		locationLandingPageHeroDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
		locationLandingPageHeroContent: {
			field_bodyCopy: 'Learn what positions are up for election and who is currently running for office in [District].',
			field_searchPlaceholder: 'Search positions',
		},
	},
	{
		_key: 'district-offices',
		_type: 'component_listOfOfficesBlock',
		listOfOfficesBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
		field_heading: 'Elections in [District]',
		field_headline: 'district',
	},
	{
		_key: 'district-facts',
		_type: 'component_locationFactsBlock',
		locationFactsBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
	},
	...electionsIndexMarketingSections,
];

const GLOBAL_TEMPLATE_PREVIEW_TARGETS = {
	location: {
		field_electionTargetType: 'place',
		field_electionTargetSlug: 'ny',
	},
	position: {
		field_electionTargetType: 'place',
		field_electionTargetSlug: 'ny',
		field_positionSlug: 'governor',
	},
	positionCandidates: {
		field_electionTargetType: 'place',
		field_electionTargetSlug: 'ny',
		field_positionSlug: 'governor',
	},
} as const;

export const globalElectionTemplateSeedDocuments = [
	{
		_id: 'globalTemplate_candidateProfile',
		_type: 'goodpartyOrg_globalTemplate',
		field_title: 'Candidate Profile',
		field_electionTemplateType: 'candidateProfile',
		pageSections: { list_pageSections: tmplCandidateProfileSections },
	},
	{
		_id: 'globalTemplate_personProfile',
		_type: 'goodpartyOrg_globalTemplate',
		field_title: 'Person Profile',
		field_electionTemplateType: 'personProfile',
		pageSections: { list_pageSections: tmplPersonProfileSections },
	},
	{
		_id: 'globalTemplate_position',
		_type: 'goodpartyOrg_globalTemplate',
		field_title: 'Position Page',
		field_electionTemplateType: 'position',
		previewTarget: GLOBAL_TEMPLATE_PREVIEW_TARGETS.position,
		pageSections: { list_pageSections: tmplElectionsPositionSections },
	},
	{
		_id: 'globalTemplate_positionCandidates',
		_type: 'goodpartyOrg_globalTemplate',
		field_title: 'Position Candidates',
		field_electionTemplateType: 'positionCandidates',
		previewTarget: GLOBAL_TEMPLATE_PREVIEW_TARGETS.positionCandidates,
		pageSections: { list_pageSections: tmplElectionsCandidatesSections },
	},
	{
		_id: 'globalTemplate_location',
		_type: 'goodpartyOrg_globalTemplate',
		field_title: 'Location Index',
		field_electionTemplateType: 'location',
		previewTarget: GLOBAL_TEMPLATE_PREVIEW_TARGETS.location,
		pageSections: { list_pageSections: tmplElectionsStateIndexSections },
	},
] as const;

/** @deprecated Legacy tmpl_* singleton IDs */
export const electionsTemplateSeedDocuments = [
	{
		_id: 'tmpl_candidateProfile',
		_type: 'tmpl_candidateProfile',
		pageSections: { list_pageSections: tmplCandidateProfileSections },
	},
	{
		_id: 'tmpl_electionsPosition',
		_type: 'tmpl_electionsPosition',
		pageSections: { list_pageSections: tmplElectionsPositionSections },
	},
	{
		_id: 'tmpl_electionsCandidates',
		_type: 'tmpl_electionsCandidates',
		pageSections: { list_pageSections: tmplElectionsCandidatesSections },
	},
	{
		_id: 'tmpl_electionsStateIndex',
		_type: 'tmpl_electionsStateIndex',
		pageSections: { list_pageSections: tmplElectionsStateIndexSections },
	},
	{
		_id: 'tmpl_electionsCountyIndex',
		_type: 'tmpl_electionsCountyIndex',
		pageSections: { list_pageSections: tmplElectionsCountyIndexSections },
	},
	{
		_id: 'tmpl_electionsCityIndex',
		_type: 'tmpl_electionsCityIndex',
		pageSections: { list_pageSections: tmplElectionsCityIndexSections },
	},
	{
		_id: 'tmpl_electionsDistrictIndex',
		_type: 'tmpl_electionsDistrictIndex',
		pageSections: { list_pageSections: tmplElectionsDistrictIndexSections },
	},
] as const;
