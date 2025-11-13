import type { Field_iconColor6Colors } from 'sanity.types';
import type { colorTypeValues } from './designTypesStore';

export function resolveIconBg(background: Field_iconColor6Colors) {
	const iconBgMap: Record<Field_iconColor6Colors, Exclude<(typeof colorTypeValues)[number], 'inverse'>> = {
		Blue: 'blue',
		Red: 'red',
		Waxflower: 'waxflower',
		BrightYellow: 'bright-yellow',
		HaloGreen: 'halo-green',
		Lavender: 'lavender',
	};

	return iconBgMap[background];
}
