/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { isLogRocketPath } from './logrocketPaths';

describe('isLogRocketPath', () => {
	test('records the elections index and every location page under it', () => {
		expect(isLogRocketPath('/elections')).toBe(true);
		expect(isLogRocketPath('/elections/')).toBe(true);
		expect(isLogRocketPath('/elections/nc')).toBe(true);
		expect(isLogRocketPath('/elections/nc/wake-county')).toBe(true);
		expect(isLogRocketPath('/elections/nc/wake-county/raleigh')).toBe(true);
	});

	test('records office and candidates pages', () => {
		expect(isLogRocketPath('/elections/nc/position/state-senate-district-1')).toBe(true);
		expect(isLogRocketPath('/elections/nc/wake-county/raleigh/position/city-council/candidates')).toBe(true);
		expect(isLogRocketPath('/elections/nc/wake-county/raleigh/north-hills/position/city-council')).toBe(true);
		expect(isLogRocketPath('/elections/nc/position?positionId=abc')).toBe(true);
	});

	test('records people profiles', () => {
		expect(isLogRocketPath('/people/jane-doe')).toBe(true);
		expect(isLogRocketPath('/People/Jane-Doe')).toBe(true);
	});

	test('does not record the rest of the site', () => {
		expect(isLogRocketPath('/')).toBe(false);
		expect(isLogRocketPath('/people')).toBe(false);
		expect(isLogRocketPath('/electionsfoo')).toBe(false);
		expect(isLogRocketPath('/candidates')).toBe(false);
		expect(isLogRocketPath('/blog/elections-2026')).toBe(false);
		expect(isLogRocketPath('/run-for-office')).toBe(false);
		expect(isLogRocketPath(null)).toBe(false);
		expect(isLogRocketPath(undefined)).toBe(false);
		expect(isLogRocketPath('')).toBe(false);
	});
});
