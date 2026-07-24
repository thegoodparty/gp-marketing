import { describe, expect, it } from 'bun:test';
import { getPathsToRevalidate } from './revalidatePaths';

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
});
