import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { NearbyOffices } from './NearbyOffices.tsx';
import type { OfficeItem } from './ListOfOfficesBlock.tsx';

const office = (i: number, overrides: Partial<OfficeItem> = {}): OfficeItem => ({
	id: `office-${i}`,
	type: 'Local',
	position: `Office ${i}`,
	nextElectionDate: '2026-11-03',
	href: `/elections/tx/harris-county/houston/position/office-${i}`,
	...overrides,
});

/**
 * The rows arrive per page at runtime. On a page whose route supplies none the
 * block would otherwise publish a heading over nothing, which no error
 * boundary catches, so the whole section has to disappear instead.
 */
describe('NearbyOffices', () => {
	test('renders nothing without offices', () => {
		expect(renderToStaticMarkup(<NearbyOffices heading='Nearby offices' offices={[]} />)).toBe('');
	});

	test('renders the heading, one linked row per office, and the formatted date', () => {
		const html = renderToStaticMarkup(<NearbyOffices offices={[office(1, { type: 'County', position: 'County Judge' })]} />);

		expect(html).toContain('Nearby offices');
		expect(html).toContain('County Judge');
		expect(html).toContain('>County<');
		expect(html).toContain('href="/elections/tx/harris-county/houston/position/office-1"');
		expect(html).toContain('Nov 3, 2026');
	});

	test('uses the editable heading when one is supplied', () => {
		const html = renderToStaticMarkup(<NearbyOffices heading='Other offices in Houston' offices={[office(1)]} />);

		expect(html).toContain('Other offices in Houston');
		expect(html).not.toContain('Nearby offices');
	});

	test('never shows more than eight rows', () => {
		const html = renderToStaticMarkup(<NearbyOffices offices={Array.from({ length: 10 }, (_, i) => office(i))} />);

		expect(html.match(/data-component="NearbyOffices"/g)).toHaveLength(1);
		expect(html.match(/<a /g)).toHaveLength(8);
		expect(html).not.toContain('Office 9');
	});

	test('a row without a link is not an anchor and has no arrow', () => {
		const html = renderToStaticMarkup(<NearbyOffices offices={[office(1, { href: undefined })]} />);

		expect(html).not.toContain('<a ');
		expect(html).not.toContain('<svg');
	});

	/**
	 * The count mirrors the offices list: a number and the badge on the desktop
	 * row, the badge and a sentence on the phone card. Nothing is drawn without a
	 * count above zero, because an unknown and a genuine zero are the same value
	 * here and neither may publish as "0 independents".
	 */
	test('shows the pledged candidate count with its badge, worded for one or many', () => {
		const many = renderToStaticMarkup(<NearbyOffices offices={[office(1, { pledgedCount: 2 })]} />);
		const one = renderToStaticMarkup(<NearbyOffices offices={[office(1, { pledgedCount: 1 })]} />);

		expect(many).toContain('# of independents running');
		expect(many).toContain('2<span class="md:sr-only"> independents running</span>');
		expect(many.match(/<svg/g)).toHaveLength(3);
		expect(one).toContain('1<span class="md:sr-only"> independent running</span>');
	});

	test('draws no count for a row with zero or no pledged candidates', () => {
		const zero = renderToStaticMarkup(<NearbyOffices offices={[office(1, { pledgedCount: 0 })]} />);
		const unknown = renderToStaticMarkup(<NearbyOffices offices={[office(1)]} />);

		for (const html of [zero, unknown]) {
			expect(html).not.toContain('md:sr-only');
			expect(html.match(/<svg/g)).toHaveLength(2);
		}
	});

	test('inverts the heading on a midnight background', () => {
		const html = renderToStaticMarkup(<NearbyOffices backgroundColor='midnight' offices={[office(1)]} />);

		expect(html).toContain('bg-midnight-900');
		expect(html).toContain('text-white');
	});
});
