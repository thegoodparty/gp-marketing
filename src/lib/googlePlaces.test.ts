/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { parsePlacePrediction, runSuggestionQuery, type PlaceSuggestion, type SuggestionQueryDeps } from './googlePlaces';

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

describe('parsePlacePrediction', () => {
	test('parses a single-word city prediction into { city, state }', () => {
		const parsed = parsePlacePrediction({
			placeId: 'place-boston',
			text: { text: 'Boston, MA, USA' },
			mainText: { text: 'Boston' },
			secondaryText: { text: 'MA, USA' },
			types: ['locality', 'political'],
		});

		expect(parsed).toEqual({ city: 'Boston', state: 'MA' });
	});

	test('parses a two-word city prediction into { city, state }', () => {
		const parsed = parsePlacePrediction({
			placeId: 'place-new-york',
			text: { text: 'New York, NY, USA' },
			mainText: { text: 'New York' },
			secondaryText: { text: 'NY, USA' },
			types: ['locality', 'political'],
		});

		expect(parsed).toEqual({ city: 'New York', state: 'NY' });
	});

	test('parses an administrative_area_level_2 prediction into { county, state }', () => {
		const parsed = parsePlacePrediction({
			placeId: 'place-suffolk',
			text: { text: 'Suffolk County, MA, USA' },
			mainText: { text: 'Suffolk County' },
			secondaryText: { text: 'MA, USA' },
			types: ['administrative_area_level_2', 'political'],
		});

		expect(parsed).toEqual({ county: 'Suffolk County', state: 'MA' });
	});

	test('normalizes a spelled-out state name to its two-letter code', () => {
		const parsed = parsePlacePrediction({
			placeId: 'place-guilford',
			text: { text: 'Guilford County, North Carolina, USA' },
			mainText: { text: 'Guilford County' },
			secondaryText: { text: 'North Carolina, USA' },
			types: ['administrative_area_level_2', 'political'],
		});

		expect(parsed).toEqual({ county: 'Guilford County', state: 'NC' });
	});

	test('parses a city prediction whose secondaryText leads with a disambiguating county', () => {
		const parsed = parsePlacePrediction({
			placeId: 'place-springfield',
			text: { text: 'Springfield, Greene County, Missouri, USA' },
			mainText: { text: 'Springfield' },
			secondaryText: { text: 'Greene County, Missouri, USA' },
			types: ['locality', 'political'],
		});

		expect(parsed).toEqual({ city: 'Springfield', state: 'MO' });
	});

	test('returns undefined when the secondary text carries no resolvable state', () => {
		const parsed = parsePlacePrediction({
			placeId: 'place-unknown',
			text: { text: 'Somewhere, Nowhereland' },
			mainText: { text: 'Somewhere' },
			secondaryText: { text: 'Nowhereland' },
			types: ['locality', 'political'],
		});

		expect(parsed).toBeUndefined();
	});

	test('returns undefined when the prediction has no mainText', () => {
		const parsed = parsePlacePrediction({
			placeId: 'place-bare',
			text: { text: 'MA, USA' },
			secondaryText: { text: 'MA, USA' },
			types: ['locality', 'political'],
		});

		expect(parsed).toBeUndefined();
	});
});

describe('runSuggestionQuery', () => {
	const bostonSuggestion: PlaceSuggestion = { id: 'boston', description: 'Boston, MA, USA', parsed: { city: 'Boston', state: 'MA' } };
	const staleSuggestion: PlaceSuggestion = {
		id: 'boston-heights',
		description: 'Boston Heights, OH, USA',
		parsed: { city: 'Boston Heights', state: 'OH' },
	};

	test('a slower response for an earlier keystroke does not overwrite a later keystroke\'s result', async () => {
		const latestQuery = { current: 'Bos' };
		const sessionToken: { current: object | null } = { current: null };

		const bosRequest = deferred<PlaceSuggestion[]>();
		const bostonRequest = deferred<PlaceSuggestion[]>();

		const deps: SuggestionQueryDeps = {
			ensureGooglePlacesLoaded: async () => undefined,
			startPlacesSession: () => ({}),
			fetchPlaceSuggestions: async (input: string) => (input === 'Bos' ? bosRequest.promise : bostonRequest.promise),
		};

		// "Bos" is issued first (the earlier keystroke); "Boston" is issued once
		// the user has kept typing, and is now the latest query the ref knows about.
		const bosResult = runSuggestionQuery('Bos', { latestQuery, sessionToken }, deps);
		latestQuery.current = 'Boston';
		const bostonResult = runSuggestionQuery('Boston', { latestQuery, sessionToken }, deps);

		// The later keystroke's request resolves first.
		bostonRequest.resolve([bostonSuggestion]);
		await expect(bostonResult).resolves.toEqual([bostonSuggestion]);

		// The earlier keystroke's request resolves after: its result must be discarded, not applied.
		bosRequest.resolve([staleSuggestion]);
		await expect(bosResult).resolves.toBeUndefined();
	});

	test('reuses the same session token across two queries in one search cycle', async () => {
		const latestQuery = { current: 'Bost' };
		const sessionToken: { current: object | null } = { current: null };
		const startPlacesSession = () => ({ id: 'one-session' });
		const seenTokens: unknown[] = [];

		const deps: SuggestionQueryDeps = {
			ensureGooglePlacesLoaded: async () => undefined,
			startPlacesSession,
			fetchPlaceSuggestions: async (_input, token) => {
				seenTokens.push(token);
				return [];
			},
		};

		await runSuggestionQuery('Bost', { latestQuery, sessionToken }, deps);
		latestQuery.current = 'Bosto';
		await runSuggestionQuery('Bosto', { latestQuery, sessionToken }, deps);

		expect(seenTokens).toHaveLength(2);
		expect(seenTokens[0]).toBe(seenTokens[1]);
	});

	test('a failed suggestion fetch clears suggestions for the current query rather than throwing', async () => {
		const latestQuery = { current: 'Bost' };
		const sessionToken: { current: object | null } = { current: null };

		const deps: SuggestionQueryDeps = {
			ensureGooglePlacesLoaded: async () => undefined,
			startPlacesSession: () => ({}),
			fetchPlaceSuggestions: async () => {
				throw new Error('network error');
			},
		};

		await expect(runSuggestionQuery('Bost', { latestQuery, sessionToken }, deps)).resolves.toEqual([]);
	});
});
