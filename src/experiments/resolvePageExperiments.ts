import 'server-only';

import type { Sections } from '~/PageSections';
import { resolveVariants } from '~/lib/experimentServer';
import {
	type PageExperimentExposure,
	type ResolvedPageExperiments,
	pickResolvedPageExperiments,
} from '~/experiments/pickResolvedPageExperiments';
import { activeVariantsByPageIdQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';

export type { PageExperimentExposure, ResolvedPageExperiments };

export async function resolvePageExperiments(args: {
	pageId: string;
	controlSections?: Sections[] | null;
}): Promise<ResolvedPageExperiments> {
	const { pageId, controlSections } = args;

	try {
		const variants = await sanityFetch({
			query: activeVariantsByPageIdQuery,
			params: { pageId },
			tags: ['experiment_variant'],
		});

		if (!variants?.length) {
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

		const assignments = await resolveVariants(orderedExperimentIds);

		return pickResolvedPageExperiments(variants, assignments, controlSections);
	} catch {
		return { pageSections: controlSections, exposures: [] };
	}
}
