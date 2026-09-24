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

	test('inverts the heading on a midnight background', () => {
		const html = renderToStaticMarkup(<NearbyOffices backgroundColor='midnight' offices={[office(1)]} />);

		expect(html).toContain('bg-midnight-900');
		expect(html).toContain('text-white');
	});
});
