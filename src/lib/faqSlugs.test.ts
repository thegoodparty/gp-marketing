import { describe, expect, it } from 'bun:test';
import {
	buildFaqSlugMap,
	findFaqBySlug,
	getAllFaqSlugs,
	getFaqHref,
	getFaqSitemapEntries,
	isValidFaqSlug,
	slugifyFaqQuestion,
	sortFaqsForSlugMap,
	validateFaqSlugFormat,
} from './faqSlugs';

describe('slugifyFaqQuestion', () => {
	it('normalizes question text into a URL slug', () => {
		expect(slugifyFaqQuestion('What is GoodParty.org?')).toBe('what-is-goodpartyorg');
		expect(slugifyFaqQuestion('How do I run for city council?')).toBe('how-do-i-run-for-city-council');
	});

	it('trims and collapses whitespace', () => {
		expect(slugifyFaqQuestion('  City   Council  ')).toBe('city-council');
	});

	it('differs from lodash kebabCase for domains (Studio Generate parity)', () => {
		expect(slugifyFaqQuestion('What is GoodParty.org?')).toBe('what-is-goodpartyorg');
		expect(slugifyFaqQuestion('What is GoodParty.org?')).not.toBe('what-is-good-party-org');
	});
});

describe('validateFaqSlugFormat', () => {
	it('accepts lowercase hyphenated slugs', () => {
		expect(isValidFaqSlug('what-is-goodpartyorg')).toBe(true);
		expect(validateFaqSlugFormat('what-is-goodpartyorg')).toBe(true);
	});

	it('rejects whitespace, uppercase, and path separators', () => {
		expect(validateFaqSlugFormat(' ')).toBe('Slug is required');
		expect(validateFaqSlugFormat(' slug ')).toBe('Slug must not have leading or trailing whitespace');
		expect(validateFaqSlugFormat('UPPERCASE')).not.toBe(true);
		expect(validateFaqSlugFormat('nested/path')).not.toBe(true);
	});
});

describe('buildFaqSlugMap', () => {
	it('resolves hrefs after Map is serialized and reconstructed (unstable_cache round-trip)', () => {
		const faqs = [{ _id: 'abc123', faqOverview: { field_question: 'What is GoodParty.org?' } }];
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

	it('assigns unique slugs for three duplicate questions', () => {
		const faqs = [
			{ _id: 'abc123', faqOverview: { field_question: 'What is GoodParty.org?' } },
			{ _id: 'def456', faqOverview: { field_question: 'What is GoodParty.org?' } },
			{ _id: 'ghi789', faqOverview: { field_question: 'What is GoodParty.org?' } },
		];

		const slugs = getAllFaqSlugs(faqs);

		expect(slugs).toHaveLength(3);
		expect(new Set(slugs).size).toBe(3);
		expect(slugs[0]).toBe('what-is-goodpartyorg');
		expect(slugs[1]).toBe('what-is-goodpartyorg-def456');
		expect(slugs[2]).toBe('what-is-goodpartyorg-ghi789');

		for (let i = 0; i < faqs.length; i++) {
			expect(findFaqBySlug(faqs, slugs[i]!)?._id).toBe(faqs[i]!._id);
		}
	});

	it('resolves suffix collision when another question slugifies to the suffixed form', () => {
		const faqs = [
			{ _id: 'aaa111', faqOverview: { field_question: 'What is GoodParty.org?' } },
			{ _id: 'bbb222', faqOverview: { field_question: 'What is GoodParty.org?' } },
			{ _id: 'ccc333', faqOverview: { field_question: 'What is GoodParty.org bbb222' } },
		];

		const slugs = getAllFaqSlugs(faqs);

		expect(slugs).toHaveLength(3);
		expect(new Set(slugs).size).toBe(3);
		expect(slugs[0]).toBe('what-is-goodpartyorg');
		expect(slugs[1]).toBe('what-is-goodpartyorg-bbb222');
		expect(slugs[2]).toBe('what-is-goodpartyorg-bbb222-ccc333');

		for (let i = 0; i < faqs.length; i++) {
			expect(findFaqBySlug(faqs, slugs[i]!)?._id).toBe(faqs[i]!._id);
		}
	});

	it('assigns base slug deterministically by question then _id', () => {
		const faqsForward = [
			{ _id: 'abc123', faqOverview: { field_question: 'What is GoodParty.org?' } },
			{ _id: 'def456', faqOverview: { field_question: 'What is GoodParty.org?' } },
		];
		const faqsReversed = [...faqsForward].reverse();

		expect([...getAllFaqSlugs(faqsForward)].sort()).toEqual([...getAllFaqSlugs(faqsReversed)].sort());
		expect(getAllFaqSlugs(faqsForward)[0]).toBe('what-is-goodpartyorg');
		expect(getAllFaqSlugs(faqsForward)[1]).toBe('what-is-goodpartyorg-def456');
	});

	it('prefers stored slug over question-derived slug', () => {
		const faqs = [
			{
				_id: 'abc123',
				faqOverview: {
					field_question: 'What is GoodParty.org?',
					field_slug: 'custom-faq-slug',
				},
			},
		];

		const slugMap = buildFaqSlugMap(faqs);

		expect(getAllFaqSlugs(faqs)).toEqual(['custom-faq-slug']);
		expect(getFaqHref(faqs[0]!, slugMap)).toBe('/frequently-asked-questions/custom-faq-slug');
		expect(findFaqBySlug(faqs, 'custom-faq-slug')?._id).toBe('abc123');
	});

	it('matches GROQ internal hrefs once stored slugs are converged', () => {
		const faqs = [
			{ _id: 'aaa', faqOverview: { field_question: 'What is X?', field_slug: 'what-is-x' } },
			{ _id: 'bbb', faqOverview: { field_question: 'ZZZ Other', field_slug: 'what-is-x-bbb' } },
		];
		const slugMap = buildFaqSlugMap(faqs);

		for (const faq of faqs) {
			const groqHref = `/frequently-asked-questions/${faq.faqOverview.field_slug}`;
			expect(getFaqHref(faq, slugMap)).toBe(groqHref);
			expect(findFaqBySlug(faqs, faq.faqOverview.field_slug)?._id).toBe(faq._id);
		}
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

	it('sorts FAQs deterministically by base slug length then normalized _id', () => {
		const sorted = sortFaqsForSlugMap([
			{ _id: 'drafts.bbb', faqOverview: { field_question: 'Beta?' } },
			{ _id: 'aaa', faqOverview: { field_question: 'Alpha?' } },
			{ _id: 'bbb', faqOverview: { field_question: 'Beta?' } },
		]);

		expect(sorted.map(faq => faq._id)).toEqual(['bbb', 'drafts.bbb', 'aaa']);
	});
});

describe('getFaqSitemapEntries', () => {
	it('returns one canonical entry for three duplicate questions (ticket scenario)', () => {
		const faqs = [
			{ _id: 'faq8942aa', faqOverview: { field_question: 'What is GoodParty.org?' } },
			{ _id: 'faq40f192', faqOverview: { field_question: 'What is GoodParty.org?' } },
			{ _id: 'faq999999', faqOverview: { field_question: 'What is GoodParty.org?' } },
		];

		const entries = getFaqSitemapEntries(faqs);

		expect(entries).toHaveLength(1);
		expect(entries[0]?.slug).toBe('what-is-goodpartyorg');
		expect(entries[0]?.faq._id).toBe('faq40f192');
	});

	it('keeps one sitemap entry after backfill stores distinct collision slugs', () => {
		const faqs = [
			{
				_id: 'aaa111',
				faqOverview: { field_question: 'What is GoodParty.org?', field_slug: 'what-is-goodpartyorg' },
			},
			{
				_id: 'bbb222',
				faqOverview: { field_question: 'What is GoodParty.org?', field_slug: 'what-is-goodpartyorg-bbb222' },
			},
		];

		const entries = getFaqSitemapEntries(faqs);

		expect(entries).toHaveLength(1);
		expect(entries[0]?.slug).toBe('what-is-goodpartyorg');
		expect(entries[0]?.faq._id).toBe('aaa111');
	});

	it('excludes suffixed duplicates and keeps distinct questions', () => {
		const downloadQuestion = 'Do I need to download anything to use GoodParty.org?';
		const faqs = [
			{ _id: 'download-canonical', faqOverview: { field_question: downloadQuestion } },
			{ _id: 'download-cc0853', faqOverview: { field_question: downloadQuestion } },
			{ _id: 'unique-faq', faqOverview: { field_question: 'How much does it cost?' } },
		];

		const entries = getFaqSitemapEntries(faqs);
		const slugs = entries.map(e => e.slug);

		expect(entries).toHaveLength(2);
		expect(slugs).toContain('do-i-need-to-download-anything-to-use-goodpartyorg');
		expect(slugs).toContain('how-much-does-it-cost');
		expect(slugs.some(s => s.includes('-cc0853'))).toBe(false);
	});

	it('includes distinct questions that share a slug prefix after collision suffixing', () => {
		const faqs = [
			{ _id: 'aaa111', faqOverview: { field_question: 'What is GoodParty.org?' } },
			{ _id: 'bbb222', faqOverview: { field_question: 'What is GoodParty.org?' } },
			{ _id: 'ccc333', faqOverview: { field_question: 'What is GoodParty.org bbb222' } },
		];

		const entries = getFaqSitemapEntries(faqs);
		const slugs = entries.map(e => e.slug);

		expect(entries).toHaveLength(2);
		expect(slugs).toContain('what-is-goodpartyorg');
		expect(slugs).toContain('what-is-goodpartyorg-bbb222-ccc333');
	});

	it('keeps all FAQs whose questions slugify to empty string (falls back to _id)', () => {
		const faqs = [
			{ _id: 'symbols-a', faqOverview: { field_question: '!!!' } },
			{ _id: 'symbols-b', faqOverview: { field_question: '@#$' } },
		];

		const entries = getFaqSitemapEntries(faqs);

		expect(entries).toHaveLength(2);
		expect(entries.map(e => e.slug)).toEqual(['symbols-a', 'symbols-b']);
	});

	it('includes one entry per FAQ when question is missing (keyed by _id)', () => {
		const faqs = [{ _id: 'no-question-a' }, { _id: 'no-question-b' }];

		const entries = getFaqSitemapEntries(faqs);

		expect(entries).toHaveLength(2);
		expect(entries.map(e => e.slug)).toEqual(['no-question-a', 'no-question-b']);
	});
});
