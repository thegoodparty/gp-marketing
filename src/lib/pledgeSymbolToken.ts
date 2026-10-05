import { stegaClean } from 'next-sanity';
import type { PortableTextProps } from '@portabletext/react';

/**
 * Where an editor wants the Heart & Star badge inside a sentence. Rich text in
 * Studio has no inline-object type for it, so the editor types this token and
 * the renderer swaps it for the badge. It is not a location token, so
 * `resolveTokens` leaves it alone.
 */
export const PLEDGE_SYMBOL_TOKEN = '[symbol]';

export const PLEDGE_SYMBOL_TYPE = 'pledgeSymbol';

type Span = { _type?: string; _key?: string; text?: string; marks?: string[] };
type Block = { _type: string; _key?: string; children?: Span[]; [key: string]: unknown };

/** One plain paragraph as portable text, so a code-side default renders through the same path as the editor's copy. */
export function plainTextBlocks(text: string): PortableTextProps['value'] {
	return [{ _type: 'block', _key: 'default', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 'default-span', text, marks: [] }] }];
}

/**
 * Splits every span that carries the token into text spans around a
 * `pledgeSymbol` inline object, keeping the span's marks on each piece, so a
 * token inside a link stays inside the link.
 */
export function insertPledgeSymbols(value: PortableTextProps['value'] | null | undefined): PortableTextProps['value'] | undefined {
	if (!Array.isArray(value)) return value ?? undefined;
	const hasToken = (block: Block) =>
		Boolean(block.children?.some(child => typeof child.text === 'string' && stegaClean(child.text).includes(PLEDGE_SYMBOL_TOKEN)));
	if (!(value as Block[]).some(hasToken)) return value;
	return (value as Block[]).map(block => {
		if (!hasToken(block)) return block;
		const children: Span[] = [];
		for (const child of block.children) {
			const text = typeof child.text === 'string' ? stegaClean(child.text) : null;
			if (text == null || !text.includes(PLEDGE_SYMBOL_TOKEN)) {
				children.push(child);
				continue;
			}
			const parts = text.split(PLEDGE_SYMBOL_TOKEN);
			parts.forEach((part, index) => {
				if (part) children.push({ ...child, _key: `${child._key ?? 'span'}-${index}`, text: part });
				if (index < parts.length - 1) children.push({ _type: PLEDGE_SYMBOL_TYPE, _key: `${child._key ?? 'span'}-symbol-${index}` });
			});
		}
		return { ...block, children };
	});
}
