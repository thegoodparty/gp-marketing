import { describe, expect, test } from 'bun:test';
import { resolveBg } from './resolveBg';

describe('resolveBg', () => {
	test('maps CMS midnight value', () => {
		expect(resolveBg('midnight')).toBe('midnight');
	});

	test('maps legacy MidnightDark value from static templates', () => {
		expect(resolveBg('MidnightDark')).toBe('midnight');
	});

	test('maps CMS cream value', () => {
		expect(resolveBg('cream')).toBe('cream');
	});

	test('maps legacy Cream value from static templates', () => {
		expect(resolveBg('Cream')).toBe('cream');
	});

	test('defaults to cream when unset', () => {
		expect(resolveBg(undefined)).toBe('cream');
	});
});
