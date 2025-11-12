import type { Field_highlightedFeatureAlignmentRightLeft } from 'sanity.types';
import type { leftRightValues } from './designTypesStore';

export const resolveHighlightedFeatureAlignment = (alignment: Field_highlightedFeatureAlignmentRightLeft) => {
	const alignmentMap: Record<Field_highlightedFeatureAlignmentRightLeft, (typeof leftRightValues)[number]> = {
		Right: 'right',
		Left: 'left',
	};

	return alignmentMap[alignment];
};
