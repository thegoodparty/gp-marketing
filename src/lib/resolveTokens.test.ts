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

	test('strips known tokens that were not supplied for this page', () => {
		const tokens: TokenMap = { '[State]': 'Texas' };
		// [County] is a known token but not provided here, so it is blanked rather than leaked.
		expect(resolveTokens('Elections in [County], [State]', tokens)).toBe('Elections in , Texas');
	});

	test('leaves non-token bracketed text unchanged', () => {
		const tokens: TokenMap = { '[State]': 'Texas' };
		expect(resolveTokens('See [docs] for [State]', tokens)).toBe('See [docs] for Texas');
	});

	test('does not strip anything when no tokens are supplied', () => {
		expect(resolveTokens('Hello [County]', undefined)).toBe('Hello [County]');
		expect(resolveTokens('Hello [County]', {})).toBe('Hello [County]');
	});

	test('handles empty input', () => {
		expect(resolveTokens('', { '[State]': 'Ohio' })).toBe('');
		expect(resolveTokens(undefined, { '[State]': 'Ohio' })).toBeUndefined();
	});
});
