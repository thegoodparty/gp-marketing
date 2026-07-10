import { describe, expect, test } from 'bun:test';

import { transformButtons } from '~/lib/buttonTransformer';
import { tmplElectionsCandidatesSections, tmplElectionsPositionSections } from '~/lib/electionsTemplateSeedSections';
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
			ctaAction?: { field_ctaAction?: string };
			ctaBlockDesignSettings?: { field_componentColor6ColorsInverse?: string };
			overview?: unknown;
			primaryCTA?: unknown;
			designSettings?: unknown;
		};

		expect(section.field_ctaType).toBe('Manual');
		expect(section.ctaMessaging?.field_title).toContain('[office name]');
		expect(section.ctaAction?.field_ctaAction).toBe('Internal');
		expect(section.ctaBlockDesignSettings?.field_componentColor6ColorsInverse).toBe('Lavender');
		expect(section.overview).toBeUndefined();
		expect(section.primaryCTA).toBeUndefined();
		expect(section.designSettings).toBeUndefined();
	});

	test('includes two-up cards section', () => {
		const section = findSection(tmplElectionsPositionSections, 'pos-two-up');
		expect(section._type).toBe('component_twoUpCardBlock');
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
		expect(button?.href).toBe('/contact');
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
		expect(button?.href).toBe('/elections/mn/morrison-county/position/county-attorney/candidates');
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
});
