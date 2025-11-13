import { stegaClean } from 'next-sanity';
import type { Field_columnLayout34Columns } from 'sanity.types';

export function resolveColumnLayout(columns?: Field_columnLayout34Columns) {
	if (!columns) return;

	const layoutMap = {
		'3Col': 3 as const,
		'4Col': 4 as const,
	};

	return layoutMap[stegaClean(columns)];
}
