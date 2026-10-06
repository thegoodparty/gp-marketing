import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ListOfOfficesBlock, type OfficeItem } from './ListOfOfficesBlock.tsx';

/**
 * The offices table is the only on-page route from a location page to its
 * position pages, and both of its filters run in the browser. While they
 * dropped non-matching rows from the array, the server markup carried just the
 * first page of the default year, so a crawler reading /elections/tx saw 3 of
 * its 15 positions and /elections/tx/harris-county 5 of 20 — the rest existed
 * in the React payload as data and in no <a> anywhere.
 *
 * Every office now renders and the ones outside the current view are hidden.
 * These tests hold that line, because nothing about it is visible on the page:
 * going back to slicing the array looks identical to a human.
 */

function officesAcrossYears(): OfficeItem[] {
	return [
		...Array.from({ length: 12 }, (_, i) => ({
			id: `now-${i}`,
			type: 'STATE',
			position: `Current year position ${i}`,
			nextElectionDate: '2026-11-03',
			href: `/elections/tx/position/current-${i}`,
		})),
		{
			id: 'past',
			type: 'STATE',
			position: 'Past year position',
			nextElectionDate: '2022-11-08',
			href: '/elections/tx/position/past',
		},
		{
			id: 'future',
			type: 'STATE',
			position: 'Future year position',
			nextElectionDate: '2028-05-23',
			href: '/elections/tx/position/future',
		},
	];
}

function render(offices: OfficeItem[]) {
	return renderToStaticMarkup(
		<ListOfOfficesBlock offices={offices} defaultYear={2026} availableYears={[2022, 2026, 2028]} pageSize={10} />,
	);
}

/** The wrapper holding `href`, and whether it is hidden. */
function isRowHidden(html: string, href: string): boolean {
	const marker = html.indexOf(`href="${href}"`);
	expect(marker).toBeGreaterThan(-1);
	// The row's own wrapper is the last <div> opened before the anchor.
	const before = html.slice(0, marker);
	const wrapper = before.lastIndexOf('<div');
	return before.slice(wrapper).includes('hidden');
}

describe('ListOfOfficesBlock server markup', () => {
	const html = render(officesAcrossYears());

	test('links every office, including other years and rows past the first page', () => {
		for (const office of officesAcrossYears()) {
			expect(html).toContain(`href="${office.href}"`);
		}
	});

	test('hides the rows the year filter excludes, and shows the ones it does not', () => {
		expect(isRowHidden(html, '/elections/tx/position/past')).toBe(true);
		expect(isRowHidden(html, '/elections/tx/position/future')).toBe(true);
		expect(isRowHidden(html, '/elections/tx/position/current-0')).toBe(false);
	});

	test('hides rows beyond the page size but keeps them in the markup', () => {
		expect(isRowHidden(html, '/elections/tx/position/current-9')).toBe(false);
		expect(isRowHidden(html, '/elections/tx/position/current-10')).toBe(true);
		expect(isRowHidden(html, '/elections/tx/position/current-11')).toBe(true);
	});

	test('hides other years even when every office shares one id', () => {
		// Place races from the election API carry no id, so location pages
		// rendered every office as "undefined" and one visible row matched them all.
		const sameId = officesAcrossYears().map(office => ({ ...office, id: 'undefined' }));
		const collided = render(sameId);
		expect(isRowHidden(collided, '/elections/tx/position/past')).toBe(true);
		expect(isRowHidden(collided, '/elections/tx/position/future')).toBe(true);
		expect(isRowHidden(collided, '/elections/tx/position/current-10')).toBe(true);
		expect(isRowHidden(collided, '/elections/tx/position/current-0')).toBe(false);
	});

	test('still links every office when the selected year has none', () => {
		const emptyYear = renderToStaticMarkup(
			<ListOfOfficesBlock offices={officesAcrossYears()} defaultYear={2024} availableYears={[2024, 2026]} />,
		);
		expect(emptyYear).toContain('No offices found for 2024');
		expect(emptyYear).toContain('href="/elections/tx/position/current-0"');
		expect(isRowHidden(emptyYear, '/elections/tx/position/current-0')).toBe(true);
	});
});
