/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import {
	ELECTIONS_SEARCH_COMPLETED_EVENT,
	ELECTIONS_SEARCH_EMPTY_INPUT_ERROR,
	ELECTIONS_SEARCH_ERRORED_EVENT,
	ELECTIONS_SEARCH_NETWORK_ERROR,
	ELECTIONS_SEARCH_UNRESOLVED_ERROR,
	placeForSubmit,
	submitElectionsNearYouSearch,
	submitElectionsNearYouSearchOnce,
} from './electionsNearYouSearch';
import type { PlaceSuggestion } from '~/lib/googlePlaces';
import type { ResolvedPlace } from '~/lib/resolvePlace';

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>(res => {
		resolve = res;
	});
	return { promise, resolve };
}

type TrackCall = { eventName: string; eventProperties?: Record<string, unknown> };

function makeDeps(resolveResult: () => Promise<ResolvedPlace>) {
	const trackCalls: TrackCall[] = [];
	const navigateCalls: string[] = [];

	return {
		deps: {
			resolvePlace: async () => resolveResult(),
			trackEvent: (eventName: string, eventProperties?: Record<string, unknown>) => {
				trackCalls.push({ eventName, eventProperties });
			},
			navigate: (url: string) => {
				navigateCalls.push(url);
			},
		},
		trackCalls,
		navigateCalls,
	};
}

describe('submitElectionsNearYouSearch', () => {
	test('a picked city that resolves fires Completed with inputType city and navigates with gp_src=search', async () => {
		const { deps, trackCalls, navigateCalls } = makeDeps(async () => ({ url: '/elections/ma/suffolk-county/boston', matchedLevel: 'city' }));

		const result = await submitElectionsNearYouSearch({ rawInput: 'Boston', place: { city: 'Boston', state: 'MA' } }, deps);

		expect(result).toEqual({ ok: true });
		expect(trackCalls).toEqual([
			{
				eventName: ELECTIONS_SEARCH_COMPLETED_EVENT,
				eventProperties: { inputType: 'city', resolvedCityCount: 1, hasDistrictMatch: false },
			},
		]);
		expect(navigateCalls).toEqual(['/elections/ma/suffolk-county/boston?gp_src=search']);
	});

	test('a picked county that resolves fires Completed with inputType county and resolvedCityCount 0', async () => {
		const { deps, trackCalls, navigateCalls } = makeDeps(async () => ({ url: '/elections/ma/suffolk-county', matchedLevel: 'county' }));

		const result = await submitElectionsNearYouSearch({ rawInput: 'Suffolk County', place: { county: 'Suffolk County', state: 'MA' } }, deps);

		expect(result).toEqual({ ok: true });
		expect(trackCalls).toEqual([
			{
				eventName: ELECTIONS_SEARCH_COMPLETED_EVENT,
				eventProperties: { inputType: 'county', resolvedCityCount: 0, hasDistrictMatch: false },
			},
		]);
		expect(navigateCalls).toEqual(['/elections/ma/suffolk-county?gp_src=search']);
	});

	test('a place that resolves only to state-level fires Completed with resolvedCityCount 0 and navigates to the state page', async () => {
		const { deps, trackCalls, navigateCalls } = makeDeps(async () => ({ url: '/elections/ma', matchedLevel: 'state' }));

		const result = await submitElectionsNearYouSearch({ rawInput: 'Massachusetts', place: { city: 'Massachusetts', state: 'MA' } }, deps);

		expect(result).toEqual({ ok: true });
		expect(trackCalls).toEqual([
			{
				eventName: ELECTIONS_SEARCH_COMPLETED_EVENT,
				eventProperties: { inputType: 'city', resolvedCityCount: 0, hasDistrictMatch: false },
			},
		]);
		expect(navigateCalls).toEqual(['/elections/ma?gp_src=search']);
	});

	test('unresolvable free text shows an inline error and fires Errored with unresolved, without navigating', async () => {
		const { deps, trackCalls, navigateCalls } = makeDeps(async () => ({ error: 'unresolved' }));

		const result = await submitElectionsNearYouSearch({ rawInput: '90210' }, deps);

		expect(result).toEqual({ ok: false, error: ELECTIONS_SEARCH_UNRESOLVED_ERROR });
		expect(trackCalls).toEqual([{ eventName: ELECTIONS_SEARCH_ERRORED_EVENT, eventProperties: { inputType: 'city', failureReason: 'unresolved' } }]);
		expect(navigateCalls).toEqual([]);
	});

	test('a thrown network failure fires Errored with network, without navigating', async () => {
		const { deps, trackCalls, navigateCalls } = makeDeps(async () => {
			throw new Error('fetch failed');
		});

		const result = await submitElectionsNearYouSearch({ rawInput: 'Boston', place: { city: 'Boston', state: 'MA' } }, deps);

		expect(result).toEqual({ ok: false, error: ELECTIONS_SEARCH_NETWORK_ERROR });
		expect(trackCalls).toEqual([{ eventName: ELECTIONS_SEARCH_ERRORED_EVENT, eventProperties: { inputType: 'city', failureReason: 'network' } }]);
		expect(navigateCalls).toEqual([]);
	});

	test('an empty submit fires Errored with empty_input and makes no resolve call', async () => {
		let resolveCallCount = 0;
		const { deps, trackCalls, navigateCalls } = makeDeps(async () => {
			resolveCallCount += 1;
			return { error: 'unresolved' };
		});

		const result = await submitElectionsNearYouSearch({ rawInput: '   ' }, deps);

		expect(result).toEqual({ ok: false, error: ELECTIONS_SEARCH_EMPTY_INPUT_ERROR });
		expect(trackCalls).toEqual([{ eventName: ELECTIONS_SEARCH_ERRORED_EVENT, eventProperties: { inputType: 'city', failureReason: 'empty_input' } }]);
		expect(navigateCalls).toEqual([]);
		expect(resolveCallCount).toBe(0);
	});
});

describe('submitElectionsNearYouSearchOnce', () => {
	test('two calls fired before the first settles (a double-click) run the search exactly once', async () => {
		let resolveCallCount = 0;
		const request = deferred<ResolvedPlace>();
		const { deps, navigateCalls } = makeDeps(async () => {
			resolveCallCount += 1;
			return request.promise;
		});
		const refs = { isSubmitting: { current: false } };

		const firstCall = submitElectionsNearYouSearchOnce({ rawInput: 'Boston', place: { city: 'Boston', state: 'MA' } }, deps, refs);
		// Fired synchronously, before the first call's resolvePlace has settled.
		const secondCall = submitElectionsNearYouSearchOnce({ rawInput: 'Boston', place: { city: 'Boston', state: 'MA' } }, deps, refs);

		expect(resolveCallCount).toBe(1);
		await expect(secondCall).resolves.toBeUndefined();

		request.resolve({ url: '/elections/ma/suffolk-county/boston', matchedLevel: 'city' });
		await expect(firstCall).resolves.toEqual({ ok: true });
		expect(navigateCalls).toEqual(['/elections/ma/suffolk-county/boston?gp_src=search']);
	});

	test('the guard clears after the first call settles, so a later call runs normally', async () => {
		const { deps } = makeDeps(async () => ({ url: '/elections/ma/suffolk-county/boston', matchedLevel: 'city' }));
		const refs = { isSubmitting: { current: false } };

		const first = await submitElectionsNearYouSearchOnce({ rawInput: 'Boston', place: { city: 'Boston', state: 'MA' } }, deps, refs);
		expect(first).toEqual({ ok: true });
		expect(refs.isSubmitting.current).toBe(false);

		const second = await submitElectionsNearYouSearchOnce({ rawInput: 'Boston', place: { city: 'Boston', state: 'MA' } }, deps, refs);
		expect(second).toEqual({ ok: true });
	});
});

describe('placeForSubmit', () => {
	const marionIN: PlaceSuggestion = { id: 'a', description: 'Marion, IN, USA', parsed: { city: 'Marion', state: 'IN' } };
	const marionOH: PlaceSuggestion = { id: 'b', description: 'Marion, OH, USA', parsed: { city: 'Marion', state: 'OH' } };

	test('a picked suggestion wins over everything else', async () => {
		const place = await placeForSubmit({
			rawInput: 'Marion, OH, USA',
			selected: marionOH.parsed,
			suggestions: [marionIN],
			fetchSuggestions: async () => [marionIN],
		});
		expect(place).toEqual({ city: 'Marion', state: 'OH' });
	});

	test('with nothing picked, the first suggestion on screen is used without another fetch', async () => {
		let fetches = 0;
		const place = await placeForSubmit({
			rawInput: 'marion',
			suggestions: [marionIN, marionOH],
			fetchSuggestions: async () => {
				fetches += 1;
				return [];
			},
		});
		expect(place).toEqual({ city: 'Marion', state: 'IN' });
		expect(fetches).toBe(0);
	});

	test('a submit before any suggestion arrived fetches them for the typed text and uses the first', async () => {
		const asked: string[] = [];
		const place = await placeForSubmit({
			rawInput: ' marion ',
			suggestions: [],
			fetchSuggestions: async value => {
				asked.push(value);
				return [marionIN];
			},
		});
		expect(asked).toEqual(['marion']);
		expect(place).toEqual({ city: 'Marion', state: 'IN' });
	});

	test('falls back to free text when nothing matches, the response is superseded, or the text is too short', async () => {
		expect(await placeForSubmit({ rawInput: 'zzzz', suggestions: [], fetchSuggestions: async () => [] })).toBeUndefined();
		expect(await placeForSubmit({ rawInput: 'zzzz', suggestions: [], fetchSuggestions: async () => undefined })).toBeUndefined();
		let fetches = 0;
		expect(
			await placeForSubmit({
				rawInput: 'ma',
				suggestions: [],
				fetchSuggestions: async () => {
					fetches += 1;
					return [marionIN];
				},
			}),
		).toBeUndefined();
		expect(fetches).toBe(0);
	});
});
