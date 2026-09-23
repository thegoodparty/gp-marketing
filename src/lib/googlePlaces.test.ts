/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { parsePlacePrediction } from './googlePlaces';

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
