import type {
	Field_componentColor6ColorsCreamMidnight,
	Field_componentColor6ColorsInverse,
	Field_iconColor6ColorsWhiteMixed,
} from 'sanity.types';

import type { iconColorValues } from './designTypesStore';
import type { backgroundTypeValues, componentColorValues } from './designTypesStore';
import { stegaClean } from 'next-sanity';

export function resolveComponentColor(
	color?: Field_componentColor6ColorsInverse | Field_componentColor6ColorsCreamMidnight,
	backgroundColor?: (typeof backgroundTypeValues)[number],
): Exclude<(typeof componentColorValues)[number], 'inverse'> | undefined {
	if (!color) return;

	const colorMap: Record<
		Exclude<Field_componentColor6ColorsInverse, 'Inverse'> | Field_componentColor6ColorsCreamMidnight,
		Exclude<(typeof componentColorValues)[number], 'inverse'>
	> = {
		Red: 'red',
		Waxflower: 'waxflower',
		BrightYellow: 'bright-yellow',
		HaloGreen: 'halo-green',
		Blue: 'blue',
		Lavender: 'lavender',
		Cream: 'cream',
		Midnight: 'midnight',
	};

	if (color === 'Inverse') {
		return backgroundColor === 'midnight' ? 'cream' : 'midnight';
	}

	return colorMap[stegaClean(color)];
}

export function resolveIconColor(color?: Field_iconColor6ColorsWhiteMixed) {
	const colorMap: Record<Field_iconColor6ColorsWhiteMixed, (typeof iconColorValues)[number]> = {
		Red: 'red',
		Waxflower: 'waxflower',
		BrightYellow: 'bright-yellow',
		HaloGreen: 'halo-green',
		Blue: 'blue',
		Lavender: 'lavender',
		White: 'white',
		Mixed: 'mixed',
	};

	return color ? colorMap[stegaClean(color)] : 'mixed';
}
