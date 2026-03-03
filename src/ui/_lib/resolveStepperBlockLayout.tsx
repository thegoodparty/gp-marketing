import type { Field_mediaAlignmentRightLeft } from 'sanity.types';

import type { StepperBlockProps } from '../StepperBlock';

export function resolveStepperBlockLayout(mediaAlignment: Field_mediaAlignmentRightLeft): StepperBlockProps['layout'] {
	const layoutMap: Record<Field_mediaAlignmentRightLeft, StepperBlockProps['layout']> = {
		Left: 'media-left',
		Right: 'media-right',
	};

	return layoutMap[mediaAlignment];
}
