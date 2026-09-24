import {
	buildPositionPageSchemas,
	buildPositionSectionOverrides,
	buildPositionTokens,
	type PositionPageContext,
} from '~/lib/electionsTemplateHelpers';
import { loadPositionOfficeholders } from '~/lib/positionOfficeholders';
import { renderElectionTemplatePage } from '~/lib/renderElectionTemplatePage';

export type PositionTemplateContext = PositionPageContext & {
	placeSlug?: string;
	raceSlug?: string;
};

export async function renderElectionsPositionPage(input: PositionTemplateContext) {
	// Every position route renders through here, so the content block's
	// officeholder rows are loaded once, in one place, rather than in each route.
	const ctx: PositionTemplateContext = {
		...input,
		officeholders: input.officeholders ?? (await loadPositionOfficeholders(input.race?.positionId)),
	};
	const schemas = buildPositionPageSchemas(ctx);

	return renderElectionTemplatePage({
		context: {
			templateType: 'position',
			placeSlug: ctx.placeSlug,
			raceSlug: ctx.raceSlug ?? ctx.race?.slug,
		},
		sectionOverrides: buildPositionSectionOverrides(ctx),
		tokens: buildPositionTokens(ctx),
		schemas: [schemas.positionPageSchema, schemas.breadcrumbSchema, schemas.faqSchema],
	});
}
