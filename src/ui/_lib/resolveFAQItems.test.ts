import { describe, expect, it } from 'bun:test';
import { resolveFAQItems } from './resolveFAQItems';

describe('resolveFAQItems on the FAQ landing page', () => {
	const slugMap = new Map([['with-page', 'has-a-page']]);
	const items = [
		{ _id: 'with-page', faqOverview: { field_question: 'Has a page' } },
		{ _id: 'article-only', faqOverview: { field_question: 'Article only', field_articleOnly: true } },
	];

	it('links an FAQ to its own page and leaves the answer for that page', () => {
		const [item] = resolveFAQItems(items, { linksOnly: true, slugMap });
		expect(item?.href).toBe('/frequently-asked-questions/has-a-page');
		expect(item?.copy).toBeUndefined();
	});

	it('shows an Article only FAQ inline, since it has no page to link to', () => {
		const [, item] = resolveFAQItems(items, { linksOnly: true, slugMap });
		expect(item?.href).toBeUndefined();
		expect(item?.copy).toBeDefined();
	});
});
