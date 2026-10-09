import {
	buildPositionPageSchemas,
	buildPositionSectionOverrides,
	buildPositionTokens,
	type PositionPageContext,
} from '~/lib/electionsTemplateHelpers';
import { loadPositionOfficeholders } from '~/lib/positionOfficeholders';
import { resolveHowToRunGuide } from '~/lib/howToRunGuide';
import { getNearbyOffices } from '~/lib/nearbyOffices';
import { renderElectionTemplatePage } from '~/lib/renderElectionTemplatePage';
import { articleTitleBySlugQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';

export type PositionTemplateContext = PositionPageContext & {
	placeSlug?: string;
	raceSlug?: string;
};

export async function renderElectionsPositionPage(input: PositionTemplateContext) {
	const raceSlug = input.raceSlug ?? input.race?.slug;
	// Every position route renders through here, so the content block's
	// officeholder rows are loaded once, in one place, rather than in each route.
	// The three reads are independent of each other, so they run side by side.
	const [officeholders, nearbyOffices, guideTitle] = await Promise.all([
		input.officeholders ??
			loadPositionOfficeholders({
				positionId: input.race?.positionId,
				placeSlug: input.placeSlug,
				// Only election-api's own normalised name can match its officeholder rows;
				// a race without one gets the single seat its position id answers for.
				positionName: input.race?.normalizedPositionName,
				raceSlug,
			}),
		input.nearbyOffices ?? (input.placeSlug ? getNearbyOffices({ placeSlug: input.placeSlug, currentRaceSlug: raceSlug }) : []),
		loadGuideTitle(input),
	]);
	const ctx: PositionTemplateContext = { ...input, officeholders };
	const schemas = buildPositionPageSchemas(ctx);

	return renderElectionTemplatePage({
		context: {
			templateType: 'position',
			placeSlug: ctx.placeSlug,
			raceSlug,
		},
		sectionOverrides: buildPositionSectionOverrides({ ...ctx, nearbyOffices, guideTitle }),
		tokens: buildPositionTokens(ctx),
		schemas: [schemas.positionPageSchema, schemas.breadcrumbSchema, schemas.faqSchema],
	});
}

/**
 * The how-to-run article's own title for the resources block's guide card. The
 * matrix picks the article by office type, so its title reads properly where the
 * editor heading's "[office name]" token printed the raw office name (Emily,
 * 2026-10-06). A miss or an error leaves the title unset and the card falls
 * back to the editor copy rather than failing the page.
 */
async function loadGuideTitle(ctx: PositionTemplateContext): Promise<string | null> {
	const slug = resolveHowToRunGuide({ officeName: ctx.officeName, race: ctx.race }).href.split('/').pop();
	if (!slug) return null;
	try {
		const article = await sanityFetch({ query: articleTitleBySlugQuery, params: { slug }, tags: ['article'] });
		return article?.title?.trim() || null;
	} catch {
		return null;
	}
}
