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

	test('resolves location tokens in the heading and copy, like every other template block', async () => {
		const element = await FeaturedCitiesBlockSection({
			...section,
			featuredCitiesBlockHeader: {
				field_title: 'Cities in [County]',
				block_summaryText: [
					{ _key: 'b', _type: 'block', style: 'normal', markDefs: [], children: [{ _key: 's', _type: 'span', marks: [], text: 'Pick a city in [State]:' }] },
				],
			},
			tokens: { '[County]': 'Peoria County', '[State]': 'Illinois' },
			citiesOverride: [{ name: 'Peoria', stateAbbreviation: 'IL', openElectionsCount: 4, href: '/elections/il/peoria-county/peoria' }],
		} as unknown as Props);
		if (!element) throw new Error('expected the block to render');
		const html = renderToStaticMarkup(element);
		expect(html).toContain('Cities in Peoria County');
		expect(html).toContain('Pick a city in Illinois:');
		expect(html).not.toContain('[County]');
	});

	test('"[Cities]" reads Municipalities when any featured place is a township, and Cities otherwise', async () => {
		const header = { field_title: '[Cities] in [State]' };
		const township = { name: 'Alcona Township', stateAbbreviation: 'MI', openElectionsCount: 4, href: '/elections/mi/alcona-county/alcona-township', kind: 'town' as const };
		const city = { name: 'Detroit', stateAbbreviation: 'MI', openElectionsCount: 9, href: '/elections/mi/wayne-county/detroit', kind: 'city' as const };

		const mixed = await FeaturedCitiesBlockSection({ ...section, featuredCitiesBlockHeader: header, tokens: { '[State]': 'Michigan' }, citiesOverride: [city, township] } as unknown as Props);
		const citiesOnly = await FeaturedCitiesBlockSection({ ...section, featuredCitiesBlockHeader: header, tokens: { '[State]': 'Michigan' }, citiesOverride: [city] } as unknown as Props);
		if (!mixed || !citiesOnly) throw new Error('expected both blocks to render');

		expect(renderToStaticMarkup(mixed)).toContain('Municipalities in Michigan');
		expect(renderToStaticMarkup(citiesOnly)).toContain('Cities in Michigan');
	});
});
