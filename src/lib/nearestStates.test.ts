import { describe, expect, test } from 'bun:test';

import { pickItemsForState, rankStatesByDistance } from './nearestStates';

describe('rankStatesByDistance', () => {
	test('Delaware fills from its neighbours before anywhere else', () => {
		expect(rankStatesByDistance('Delaware').slice(0, 4).sort()).toEqual(['District of Columbia', 'Maryland', 'New Jersey', 'Pennsylvania']);
	});

	test('Alaska and Hawaii, which border no state, still get a nearest state', () => {
		expect(rankStatesByDistance('Alaska')[0]).toBe('Washington');
		expect(rankStatesByDistance('Hawaii')[0]).toBe('California');
	});

	test('never ranks the state itself, and matches names loosely', () => {
		const ranked = rankStatesByDistance(' texas ');
		expect(ranked).not.toContain('Texas');
		expect(ranked).toHaveLength(50);
	});

	test('an unknown name ranks nothing', () => {
		expect(rankStatesByDistance('Narnia')).toEqual([]);
		expect(rankStatesByDistance(undefined)).toEqual([]);
	});
});

describe('pickItemsForState', () => {
	type Item = { id: string; state?: string };
	const getState = (item: Item) => item.state;
	const items: Item[] = [
		{ id: 'tx-1', state: 'Texas' },
		{ id: 'md-1', state: 'Maryland' },
		{ id: 'national-1' },
		{ id: 'nj-1', state: 'New Jersey' },
		{ id: 'tx-2', state: 'Texas' },
		{ id: 'pa-1', state: 'Pennsylvania' },
		{ id: 'de-1', state: 'Delaware' },
	];

	test("the page's own state comes first, in the list's order, then the nearest states", () => {
		expect(pickItemsForState(items, getState, 'Delaware', 4).map(i => i.id)).toEqual(['de-1', 'md-1', 'nj-1', 'pa-1']);
	});

	test('a state with no quotes of its own fills from nearby, not from far away', () => {
		expect(pickItemsForState(items, getState, 'Virginia', 2).map(i => i.id)).toEqual(['md-1', 'de-1']);
	});

	test('quotes with no state come after every tagged state', () => {
		const picked = pickItemsForState(items, getState, 'Texas', 10).map(i => i.id);
		expect(picked.slice(0, 2)).toEqual(['tx-1', 'tx-2']);
		expect(picked.slice(2, 6).sort()).toEqual(['de-1', 'md-1', 'nj-1', 'pa-1']);
		expect(picked[6]).toBe('national-1');
	});

	test('stops at the limit', () => {
		expect(pickItemsForState(items, getState, 'Texas', 1).map(i => i.id)).toEqual(['tx-1']);
	});

	test('a list with no states at all comes back untouched', () => {
		const untagged: Item[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
		expect(pickItemsForState(untagged, getState, 'Texas', 2)).toBe(untagged);
	});

	test('no page state means no reordering', () => {
		expect(pickItemsForState(items, getState, undefined, 2)).toBe(items);
	});

	test('an unknown state still shows the untagged quotes, and the full list when there are none', () => {
		expect(pickItemsForState(items, getState, 'Narnia', 3).map(i => i.id)).toEqual(['national-1']);
		const allTagged = items.filter(i => i.state);
		expect(pickItemsForState(allTagged, getState, 'Narnia', 3)).toBe(allTagged);
	});
});
