import { describe, expect, test } from 'bun:test';

import { buildCandidatesTokens, buildPositionTokens } from '~/lib/electionsTemplateHelpers';
import { resolveTokens } from '~/lib/resolveTokens';

const tokenCtx = {
	officeName: 'Mayor',
	stateName: 'New York',
	countyName: 'Kings',
	cityName: 'Brooklyn',
};

describe('buildPositionTokens', () => {
	test('resolves both [office name] and [office]', () => {
		const tokens = buildPositionTokens(tokenCtx);
		expect(resolveTokens('Running for [office name]?', tokens)).toBe('Running for Mayor?');
		expect(resolveTokens('Running for [office]?', tokens)).toBe('Running for Mayor?');
	});

	test('resolves [location]', () => {
		const tokens = buildPositionTokens(tokenCtx);
		expect(resolveTokens('Running in [location]', tokens)).toBe('Running in Brooklyn, Kings, New York');
	});

	test('does not supply [candidate name]', () => {
		const tokens = buildPositionTokens(tokenCtx);
		expect(resolveTokens('Meet [candidate name]', tokens)).toBe('Meet ');
	});
});

describe('buildCandidatesTokens', () => {
	test('resolves both [office name] and [office]', () => {
		const tokens = buildCandidatesTokens(tokenCtx);
		expect(resolveTokens('Not running for [office]?', tokens)).toBe('Not running for Mayor?');
		expect(resolveTokens('See candidates for [office name]', tokens)).toBe('See candidates for Mayor');
	});

	test('resolves [location], [State], and [County or City]', () => {
		const tokens = buildCandidatesTokens(tokenCtx);
		expect(resolveTokens('Candidates in [location]', tokens)).toBe('Candidates in Brooklyn, Kings, New York');
		expect(resolveTokens('Candidates in [State]', tokens)).toBe('Candidates in New York');
		expect(resolveTokens('Candidates in [County or City]', tokens)).toBe('Candidates in Brooklyn');
	});

	test('does not supply [candidate name]', () => {
		const tokens = buildCandidatesTokens(tokenCtx);
		expect(resolveTokens('Meet [candidate name]', tokens)).toBe('Meet ');
	});
});
