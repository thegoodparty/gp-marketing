import { describe, expect, test } from 'bun:test';

import { isAllowedFormId, parseAllowedFormIds } from './allowlist';

describe('parseAllowedFormIds', () => {
	test('returns empty set for undefined or empty input', () => {
		expect(parseAllowedFormIds(undefined).size).toBe(0);
		expect(parseAllowedFormIds('').size).toBe(0);
	});

	test('parses comma-separated form IDs', () => {
		expect(parseAllowedFormIds('abc,def,ghi')).toEqual(new Set(['abc', 'def', 'ghi']));
	});

	test('filters empty segments', () => {
		expect(parseAllowedFormIds('abc,,def,')).toEqual(new Set(['abc', 'def']));
	});

	test('trims whitespace around form IDs', () => {
		expect(parseAllowedFormIds('form-1, form-2, form-3')).toEqual(
			new Set(['form-1', 'form-2', 'form-3']),
		);
		expect(isAllowedFormId('form-2', parseAllowedFormIds('form-1, form-2, form-3'))).toBe(true);
	});
});

describe('isAllowedFormId', () => {
	test('rejects missing formId', () => {
		expect(isAllowedFormId(undefined, new Set(['abc']))).toBe(false);
		expect(isAllowedFormId('', new Set(['abc']))).toBe(false);
	});

	test('allows any formId when allowlist is empty', () => {
		expect(isAllowedFormId('any-form', new Set())).toBe(true);
	});

	test('allows listed formId when allowlist is set', () => {
		const allowed = new Set(['abc', 'def']);
		expect(isAllowedFormId('abc', allowed)).toBe(true);
	});

	test('rejects unlisted formId when allowlist is set', () => {
		expect(isAllowedFormId('xyz', new Set(['abc', 'def']))).toBe(false);
	});
});
