import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { FeaturedCitiesBlockSection } from './FeaturedCitiesBlockSection';

/**
 * A location page hands the block `[]` to say "this place has no cities to
 * feature". The block must then leave nothing in the DOM at all, not an empty
 * <section> shell that keeps the template's spacing (review, 2026-10-06).
 */
const section = {
	_type: 'component_featuredCitiesBlock',
	_key: 'featured-cities',
	featuredCitiesBlockHeader: { field_title: 'Featured cities' },
	componentSettings: { field_anchorId: 'featured-cities' },
} as const;

type Props = Parameters<typeof FeaturedCitiesBlockSection>[0];

describe('FeaturedCitiesBlockSection', () => {
	test('renders nothing at all when the page has no cities to feature', async () => {
		const element = await FeaturedCitiesBlockSection({ ...section, citiesOverride: [] } as unknown as Props);
		expect(element).toBeNull();
	});

	test("renders the page's own cities when it has some", async () => {
		const element = await FeaturedCitiesBlockSection({
			...section,
			citiesOverride: [{ name: 'Nashville', stateAbbreviation: 'TN', openElectionsCount: 12, href: '/elections/tn/davidson-county/nashville' }],
		} as unknown as Props);
		if (!element) throw new Error('expected the block to render');
		const html = renderToStaticMarkup(element);
		expect(html).toContain('data-section="Featured Cities Block"');
		expect(html).toContain('Nashville');
	});
});
