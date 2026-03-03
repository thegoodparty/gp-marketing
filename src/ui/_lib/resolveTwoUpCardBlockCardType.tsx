import type { TwoUpCardBlockCardProps } from '../TwoUpCardBlock';
import type { twoUpCardBlockCardTypeValues } from './designTypesStore';

export function resolveTwoUpCardBlockCardType(type: (typeof twoUpCardBlockCardTypeValues)[number]) {
	const typeMap: Record<(typeof twoUpCardBlockCardTypeValues)[number], TwoUpCardBlockCardProps['type']> = {
		ValueProposition: 'value-prop',
		Quote: 'testimonial',
		Image: 'image',
	};

	return typeMap[type];
}
