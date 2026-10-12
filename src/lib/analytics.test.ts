/// <reference types="bun-types" />
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
	trackDataLayerEvent,
	trackVoterGuideEvent,
	trackVoterGuideProfileViewed,
	VOTER_GUIDE_EVENTS,
	type VoterGuideEventKey,
} from './analytics';

/**
 * The voter guide events exist for GA4, and GA4 only sees what reaches
 * `window.dataLayer` under the exact name a GTM trigger is configured for.
 * These tests pin the push shape and the names, and that `docs/analytics.md`
 * (the sheet the container is configured from) lists every one of them.
 */

type Call = { name: string; props?: Record<string, unknown> };

type StubWindow = {
	dataLayer?: Record<string, unknown>[];
	amplitude?: { track(name: string, props?: Record<string, unknown>): void };
	analytics?: { track(name: string, props?: Record<string, unknown>): void };
	location: { pathname: string };
	addEventListener(type: string, listener: () => void, options?: unknown): void;
	removeEventListener(type: string, listener: () => void): void;
};

const testGlobal = globalThis as unknown as { window?: unknown };
const originalWindow = testGlobal.window;

let amplitudeCalls: Call[];
let segmentCalls: Call[];
let listeners: Map<string, (() => void)[]>;
let stub: StubWindow;

function installWindow(opts: { amplitude: boolean }) {
	amplitudeCalls = [];
	segmentCalls = [];
	listeners = new Map();
	stub = {
		location: { pathname: '/elections/tx/harris-county' },
		analytics: { track: (name, props) => segmentCalls.push({ name, props }) },
		addEventListener: (type, listener) => listeners.set(type, [...(listeners.get(type) ?? []), listener]),
		removeEventListener: (type, listener) =>
			listeners.set(
				type,
				(listeners.get(type) ?? []).filter(l => l !== listener),
			),
	};
	if (opts.amplitude) stub.amplitude = { track: (name, props) => amplitudeCalls.push({ name, props }) };
	testGlobal.window = stub;
}

beforeEach(() => installWindow({ amplitude: true }));

afterEach(() => {
	if (originalWindow === undefined) delete testGlobal.window;
	else testGlobal.window = originalWindow;
});

describe('trackDataLayerEvent', () => {
	test('creates the data layer when GTM has not, and pushes the event name with its properties', () => {
		expect(stub.dataLayer).toBeUndefined();

		trackDataLayerEvent('voter_guide_show_more_click', { list: 'offices' });

		expect(stub.dataLayer).toEqual([{ event: 'voter_guide_show_more_click', list: 'offices' }]);
	});

	test('appends to an existing data layer rather than replacing it', () => {
		stub.dataLayer = [{ event: 'gtm.js' }];

		trackDataLayerEvent('voter_guide_show_more_click');

		expect(stub.dataLayer).toEqual([{ event: 'gtm.js' }, { event: 'voter_guide_show_more_click' }]);
	});
});

describe('trackVoterGuideEvent', () => {
	test('reaches the data layer under the GA4 name and Amplitude under the title-case name, with the page path', () => {
		trackVoterGuideEvent('officeClick', { list: 'offices', office_name: 'Mayor', office_level: 'local' });

		const expected = {
			page_path: '/elections/tx/harris-county',
			list: 'offices',
			office_name: 'Mayor',
			office_level: 'local',
			office_type: null,
			election_date: null,
			pledged_count: null,
			href: null,
		};
		expect(stub.dataLayer).toEqual([{ event: 'voter_guide_office_click', ...expected }]);
		expect(amplitudeCalls).toEqual([{ name: 'Voter Guide - Office Clicked', props: expected }]);
	});

	/**
	 * GTM's data layer keeps the last value of every key across pushes. A key
	 * the caller does not know must therefore be pushed as null, or a tag that
	 * reads it would see the previous event's value.
	 */
	test('writes null for a property the caller left undefined', () => {
		trackVoterGuideEvent('officeClick', { office_level: undefined, pledged_count: null });

		expect(stub.dataLayer?.[0]).toMatchObject({ office_level: null, pledged_count: null });
	});

	/**
	 * Two callers of one event name may know different things (the offices list
	 * sends page_level, the index sends hidden_count), and GTM keeps the last
	 * value of a key it was not sent. Every key an event declares is therefore
	 * written on every push, null when the caller had nothing for it.
	 */
	test('writes null for every key the event declares that the caller did not send', () => {
		trackVoterGuideEvent('showMoreClick', { list: 'locations_index', hidden_count: 3 });

		expect(stub.dataLayer?.[0]).toEqual({
			event: 'voter_guide_show_more_click',
			page_path: '/elections/tx/harris-county',
			list: 'locations_index',
			hidden_count: 3,
			page_level: null,
		});
	});

	test('does not reach Segment unless the event is one marketing automates on', () => {
		trackVoterGuideEvent('officeClick', {});
		expect(segmentCalls).toEqual([]);

		trackVoterGuideEvent('claimProfileClick', { source: 'claim_block' });
		expect(segmentCalls.map(c => c.name)).toEqual(['Voter Guide - Claim Profile Clicked']);
	});

	test('an Amplitude-only event never touches the data layer', () => {
		trackVoterGuideEvent('outboundClick', { href: 'https://example.com' });

		expect(stub.dataLayer).toBeUndefined();
		expect(amplitudeCalls.map(c => c.name)).toEqual(['Voter Guide - Outbound Link Clicked']);
	});
});

describe('trackVoterGuideProfileViewed', () => {
	const view = {
		personId: 'abc123',
		profileState: 'D',
		persona: 'candidate',
		claimed: false,
		pledged: true,
		removed: false,
		unpublished: false,
		partyClass: null,
	};

	test('pushes the view to the data layer at once with every state flag', () => {
		trackVoterGuideProfileViewed(view);

		expect(stub.dataLayer).toEqual([
			{
				event: 'voter_guide_profile_view',
				page_path: '/elections/tx/harris-county',
				person_id: 'abc123',
				profile_state: 'D',
				persona: 'candidate',
				claimed: false,
				pledged: true,
				removed: false,
				unpublished: false,
				party_class: null,
			},
		]);
		expect(amplitudeCalls.map(c => c.name)).toEqual(['Voter Guide - Profile Viewed']);
	});

	/**
	 * The Amplitude SDK loads after the page is interactive and `trackEvent` has
	 * no queue, so a view fired straight from a mount effect would be dropped.
	 * The data layer has no such problem: GTM replays it.
	 */
	test('waits for the Amplitude SDK when it is not there yet, without delaying the data layer', () => {
		installWindow({ amplitude: false });

		const stop = trackVoterGuideProfileViewed(view);

		expect(stub.dataLayer).toHaveLength(1);
		expect(listeners.get('experiment:ready')).toHaveLength(1);

		stub.amplitude = { track: (name, props) => amplitudeCalls.push({ name, props }) };
		for (const listener of listeners.get('experiment:ready') ?? []) listener();

		expect(amplitudeCalls.map(c => c.name)).toEqual(['Voter Guide - Profile Viewed']);
		expect(stub.dataLayer).toHaveLength(1);
		stop();
	});
});

describe('the event names', () => {
	const keys = Object.keys(VOTER_GUIDE_EVENTS) as VoterGuideEventKey[];

	test('every GA4 name is snake_case under the voter_guide_ prefix, and no two events share one', () => {
		const names = keys.map(key => VOTER_GUIDE_EVENTS[key].dataLayer).flatMap(name => (name ? [name] : []));
		for (const name of names) expect(name).toMatch(/^voter_guide_[a-z_]+$/);
		expect(new Set(names).size).toBe(names.length);
	});

	test('every Amplitude name carries the prefix the existing search events use', () => {
		for (const key of keys) expect(VOTER_GUIDE_EVENTS[key].amplitude).toStartWith('Voter Guide - ');
	});

	/**
	 * The doc's Properties column is what the GTM variables are made from, so a
	 * key the code writes but the doc does not name would never reach GA4.
	 */
	test('docs/analytics.md names every key every event declares', async () => {
		const doc = await Bun.file(new URL('../../docs/analytics.md', import.meta.url)).text();
		for (const key of keys) {
			for (const property of VOTER_GUIDE_EVENTS[key].keys) expect(doc).toContain(`\`${property}\``);
		}
	});

	/**
	 * Whoever configures the GTM container works from docs/analytics.md, so an
	 * event the code can push but the doc does not name would never get a
	 * trigger, and would reach GA4 as nothing.
	 */
	test('docs/analytics.md names every event the code can push', async () => {
		const doc = await Bun.file(new URL('../../docs/analytics.md', import.meta.url)).text();
		for (const key of keys) {
			const { dataLayer, amplitude } = VOTER_GUIDE_EVENTS[key];
			if (dataLayer) expect(doc).toContain(`\`${dataLayer}\``);
			expect(doc).toContain(amplitude);
		}
	});
});
