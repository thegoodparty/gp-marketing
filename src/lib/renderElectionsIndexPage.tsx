import {
	buildElectionsIndexPageSchema,
	buildElectionsIndexSectionOverrides,
	type ElectionsIndexPageContext,
} from '~/lib/electionsTemplateHelpers';
import { buildElectionsIndexTokens } from '~/lib/electionsIndexTemplates';
import { getFeaturedPeople } from '~/lib/featuredCandidates';
import { locationTemplateTypeFromLevel } from '~/lib/electionTemplates';
import { renderElectionTemplatePage } from '~/lib/renderElectionTemplatePage';

export type ElectionsIndexTemplateContext = ElectionsIndexPageContext & {
	placeSlug: string;
};

export async function renderElectionsIndexPage(ctx: ElectionsIndexTemplateContext) {
	// Fetched here rather than in each route so every location page feeds the block.
	const featuredPeople = ctx.featuredPeople ?? (await getFeaturedPeople({ placeSlug: ctx.placeSlug, locationLevel: ctx.locationLevel }));
	return renderElectionTemplatePage({
		context: {
			templateType: locationTemplateTypeFromLevel(ctx.locationLevel),
			placeSlug: ctx.placeSlug,
		},
		sectionOverrides: buildElectionsIndexSectionOverrides({ ...ctx, featuredPeople }),
		tokens: buildElectionsIndexTokens(ctx),
		schemas: [buildElectionsIndexPageSchema(ctx)],
		enableLandingSearch: true,
	});
}
