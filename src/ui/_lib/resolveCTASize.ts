import { stegaClean } from 'next-sanity';
import type { Field_ctaSizeNormalCondensed } from 'sanity.types';

import type { normalCondensedValues } from './designTypesStore';

export function resolveCTASize(size?: Field_ctaSizeNormalCondensed) {
	if (!size) return;

	const sizeMap: Record<Field_ctaSizeNormalCondensed, (typeof normalCondensedValues)[number]> = {
		Normal: 'normal',
		Condensed: 'condensed',
	};

	return sizeMap[stegaClean(size)];
}
