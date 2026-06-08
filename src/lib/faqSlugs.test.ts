import { describe, expect, it } from 'vitest';
import {
	buildFaqSlugMap,
	findFaqBySlug,
	getAllFaqSlugs,
	getFaqHref,
	slugifyFaqQuestion,
} from './faqSlugs';

describe('slugifyFaqQuestion', () => {
	it('normalizes question text into a URL slug', () => {
		expect(slugifyFaqQuestion('What is GoodParty.org?')).toBe('what-is-goodpartyorg');
		expect(slugifyFaqQuestion('How do I run for city council?')).toBe('how-do-i-run-for-city-council');
	});

	it('trims and collapses whitespace', () => {
		expect(slugifyFaqQuestion('  City   Council  ')).toBe('city-council');
	});
});

describe('buildFaqSlugMap', () => {
	it('resolves hrefs after Map is serialized and reconstructed (unstable_cache round-trip)', () => {
		const faqs = [
			{ _id: 'abc123', faqOverview: { field_question: 'What is GoodParty.org?' } },
		];
		const serialized = Object.fromEntries(buildFaqSlugMap(faqs));
		const restoredMap = new Map(Object.entries(serialized));

		expect(getFaqHref(faqs[0]!, restoredMap)).toBe('/frequently-asked-questions/what-is-goodpartyorg');
	});

	it('assigns unique slugs and resolves collisions with id suffix', () => {
		const faqs = [
			{ _id: 'abc123', faqOverview: { field_question: 'What is GoodParty.org?' } },
			{ _id: 'def456', faqOverview: { field_question: 'What is GoodParty.org?' } },
		];

		const slugMap = buildFaqSlugMap(faqs);
		const slugs = getAllFaqSlugs(faqs);

		expect(slugs).toHaveLength(2);
		expect(new Set(slugs).size).toBe(2);
		expect(slugs[0]).toBe('what-is-goodpartyorg');
		expect(slugs[1]).toBe('what-is-goodpartyorg-def456');
		expect(getFaqHref(faqs[0]!, slugMap)).toBe('/frequently-asked-questions/what-is-goodpartyorg');
	});
});

describe('findFaqBySlug', () => {
	const faqs = [
		{ _id: 'abc123', faqOverview: { field_question: 'What is the pledge?' } },
		{ _id: 'def456', faqOverview: { field_question: 'How much does it cost?' } },
	];

	it('finds FAQ by computed slug', () => {
		const found = findFaqBySlug(faqs, 'what-is-the-pledge');
		expect(found?._id).toBe('abc123');
	});

	it('finds FAQ by raw _id fallback', () => {
		const found = findFaqBySlug(faqs, 'def456');
		expect(found?._id).toBe('def456');
	});

	it('returns undefined for unknown slug', () => {
		expect(findFaqBySlug(faqs, 'does-not-exist')).toBeUndefined();
	});
});
