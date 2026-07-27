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
		const blocks = result as Array<{ children?: Array<{ text?: string }> }> | null | undefined;

		expect(blocks?.[0]?.children?.[0]?.text).toBe('Candidates for Mayor');
	});
});
