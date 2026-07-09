import { describe, expect, test } from 'bun:test';

import {
	resolveGoodPartyOrgPledgeCard,
	resolveGoodPartyOrgPledgeHeader,
} from './GoodPartyOrgPledgeSection';

const profileTokens = { '[candidate name]': 'Jane Doe', '[office name]': 'Mayor' };

const portableTextBlock = (text: string) => [
	{
		_key: 'copy',
		_type: 'block',
		children: [{ _key: 'span', _type: 'span', marks: [], text }],
		markDefs: [],
		style: 'normal',
	},
];

function firstSpanText(value: unknown): string | undefined {
	const blocks = value as Array<{ children?: Array<{ text?: string }> }> | null | undefined;
	return blocks?.[0]?.children?.[0]?.text;
}

describe('resolveGoodPartyOrgPledgeHeader', () => {
	test('resolves profile tokens in header plain-text and richtext fields', () => {
		const result = resolveGoodPartyOrgPledgeHeader(
			{
				field_title: 'Pledge for [candidate name]',
				field_label: 'Office: [office name]',
				field_caption: 'Candidate [candidate name]',
				block_summaryText: portableTextBlock('All candidates including [candidate name] agree:'),
			},
			profileTokens,
		);

		expect(result.title).toBe('Pledge for Jane Doe');
		expect(result.label).toBe('Office: Mayor');
		expect(result.caption).toBe('Candidate Jane Doe');
		expect(firstSpanText(result.copy)).toBe('All candidates including Jane Doe agree:');
	});
});

describe('resolveGoodPartyOrgPledgeCard', () => {
	test('resolves profile tokens in card title and richtext content', () => {
		const result = resolveGoodPartyOrgPledgeCard(
			{
				field_title: '[candidate name] pledge',
				block_summaryText: portableTextBlock('Support [office name] candidates like [candidate name].'),
			},
			profileTokens,
		);

		expect(result.title).toBe('Jane Doe pledge');
		expect(firstSpanText(result.content)).toBe('Support Mayor candidates like Jane Doe.');
	});
});
