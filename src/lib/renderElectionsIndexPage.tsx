import {
	buildElectionsIndexPageSchema,
	buildElectionsIndexSectionOverrides,
	type ElectionsIndexPageContext,
} from '~/lib/electionsTemplateHelpers';
import { buildElectionsIndexTokens } from '~/lib/electionsIndexTemplates';
import { locationTemplateTypeFromLevel } from '~/lib/electionTemplates';
import { renderElectionTemplatePage } from '~/lib/renderElectionTemplatePage';

export type ElectionsIndexTemplateContext = ElectionsIndexPageContext & {
	placeSlug: string;
};

export async function renderElectionsIndexPage(ctx: ElectionsIndexTemplateContext) {
	return renderElectionTemplatePage({
		context: {
			templateType: locationTemplateTypeFromLevel(ctx.locationLevel),
			placeSlug: ctx.placeSlug,
		},
		sectionOverrides: buildElectionsIndexSectionOverrides(ctx),
		tokens: buildElectionsIndexTokens(ctx),
		schemas: [buildElectionsIndexPageSchema(ctx)],
		enableLandingSearch: true,
	});
}
