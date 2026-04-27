import type { Sections } from '~/PageSections';

export type PageExperimentExposure = {
	flagKey: string;
	variant: string;
};

export type ResolvedPageExperiments = {
	pageSections: Sections[] | null | undefined;
	exposures: PageExperimentExposure[];
};

/** Minimal row shape from activeVariantsByPageIdQuery (for tests and runtime). */
export type ActiveExperimentVariantRow = {
	field_experimentId: string | null;
	field_variantName: string | null;
	pageSections?: { list_pageSections?: Sections[] | null } | null;
};

/**
 * Given running variant rows (already ordered by priority) and Amplitude assignments,
 * returns the first applicable variant (full-page replacement, first match wins).
 */
export function pickResolvedPageExperiments(
	variants: readonly ActiveExperimentVariantRow[],
	assignments: Record<string, string | null>,
	controlSections?: Sections[] | null,
): ResolvedPageExperiments {
	if (!variants.length) {
		return { pageSections: controlSections, exposures: [] };
	}

	const seenIds = new Set<string>();
	const orderedExperimentIds: string[] = [];
	for (const v of variants) {
		const id = v.field_experimentId;
		if (id && !seenIds.has(id)) {
			seenIds.add(id);
			orderedExperimentIds.push(id);
		}
	}

	for (const experimentId of orderedExperimentIds) {
		const assignedVariant = assignments[experimentId];

		if (!assignedVariant || assignedVariant === 'control' || assignedVariant === 'off') {
			continue;
		}

		const match = variants.find(
			(v) => v.field_experimentId === experimentId && v.field_variantName === assignedVariant,
		);

		if (!match?.pageSections?.list_pageSections) {
			continue;
		}

		return {
			pageSections: match.pageSections.list_pageSections,
			exposures: [{ flagKey: experimentId, variant: assignedVariant }],
		};
	}

	return { pageSections: controlSections, exposures: [] };
}
