import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * The voter guide events exist for GA4, which only sees what lands in
 * `window.dataLayer`. These tests mount the real blocks in a JSDOM, do what a
 * visitor does, and read the data layer back, because a handler that is wired
 * to the wrong element or spreads its props the wrong way renders identically
 * and only shows up as an event that never arrives.
 */

const DOM_GLOBALS = [
	'Node',
	'NodeFilter',
	'Element',
	'HTMLElement',
	'HTMLAnchorElement',
	'HTMLSelectElement',
	'DocumentFragment',
	'DOMRect',
	'Event',
	'CustomEvent',
	'MouseEvent',
	'KeyboardEvent',
	'FocusEvent',
	'MutationObserver',
] as const;

let dom: JSDOM;
let root: Root | undefined;
let dataLayer: Record<string, unknown>[];
let amplitudeEvents: { name: string; props?: Record<string, unknown> }[];

beforeEach(() => {
	dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
		url: 'http://localhost/elections/tx/harris-county',
		pretendToBeVisual: true,
	});
	const { window } = dom;

	globalThis.document = window.document;
	globalThis.navigator = window.navigator;
	globalThis.getComputedStyle = window.getComputedStyle.bind(window);
	for (const name of DOM_GLOBALS) {
		(globalThis as Record<string, unknown>)[name] = (window as unknown as Record<string, unknown>)[name];
	}

	dataLayer = [];
	amplitudeEvents = [];
	(window as unknown as { dataLayer: unknown }).dataLayer = dataLayer;
	(window as unknown as { amplitude: unknown }).amplitude = {
		track: (name: string, props?: Record<string, unknown>) => amplitudeEvents.push({ name, props }),
	};

	// React's Internet Explorer fallback for change events, which it picks when
	// no `window` exists at import time; see claimFlow.test.tsx.
	const shim = window.HTMLElement.prototype as unknown as Record<string, unknown>;
	shim['attachEvent'] = () => {};
	shim['detachEvent'] = () => {};

	globalThis.window = window as unknown as Window & typeof globalThis;
	(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
	if (root) {
		await act(async () => {
			root?.unmount();
		});
		root = undefined;
	}
	dom.window.close();
});

async function flush() {
	await new Promise<void>(resolve => {
		dom.window.setTimeout(resolve, 0);
	});
}

async function render(element: React.ReactElement) {
	await act(async () => {
		root = createRoot(document.getElementById('root')!);
		root.render(element);
		await flush();
	});
}

async function click(element: Element) {
	await act(async () => {
		// Links navigate on an unhandled click, which JSDOM reports as "not
		// implemented" noise; the event has already been recorded by then.
		element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
		await flush();
	});
}

async function select(element: HTMLSelectElement, value: string) {
	await act(async () => {
		const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLSelectElement.prototype, 'value')!.set!;
		setter.call(element, value);
		element.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
		await flush();
	});
}

function ga4Events() {
	return dataLayer.filter(e => String(e['event']).startsWith('voter_guide_'));
}

describe('the offices list', () => {
	async function renderOffices() {
		const { ListOfOfficesBlock } = await import('./ListOfOfficesBlock.tsx');
		await render(
			React.createElement(ListOfOfficesBlock, {
				pageLevel: 'local',
				defaultYear: 2026,
				availableYears: [2026, 2027],
				pageSize: 1,
				offices: [
					{
						id: 'mayor',
						type: 'CITY',
						position: 'Mayor',
						nextElectionDate: '2026-11-03',
						href: '/elections/tx/harris-county/houston/position/mayor',
						level: 'local',
						pledgedCount: 2,
					},
					{
						id: 'judge',
						type: 'COUNTY',
						position: 'County Judge',
						nextElectionDate: '2026-11-03',
						href: '/elections/tx/harris-county/position/county-judge',
						level: 'county',
					},
				],
			}),
		);
	}

	test('a row click names the office, its level and where the row sat', async () => {
		await renderOffices();

		await click(document.querySelector('a[href$="/position/mayor"]')!);

		expect(ga4Events()).toEqual([
			{
				event: 'voter_guide_office_click',
				page_path: '/elections/tx/harris-county',
				list: 'offices',
				office_name: 'Mayor',
				office_level: 'local',
				office_type: 'CITY',
				election_date: '2026-11-03',
				pledged_count: 2,
				href: '/elections/tx/harris-county/houston/position/mayor',
			},
		]);
		expect(amplitudeEvents.map(e => e.name)).toEqual(['Voter Guide - Office Clicked']);
	});

	test('the level and year filters each report which filter changed and to what', async () => {
		await renderOffices();

		await select(document.getElementById('offices-level-select') as HTMLSelectElement, 'county');
		await select(document.getElementById('offices-year-select') as HTMLSelectElement, '2027');

		expect(ga4Events()).toEqual([
			{ event: 'voter_guide_offices_filter_change', page_path: '/elections/tx/harris-county', filter: 'level', value: 'county', page_level: 'local' },
			{ event: 'voter_guide_offices_filter_change', page_path: '/elections/tx/harris-county', filter: 'year', value: 2027, page_level: 'local' },
		]);
	});

	test('Show More reports the list it expanded', async () => {
		await renderOffices();

		const showMore = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('Show More'))!;
		await click(showMore);

		expect(ga4Events()).toEqual([
			{ event: 'voter_guide_show_more_click', page_path: '/elections/tx/harris-county', list: 'offices', page_level: 'local' },
		]);
	});
});

describe('the counties and cities index', () => {
	test('a place click names the place and its level; Show More says how many were hidden', async () => {
		const { ElectionsIndexBlock } = await import('./ElectionsIndexBlock.tsx');
		await render(
			React.createElement(ElectionsIndexBlock, {
				stateSlug: 'tx',
				initialDisplayCount: 1,
				showSearch: false,
				elections: [
					{ name: 'Houston', href: '/elections/tx/harris-county/houston', level: 'city' },
					{ name: 'Pasadena', href: '/elections/tx/harris-county/pasadena', level: 'city' },
				],
			}),
		);

		await click(document.querySelector('a[href$="/houston"]')!);
		const showMore = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('Show More'))!;
		await click(showMore);

		expect(ga4Events()).toEqual([
			{
				event: 'voter_guide_location_index_click',
				page_path: '/elections/tx/harris-county',
				place_name: 'Houston',
				place_level: 'city',
				href: '/elections/tx/harris-county/houston',
				searched: false,
			},
			{ event: 'voter_guide_show_more_click', page_path: '/elections/tx/harris-county', list: 'locations_index', hidden_count: 1 },
		]);
	});
});

describe('the shared button', () => {
	test('reports the event a server-rendered block asked for, with its own label and destination', async () => {
		const { ComponentButton } = await import('./Inputs/Button.tsx');
		await render(
			React.createElement(ComponentButton, {
				buttonType: 'anchor',
				href: '#independents',
				label: "See who's an independent",
				analytics: { event: 'heroButtonClick', properties: { location_level: 'county', state: 'Texas' } },
			}),
		);

		await click(document.querySelector('a')!);

		expect(ga4Events()).toEqual([
			{
				event: 'voter_guide_hero_button_click',
				page_path: '/elections/tx/harris-county',
				label: "See who's an independent",
				href: '#independents',
				location_level: 'county',
				state: 'Texas',
			},
		]);
	});
});

describe('the nearby offices block', () => {
	/**
	 * Not on the published position template as of 2026-10-09, so the preview
	 * cannot show it firing; this is the only check the wiring gets.
	 */
	test('a row click reports the office under the nearby list', async () => {
		const { NearbyOffices } = await import('./NearbyOffices.tsx');
		await render(
			React.createElement(NearbyOffices, {
				offices: [
					{
						id: 'clerk',
						type: 'County',
						position: 'County Clerk',
						nextElectionDate: '2026-11-03',
						href: '/elections/tx/harris-county/position/county-clerk',
					},
				],
			}),
		);

		await click(document.querySelector('a[href$="/county-clerk"]')!);

		expect(ga4Events()).toEqual([
			{
				event: 'voter_guide_office_click',
				page_path: '/elections/tx/harris-county',
				list: 'nearby',
				office_name: 'County Clerk',
				office_level: null,
				office_type: 'County',
				election_date: '2026-11-03',
				pledged_count: null,
				href: '/elections/tx/harris-county/position/county-clerk',
			},
		]);
	});
});

describe('the claim profile block', () => {
	test('its button reports a claim click from the block, and Segment gets it too', async () => {
		const segment: string[] = [];
		(window as unknown as { analytics: unknown }).analytics = { track: (name: string) => segment.push(name) };
		const { ClaimProfileBlock } = await import('./ClaimProfileBlock.tsx');
		await render(
			React.createElement(ClaimProfileBlock, {
				layout: 'banner',
				headline: 'Are you running?',
				claimButton: { buttonType: 'signup', label: 'Claim your profile' },
			}),
		);

		await click(document.querySelector('a')!);

		expect(ga4Events()).toEqual([
			{
				event: 'voter_guide_claim_profile_click',
				page_path: '/elections/tx/harris-county',
				label: 'Claim your profile',
				href: 'https://app.goodparty.org/sign-up',
				source: 'claim_block',
				layout: 'banner',
			},
		]);
		expect(segment).toEqual(['Voter Guide - Claim Profile Clicked']);
		expect(amplitudeEvents.map(e => e.name)).toEqual(['Sign Up Clicked', 'Voter Guide - Claim Profile Clicked']);
	});
});
