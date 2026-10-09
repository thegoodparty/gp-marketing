import { describe, expect, test } from 'bun:test';

import { displayPlaceName } from './placeDisplayName';

describe('displayPlaceName', () => {
	test('says a town the way people do', () => {
		expect(displayPlaceName('Bethlehem town')).toBe('Town of Bethlehem');
		expect(displayPlaceName('Hancock town')).toBe('Town of Hancock');
		expect(displayPlaceName('New Castle town')).toBe('Town of New Castle');
	});

	test('capitalizes the other lowercase Census descriptors', () => {
		expect(displayPlaceName('Evesham township')).toBe('Evesham Township');
		expect(displayPlaceName('Bloomfield charter township')).toBe('Bloomfield Charter Township');
		expect(displayPlaceName('Colonie village')).toBe('Colonie Village');
		expect(displayPlaceName('Carlisle borough')).toBe('Carlisle Borough');
		expect(displayPlaceName('Albany city')).toBe('Albany City');
		expect(displayPlaceName('Monson plantation')).toBe('Monson Plantation');
		expect(displayPlaceName('Dorado zona urbana')).toBe('Dorado Zona Urbana');
	});

	test('leaves names that are already right alone, including lowercase words inside them', () => {
		for (const name of [
			'Jersey City',
			'Kansas City',
			"Coeur d'Alene",
			'Fond du Lac',
			'Prairie du Chien',
			'Havre de Grace',
			'Isle of Palms',
			'Lake in the Hills',
			'Truth or Consequences',
			'Town and Country',
			'St. John the Baptist Parish',
			'DeKalb',
			'LaGrange',
			'McAllen',
			"O'Fallon",
			'Bend-La Pine',
			'Town of Hempstead',
			'Township of Washington',
			'Garden Grove',
			'Fairfax County',
			'Lincoln CDP',
			'Socorro Independent School District',
		]) {
			expect(displayPlaceName(name)).toBe(name);
		}
	});

	test('only touches the descriptor at the very end', () => {
		expect(displayPlaceName('Town Creek village')).toBe('Town Creek Village');
		expect(displayPlaceName('Village Green town')).toBe('Town of Village Green');
		expect(displayPlaceName('Cityview')).toBe('Cityview');
	});

	test('passes empty and missing values through', () => {
		expect(displayPlaceName('')).toBe('');
		expect(displayPlaceName(null)).toBeUndefined();
		expect(displayPlaceName(undefined)).toBeUndefined();
	});
});
