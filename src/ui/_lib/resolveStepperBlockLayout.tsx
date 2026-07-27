import type { Field_mediaAlignmentRightLeft } from 'sanity.types';

export function resolveStepperBlockLayout(mediaAlignment: Field_mediaAlignmentRightLeft): 'media-left' | 'media-right' {
	const layoutMap: Record<Field_mediaAlignmentRightLeft, 'media-left' | 'media-right'> = {
		Left: 'media-left',
		Right: 'media-right',
	};

	return layoutMap[mediaAlignment];
}
