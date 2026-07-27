import { describe, expect, it } from 'bun:test';
import { getPathsToRevalidate, shouldRevalidateAllLayouts } from './revalidatePaths';

describe('getPathsToRevalidate', () => {
	it('revalidates FAQ detail and index paths when slug is present', () => {
		expect(
			getPathsToRevalidate('faq', {
				faqOverview: { field_slug: 'what-is-goodpartyorg' },
			}),
		).toEqual(['/frequently-asked-questions/what-is-goodpartyorg', '/frequently-asked-questions']);
	});

	it('revalidates only the FAQ index when slug is missing', () => {
		expect(getPathsToRevalidate('faq', {})).toEqual(['/frequently-asked-questions']);
	});

	it('keeps article path parity after extraction', () => {
		expect(
			getPathsToRevalidate('article', {
				editorialOverview: { field_slug: 'hello-world' },
			}),
		).toEqual(['/blog/article/hello-world', '/blog', '/llms.txt']);
		expect(getPathsToRevalidate('article', {})).toEqual(['/blog', '/llms.txt']);
	});
});

describe('shouldRevalidateAllLayouts', () => {
	it('invalidates all layouts for FAQ changes', () => {
		expect(shouldRevalidateAllLayouts('faq')).toBe(true);
		expect(shouldRevalidateAllLayouts('article')).toBe(false);
	});
});
