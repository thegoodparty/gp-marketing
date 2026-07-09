import { describe, expect, test } from 'bun:test';

import { buildElectionsIndexTokens } from '~/lib/electionsIndexTemplates';
import {
	buildCandidatesTokens,
	buildPositionTokens,
	buildProfileTokens,
} from '~/lib/electionsTemplateHelpers';
import type { TokenMap } from '~/lib/resolveTokens';

const tokenCtx = {
	officeName: 'Mayor',
	stateName: 'New York',
	countyName: 'Kings',
	cityName: 'Brooklyn',
};

function expectTokensInclude(contract: string[], tokenMap: TokenMap) {
	for (const token of contract) {
		expect(token in tokenMap).toBe(true);
	}
}

describe('election token contract', () => {
	test('location state builder supplies documented tokens', () => {
		expectTokensInclude(
			['[State]'],
			buildElectionsIndexTokens({ locationLevel: 'state', stateName: tokenCtx.stateName }),
		);
	});

	test('location county builder supplies documented tokens', () => {
		expectTokensInclude(
			['[State]', '[County]'],
			buildElectionsIndexTokens({
				locationLevel: 'county',
				stateName: tokenCtx.stateName,
				countyName: tokenCtx.countyName,
			}),
		);
	});

	test('location city builder supplies documented tokens', () => {
		expectTokensInclude(
			['[State]', '[County]', '[City]'],
			buildElectionsIndexTokens({
				locationLevel: 'city',
				stateName: tokenCtx.stateName,
				countyName: tokenCtx.countyName,
				cityName: tokenCtx.cityName,
			}),
		);
	});

	test('location district builder supplies documented tokens', () => {
		expectTokensInclude(
			['[State]', '[District]'],
			buildElectionsIndexTokens({
				locationLevel: 'district',
				stateName: tokenCtx.stateName,
				countyName: tokenCtx.countyName,
			}),
		);
	});

	test('position builder supplies documented tokens', () => {
		expectTokensInclude(
			['[office name]', '[office]', '[State]', '[County or City]', '[location]'],
			buildPositionTokens(tokenCtx),
		);
	});

	test('candidates builder supplies documented tokens', () => {
		expectTokensInclude(
			['[office name]', '[office]', '[State]', '[County or City]', '[location]'],
			buildCandidatesTokens(tokenCtx),
		);
	});

	test('profile builder supplies documented tokens', () => {
		expectTokensInclude(
			['[candidate name]', '[office name]'],
			buildProfileTokens({ candidateName: 'Jane Doe', officeName: 'Mayor' }),
		);
	});
});
