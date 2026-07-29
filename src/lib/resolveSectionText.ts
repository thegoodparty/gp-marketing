import { stegaClean } from 'next-sanity';
import type { PortableTextProps } from '@portabletext/react';

import { resolveTokens, type TokenMap } from '~/lib/resolveTokens';

/** stegaClean then resolve token placeholders in a plain CMS string field. */
export function resolveSectionText(
	value: string | null | undefined,
	tokens?: TokenMap,
): string | undefined {
	if (value == null) return undefined;
	const cleaned = stegaClean(value);
	return resolveTokens(cleaned, tokens);
}

type PortableTextSpan = {
	_type?: string;
	_key?: string;
	text?: string;
	marks?: string[];
};

type PortableTextBlock = {
	_type: string;
	_key?: string;
	children?: PortableTextSpan[];
	[key: string]: unknown;
};

/** Resolve token placeholders in portable-text span strings before RichData rendering. */
export function resolveRichTextTokens(
	value: PortableTextProps['value'] | null | undefined,
	tokens?: TokenMap,
): PortableTextProps['value'] | null | undefined {
	if (value == null || !tokens || Object.keys(tokens).length === 0) {
		return value ?? undefined;
	}
	if (!Array.isArray(value)) {
		return value;
	}

	return (value as PortableTextBlock[]).map(block => {
		if (!block.children?.length) {
			return block;
		}
		return {
			...block,
			children: block.children.map(child => {
				if (child.text == null) {
					return child;
				}
				const cleaned = stegaClean(child.text);
				const resolved = resolveTokens(cleaned, tokens);
				return resolved === cleaned ? child : { ...child, text: resolved };
			}),
		};
	});
}
