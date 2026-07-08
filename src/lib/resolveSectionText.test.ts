import { describe, expect, test } from 'bun:test';

import { resolveRichTextTokens } from '~/lib/resolveSectionText';

describe('resolveRichTextTokens', () => {
	test('resolves tokens in portable-text span strings', () => {
		const value = [
			{
				_key: 'copy',
				_type: 'block',
				children: [
					{ _key: 'span', _type: 'span', marks: [], text: 'Candidates for [office]' },
				],
				markDefs: [],
				style: 'normal',
			},
		];

		const result = resolveRichTextTokens(value, { '[office]': 'Mayor' });

		expect(result?.[0]?.children?.[0]?.text).toBe('Candidates for Mayor');
	});
});
