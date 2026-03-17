import { stegaClean } from 'next-sanity';
import type { Field_blockColorCreamMidnight } from 'sanity.types';

export function resolveBg(background: Field_blockColorCreamMidnight) {
	const bgMap: Record<Field_blockColorCreamMidnight, 'cream' | 'midnight'> = {
		Cream: 'cream',
		MidnightDark: 'midnight',
	};

	return bgMap[stegaClean(background)] ?? 'cream';
}
