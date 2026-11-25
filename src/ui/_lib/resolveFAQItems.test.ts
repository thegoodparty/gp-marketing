import { describe, expect, it } from 'bun:test';
import { resolveFAQItems } from './resolveFAQItems';

describe('resolveFAQItems', () => {
	const slugMap = new Map([['with-page', 'has-a-page']]);
	const items = [
		{ _id: 'with-page', faqOverview: { field_question: 'Has a page' } },
		{ _id: 'article-only', faqOverview: { field_question: 'Article only', field_articleOnly: true } },
	];

	it('links an FAQ to its own page on the landing list and leaves the answer for that page', () => {
		const [item] = resolveFAQItems(items, { linksOnly: true, slugMap });
		expect(item?.href).toBe('/frequently-asked-questions/has-a-page');
		expect(item?.copy).toBeUndefined();
	});

	it('leaves an Article only FAQ off the landing list, since it has no page to link to', () => {
		const result = resolveFAQItems(items, { linksOnly: true, slugMap });
		expect(result.map(item => item.id)).toEqual(['with-page']);
	});

	it('keeps an Article only FAQ, with its answer, everywhere else', () => {
		const result = resolveFAQItems(items);
		expect(result.map(item => item.id)).toEqual(['with-page', 'article-only']);
		expect(result[1]?.copy).toBeDefined();
	});
});
