import type { Field_textSize } from 'sanity.types';

export const TEXT_SIZE_MAP = {
	Small: {
		heading: 'heading-md',
		body: 'body-2',
	},
	Medium: {
		heading: 'heading-lg',
		body: 'body-1',
	},
	Large: {
		heading: 'heading-xl',
		body: 'body-1',
	},
} as const;

export type ResolvedTextSize = (typeof TEXT_SIZE_MAP)[Field_textSize];
export type HeadingStyle = ResolvedTextSize['heading'];
export type BodyStyle = ResolvedTextSize['body'];

export function resolveTextSize(textSize?: Field_textSize): ResolvedTextSize {
	return TEXT_SIZE_MAP[textSize ?? 'Medium'];
}
