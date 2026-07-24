import { describe, expect, it } from 'bun:test';
import { planFaqSlugBackfill } from './faqBackfillPlan';

describe('planFaqSlugBackfill', () => {
	it('plans fill patches for missing stored slugs', () => {
		const result = planFaqSlugBackfill([
			{ _id: 'abc123', faqOverview: { field_question: 'What is GoodParty.org?' } },
		]);

		expect(result.preflightErrors).toEqual([]);
		expect(result.patches).toEqual([
			{ id: 'abc123', slug: 'what-is-goodpartyorg', reason: 'fill' },
		]);
	});

	it('plans dedupe patches when stored slug diverges from canonical collision slug', () => {
		const result = planFaqSlugBackfill([
			{ _id: 'aaa', faqOverview: { field_question: 'What is X?' } },
			{ _id: 'bbb', faqOverview: { field_question: 'ZZZ Other', field_slug: 'what-is-x' } },
		]);

		expect(result.preflightErrors).toEqual([]);
		expect(result.patches).toEqual([
			{ id: 'aaa', slug: 'what-is-x', reason: 'fill' },
			{ id: 'bbb', slug: 'what-is-x-bbb', reason: 'dedupe' },
		]);
	});

	it('assigns the same canonical slug to draft and published versions', () => {
		const result = planFaqSlugBackfill([
			{ _id: 'abc123', faqOverview: { field_question: 'What is GoodParty.org?' } },
			{ _id: 'drafts.abc123', faqOverview: { field_question: 'What is GoodParty.org?' } },
		]);

		expect(result.preflightErrors).toEqual([]);
		expect(result.patches).toEqual([
			{ id: 'abc123', slug: 'what-is-goodpartyorg', reason: 'fill' },
			{ id: 'drafts.abc123', slug: 'what-is-goodpartyorg', reason: 'fill' },
		]);
	});

	it('produces the same canonical assignments regardless of input order', () => {
		const faqs = [
			{ _id: 'bbb', faqOverview: { field_question: 'ZZZ Other', field_slug: 'what-is-x' } },
			{ _id: 'aaa', faqOverview: { field_question: 'What is X?' } },
		];

		const forward = planFaqSlugBackfill(faqs);
		const reversed = planFaqSlugBackfill([...faqs].reverse());

		expect(forward.patches).toEqual(reversed.patches);
	});

	it('fails preflight when faqOverview is missing or null', () => {
		const missing = planFaqSlugBackfill([{ _id: 'missing-overview' }]);
		const nullOverview = planFaqSlugBackfill([{ _id: 'null-overview', faqOverview: null }]);

		expect(missing.preflightErrors).toContain('id=missing-overview missing faqOverview');
		expect(nullOverview.preflightErrors).toContain('id=null-overview missing faqOverview');
		expect(missing.patches).toEqual([]);
		expect(nullOverview.patches).toEqual([]);
	});

	it('is idempotent once stored slugs match canonical values', () => {
		const faqs = [
			{ _id: 'aaa', faqOverview: { field_question: 'What is X?', field_slug: 'what-is-x' } },
			{ _id: 'bbb', faqOverview: { field_question: 'Other', field_slug: 'what-is-x-bbb' } },
		];

		const result = planFaqSlugBackfill(faqs);

		expect(result.preflightErrors).toEqual([]);
		expect(result.patches).toEqual([]);
		expect(result.skipped).toBe(2);
	});
});
