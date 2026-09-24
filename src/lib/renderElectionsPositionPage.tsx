import {
	buildPositionPageSchemas,
	buildPositionSectionOverrides,
	buildPositionTokens,
	type PositionPageContext,
} from '~/lib/electionsTemplateHelpers';
import { getNearbyOffices } from '~/lib/nearbyOffices';
import { renderElectionTemplatePage } from '~/lib/renderElectionTemplatePage';

export type PositionTemplateContext = PositionPageContext & {
	placeSlug?: string;
	raceSlug?: string;
};

export async function renderElectionsPositionPage(ctx: PositionTemplateContext) {
	const schemas = buildPositionPageSchemas(ctx);
	const raceSlug = ctx.raceSlug ?? ctx.race?.slug;
	const nearbyOffices =
		ctx.nearbyOffices ?? (ctx.placeSlug ? await getNearbyOffices({ placeSlug: ctx.placeSlug, currentRaceSlug: raceSlug }) : []);

	return renderElectionTemplatePage({
		context: {
			templateType: 'position',
			placeSlug: ctx.placeSlug,
			raceSlug,
		},
		sectionOverrides: buildPositionSectionOverrides({ ...ctx, nearbyOffices }),
		tokens: buildPositionTokens(ctx),
		schemas: [schemas.positionPageSchema, schemas.breadcrumbSchema, schemas.faqSchema],
	});
}
