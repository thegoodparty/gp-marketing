import { describe, expect, test } from 'bun:test';
import { insertPledgeSymbols, plainTextBlocks } from './pledgeSymbolToken';

type Child = { _type?: string; text?: string; marks?: string[] };
const childrenOf = (value: unknown) => ((value as Array<{ children: Child[] }>)[0]?.children ?? []).map(c => [c._type, c.text ?? '', c.marks ?? []]);

describe('insertPledgeSymbols', () => {
	test('turns the token into an inline pledgeSymbol object between the surrounding text', () => {
		const out = insertPledgeSymbols(plainTextBlocks('Offices with this symbol [symbol] have candidates.'));
		expect(childrenOf(out)).toEqual([
			['span', 'Offices with this symbol ', []],
			['pledgeSymbol', '', []],
			['span', ' have candidates.', []],
		]);
	});

	test('keeps the marks of the span it splits, so a token inside a link stays linked', () => {
		const value = [
			{
				_type: 'block',
				_key: 'b',
				style: 'normal',
				markDefs: [{ _key: 'l', _type: 'inlineExternalLink', field_externalLink: 'https://example.com' }],
				children: [{ _type: 'span', _key: 's', text: 'the [symbol] badge', marks: ['l'] }],
			},
		];
		expect(childrenOf(insertPledgeSymbols(value))).toEqual([
			['span', 'the ', ['l']],
			['pledgeSymbol', '', []],
			['span', ' badge', ['l']],
		]);
	});

	test('handles a token at either end and more than one per span', () => {
		const out = insertPledgeSymbols(plainTextBlocks('[symbol] twice [symbol]'));
		expect(childrenOf(out).map(([type]) => type)).toEqual(['pledgeSymbol', 'span', 'pledgeSymbol']);
	});

	test('returns blocks without the token untouched, and nothing for nothing', () => {
		const value = plainTextBlocks('No badge here.');
		expect(insertPledgeSymbols(value)).toBe(value);
		expect(insertPledgeSymbols(undefined)).toBeUndefined();
	});
});
