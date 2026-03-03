import { stegaClean } from 'next-sanity';
import type { Field_layoutStackedSideBySide } from 'sanity.types';

import type { StatsBlockProps } from '../StatsBlock';

export function resolveLayoutStackedSideBySide(layout?: Field_layoutStackedSideBySide): StatsBlockProps['layout'] | undefined {
	if (!layout) return;

	const layoutMap: Record<Field_layoutStackedSideBySide, StatsBlockProps['layout']> = {
		Vertical: 'stacked',
		Horizontal: 'side-by-side',
	};

	return layoutMap[stegaClean(layout)];
}
