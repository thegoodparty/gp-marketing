import { describe, expect, test } from 'bun:test';
import { resolveTokens, type TokenMap } from '~/lib/resolveTokens';

describe('resolveTokens', () => {
	test('replaces known tokens in plain strings', () => {
		const tokens: TokenMap = {
			'[State]': 'New York',
			'[office name]': 'Governor',
		};
		expect(resolveTokens('Elections in [State] for [office name]', tokens)).toBe(
			'Elections in New York for Governor',
		);
	});

	test('leaves unknown placeholders unchanged', () => {
		const tokens: TokenMap = { '[State]': 'Texas' };
		expect(resolveTokens('Hello [County]', tokens)).toBe('Hello [County]');
	});

	test('handles empty input', () => {
		expect(resolveTokens('', { '[State]': 'Ohio' })).toBe('');
		expect(resolveTokens(undefined, { '[State]': 'Ohio' })).toBeUndefined();
	});
});
