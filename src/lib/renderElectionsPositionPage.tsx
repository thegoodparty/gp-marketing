import {
	buildPositionPageSchemas,
	buildPositionSectionOverrides,
	buildPositionTokens,
	type PositionPageContext,
} from '~/lib/electionsTemplateHelpers';
import { renderElectionTemplatePage } from '~/lib/renderElectionTemplatePage';

export type PositionTemplateContext = PositionPageContext & {
	placeSlug?: string;
	raceSlug?: string;
};

export async function renderElectionsPositionPage(ctx: PositionTemplateContext) {
	const schemas = buildPositionPageSchemas(ctx);

	return renderElectionTemplatePage({
		context: {
			templateType: 'position',
			placeSlug: ctx.placeSlug,
			raceSlug: ctx.raceSlug ?? ctx.race?.slug,
		},
		sectionOverrides: buildPositionSectionOverrides(ctx),
		tokens: buildPositionTokens(ctx),
		schemas: [
			schemas.positionPageSchema,
			schemas.jobPostingSchema || undefined,
			schemas.breadcrumbSchema,
			schemas.faqSchema,
		],
	});
}
