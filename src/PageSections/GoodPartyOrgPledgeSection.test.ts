import { describe, expect, test } from 'bun:test';

import { resolveRichTextTokens } from '~/lib/resolveSectionText';

describe('GoodPartyOrgPledgeSection token resolution', () => {
	test('resolves profile tokens in portable-text span strings', () => {
		const value = [
			{
				_key: 'copy',
				_type: 'block',
				children: [
					{ _key: 'span', _type: 'span', marks: [], text: 'Pledge for [candidate name]' },
				],
				markDefs: [],
				style: 'normal',
			},
		];

		const result = resolveRichTextTokens(value, { '[candidate name]': 'Jane Doe' });

		expect(result?.[0]?.children?.[0]?.text).toBe('Pledge for Jane Doe');
	});
});
