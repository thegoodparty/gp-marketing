import { describe, expect, test } from 'bun:test';

import { transformButtons } from '~/lib/buttonTransformer';
import { tmplElectionsCandidatesSections, tmplElectionsPositionSections } from '~/lib/electionsTemplateSeedSections';
import { CANDIDATES_PAGE_CTA_IMAGE } from '~/constants/candidatesPageStaticSections';
import { POSITION_PAGE_CTA_BANNER, POSITION_PAGE_CTA_BLOCK } from '~/constants/positionPageStaticSections';

function findSection<T extends { _key: string }>(sections: readonly T[], key: string): T {
	const section = sections.find(item => item._key === key);
	if (!section) {
		throw new Error(`Missing seed section ${key}`);
	}
	return section;
}

describe('tmplElectionsPositionSections seed shapes', () => {
	test('CTA banner uses field_ctaAction for GROQ button projection', () => {
		const section = findSection(tmplElectionsPositionSections, 'pos-cta-banner') as {
			field_ctaType?: string;
			ctaAction?: { field_ctaAction?: string; field_ctaActionWithShared?: string };
		};

		expect(section.field_ctaType).toBe('Manual');
		expect(section.ctaAction?.field_ctaAction).toBe('Internal');
		expect(section.ctaAction?.field_ctaActionWithShared).toBeUndefined();
	});

	test('CTA block uses schema field names for manual CTA content', () => {
		const section = findSection(tmplElectionsPositionSections, 'pos-cta-block') as {
			field_ctaType?: string;
			ctaMessaging?: { field_title?: string };
			ctaAction?: { field_ctaAction?: string; field_internalLink?: { href?: unknown } };
			ctaBlockDesignSettings?: { field_componentColor6ColorsInverse?: string };
			overview?: unknown;
			primaryCTA?: unknown;
			designSettings?: unknown;
		};

		expect(section.field_ctaType).toBe('Manual');
		expect(section.ctaMessaging?.field_title).toContain('[office name]');
		expect(section.ctaAction?.field_ctaAction).toBe('Internal');
		expect(section.ctaAction?.field_internalLink?.href).toBeDefined();
		expect(section.ctaBlockDesignSettings?.field_componentColor6ColorsInverse).toBe('Lavender');
		expect(section.overview).toBeUndefined();
		expect(section.primaryCTA).toBeUndefined();
		expect(section.designSettings).toBeUndefined();
	});

	test('includes two-up cards section', () => {
		const section = findSection(tmplElectionsPositionSections, 'pos-two-up') as {
			_type: string;
			twoUpCardBlockOne?: { field_twoUpCardBlockCardType?: string };
			twoUpCardBlockTwo?: { field_twoUpCardBlockCardType?: string };
		};
		expect(section._type).toBe('component_twoUpCardBlock');
		expect(section.twoUpCardBlockOne?.field_twoUpCardBlockCardType).toBe('ValueProposition');
		expect(section.twoUpCardBlockTwo?.field_twoUpCardBlockCardType).toBe('ValueProposition');
	});

	test('GROQ-projected CTA banner button renders Get free demo', () => {
		const section = findSection(tmplElectionsPositionSections, 'pos-cta-banner') as {
			ctaAction?: {
				field_buttonText?: string;
				field_ctaAction?: string;
			};
		};

		const projectedPrimaryCTA = {
			text: section.ctaAction?.field_buttonText,
			action: section.ctaAction?.field_ctaAction,
			link: { href: '/contact', title: 'Contact', name: null },
		};

		const button = transformButtons([projectedPrimaryCTA as never])?.[0];
		expect(button?.label).toBe(POSITION_PAGE_CTA_BANNER.button.label);
		expect((button as { href?: string } | undefined)?.href).toBe('/contact');
	});

	test('GROQ-projected CTA block button renders View all candidates when href is overridden', () => {
		const section = findSection(tmplElectionsPositionSections, 'pos-cta-block') as {
			ctaAction?: {
				field_buttonText?: string;
				field_ctaAction?: string;
			};
		};

		const projectedPrimaryCTA = {
			text: section.ctaAction?.field_buttonText,
			action: section.ctaAction?.field_ctaAction,
			hierarchy: 'Primary',
			link: { href: '/elections/mn/morrison-county/position/county-attorney/candidates' },
		};

		const button = transformButtons([projectedPrimaryCTA as never])?.[0];
		expect(button?.label).toBe(POSITION_PAGE_CTA_BLOCK.primaryButtonLabel);
		expect((button as { href?: string } | undefined)?.href).toBe('/elections/mn/morrison-county/position/county-attorney/candidates');
	});
});

describe('tmplElectionsCandidatesSections seed shapes', () => {
	test('CTA banner uses field_ctaAction for external button', () => {
		const section = findSection(tmplElectionsCandidatesSections, 'cand-cta-banner') as {
			ctaAction?: { field_ctaAction?: string; field_ctaActionWithShared?: string };
		};

		expect(section.ctaAction?.field_ctaAction).toBe('External');
		expect(section.ctaAction?.field_ctaActionWithShared).toBeUndefined();
	});

	test('CTA image block uses schema field names for manual CTA content', () => {
		const section = findSection(tmplElectionsCandidatesSections, 'cand-cta-image') as {
			field_ctaType?: string;
			ctaMessaging?: { field_title?: string };
			ctaAction?: { field_ctaAction?: string; field_buttonText?: string; field_internalLink?: { href?: unknown } };
			ctaAssets?: { img_featuredImage?: unknown; showFullImage?: boolean };
			ctaImageBlockDesignSettings?: { field_componentColor6ColorsInverse?: string };
			overview?: unknown;
			primaryCTA?: unknown;
			image?: unknown;
			designSettings?: unknown;
		};

		expect(section.field_ctaType).toBe('Manual');
		expect(section.ctaMessaging?.field_title).toContain('[office]');
		expect(section.ctaAction?.field_ctaAction).toBe('Internal');
		expect(section.ctaAction?.field_buttonText).toBe(CANDIDATES_PAGE_CTA_IMAGE.primaryButton.label);
		expect(section.ctaAction?.field_internalLink?.href).toBeDefined();
		expect(section.ctaAssets?.img_featuredImage).toBeDefined();
		expect(section.ctaAssets?.showFullImage).toBe(true);
		expect(section.ctaImageBlockDesignSettings?.field_componentColor6ColorsInverse).toBe('Blue');
		expect(section.overview).toBeUndefined();
		expect(section.primaryCTA).toBeUndefined();
		expect(section.image).toBeUndefined();
		expect(section.designSettings).toBeUndefined();
	});

	test('GROQ-projected CTA image button renders Get started when href is overridden', () => {
		const section = findSection(tmplElectionsCandidatesSections, 'cand-cta-image') as {
			ctaAction?: { field_buttonText?: string; field_ctaAction?: string };
		};

		const projectedPrimaryCTA = {
			text: section.ctaAction?.field_buttonText,
			action: section.ctaAction?.field_ctaAction,
			hierarchy: 'Primary',
			link: { href: '/elections/al' },
		};

		const button = transformButtons([projectedPrimaryCTA as never])?.[0];
		expect(button?.label).toBe(CANDIDATES_PAGE_CTA_IMAGE.primaryButton.label);
		expect((button as { href?: string } | undefined)?.href).toBe('/elections/al');
	});

	test('CTA image Internal button without CMS link renders when override href is injected before transform', () => {
		const section = findSection(tmplElectionsCandidatesSections, 'cand-cta-image') as {
			ctaAction?: { field_buttonText?: string; field_ctaAction?: string };
		};

		const projectedPrimaryCTA = {
			text: section.ctaAction?.field_buttonText,
			action: section.ctaAction?.field_ctaAction,
			hierarchy: 'Primary',
		};

		expect(transformButtons([projectedPrimaryCTA as never])?.[0]).toBeUndefined();

		const withOverride = {
			...projectedPrimaryCTA,
			link: { href: '/elections/al' },
		};
		const button = transformButtons([withOverride as never])?.[0];
		expect(button?.label).toBe('Get started');
		expect((button as { href?: string } | undefined)?.href).toBe('/elections/al');
	});

	test('includes shared two-up cards section with ValueProposition card types', () => {
		const section = findSection(tmplElectionsCandidatesSections, 'pos-two-up') as {
			twoUpCardBlockOne?: { field_twoUpCardBlockCardType?: string };
			twoUpCardBlockTwo?: { field_twoUpCardBlockCardType?: string };
		};

		expect(section.twoUpCardBlockOne?.field_twoUpCardBlockCardType).toBe('ValueProposition');
		expect(section.twoUpCardBlockTwo?.field_twoUpCardBlockCardType).toBe('ValueProposition');
	});
});
