import {
	buildCandidatesPageSchema,
	buildCandidatesSectionOverrides,
	buildCandidatesTokens,
	type PositionPageContext,
} from '~/lib/electionsTemplateHelpers';
import { renderElectionTemplatePage } from '~/lib/renderElectionTemplatePage';
import type { CandidateCard } from '~/ui/CandidatesBlock';

export type CandidatesTemplateContext = PositionPageContext & {
	candidates: CandidateCard[];
	placeSlug?: string;
	raceSlug?: string;
};

export async function renderElectionsCandidatesPage(ctx: CandidatesTemplateContext) {
	return renderElectionTemplatePage({
		context: {
			templateType: 'positionCandidates',
			placeSlug: ctx.placeSlug,
			raceSlug: ctx.raceSlug ?? ctx.race?.slug,
		},
		sectionOverrides: buildCandidatesSectionOverrides(ctx),
		tokens: buildCandidatesTokens(ctx),
		schemas: [buildCandidatesPageSchema(ctx)],
	});
}
