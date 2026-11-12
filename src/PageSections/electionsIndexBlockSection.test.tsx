import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ElectionsIndexBlockSection } from './ElectionsIndexBlockSection';

/**
 * A location page hands the block its own list of places. An empty list means
 * the place has nothing below it (Virginia Beach is a city with no cities in
 * it), and the block must then render nothing rather than fall back to the
 * list of every state under a "Cities in Virginia Beach" heading (bug, 2026-10-09).
 */
const section = {
	_type: 'component_electionsIndexBlock',
	_key: 'elections-index',
	electionsIndexBlockHeader: { field_title: 'Find more elections' },
	componentSettings: { field_anchorId: 'elections-index' },
} as const;

type Props = Parameters<typeof ElectionsIndexBlockSection>[0];

describe('ElectionsIndexBlockSection', () => {
	test('renders nothing when a location page has no places to list', () => {
		const element = ElectionsIndexBlockSection({
			...section,
			electionsOverride: [],
			stateSlugOverride: 'va/virginia-beach-city',
			indexOverride: { header: { title: 'Cities in Virginia Beach' } },
		} as unknown as Props);
		expect(element).toBeNull();
	});

	test("renders the page's own places when it has some", () => {
		const element = ElectionsIndexBlockSection({
			...section,
			electionsOverride: [{ name: 'Herndon', href: '/elections/va/fairfax-county/herndon', level: 'city' }],
			stateSlugOverride: 'va/fairfax-county',
		} as unknown as Props);
		if (!element) throw new Error('expected the block to render');
		const html = renderToStaticMarkup(element as React.ReactElement);
		expect(html).toContain('Herndon');
		expect(html).not.toContain('Alabama');
	});

	/** What a crawler reads: every place a link, the ones past Show More hidden (Emily, 2026-11-12). */
	test('the server HTML links every place, past the first page too', () => {
		const counties = Array.from({ length: 30 }, (_, i) => ({
			name: `County ${String(i).padStart(2, '0')}`,
			href: `/elections/mi/county-${i}`,
			level: 'county',
		}));
		const element = ElectionsIndexBlockSection({
			...section,
			electionsOverride: counties,
			stateSlugOverride: 'mi',
		} as unknown as Props);
		if (!element) throw new Error('expected the block to render');
		const html = renderToStaticMarkup(element as React.ReactElement);

		expect(html.match(/href="\/elections\/mi\/county-\d+"/g)).toHaveLength(30);
		expect(html.match(/<li hidden="">/g)).toHaveLength(6);
		expect(html).toContain('30 Available Results');
	});

	test('still lists every state when no page list is given at all', () => {
		const element = ElectionsIndexBlockSection({ ...section } as unknown as Props);
		if (!element) throw new Error('expected the block to render');
		const html = renderToStaticMarkup(element as React.ReactElement);
		expect(html).toContain('Alabama');
		expect(html).toContain('51 Available Results');
	});
});
