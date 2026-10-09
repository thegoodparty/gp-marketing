import {
	buildElectionsIndexPageSchema,
	buildElectionsIndexSectionOverrides,
	type ElectionsIndexPageContext,
} from '~/lib/electionsTemplateHelpers';
import { buildElectionsIndexTokens } from '~/lib/electionsIndexTemplates';
import { type FeaturedLocationLevel, type FeaturedPeople, getFeaturedPeople } from '~/lib/featuredCandidates';
import { locationTemplateTypeFromLevel, preloadElectionTemplate, resolveElectionTemplate } from '~/lib/electionTemplates';
import { renderElectionTemplatePage } from '~/lib/renderElectionTemplatePage';

/**
 * The featured-people fetch while it is in flight. It settles rather than
 * rejects, so a route can hold it across its own serial awaits without a
 * failure in that window becoming an unhandled rejection; the failure is
 * carried and thrown where the renderer joins it, exactly where the fetch used
 * to run.
 */
export type FeaturedPeopleInFlight = Promise<PromiseSettledResult<FeaturedPeople>>;

export type ElectionsIndexTemplateContext = ElectionsIndexPageContext & {
	placeSlug: string;
	/**
	 * The featured-people fetch, when the route started it with
	 * `startFeaturedPeople` ahead of its own serial work so the two overlap.
	 * Left out, the fetch starts here, after the route has finished everything else.
	 */
	featuredPeopleInFlight?: FeaturedPeopleInFlight;
};

/**
 * Starts the fetches a location page needs that depend only on its slug and
 * level: the featured people (the longest chain on the page, up to 48 candidacy
 * reads) and the Sanity template. A route calls this as soon as it knows the
 * page will render, before it resolves dates and overlapping offices, so those
 * run alongside the chain instead of ahead of it (docs/elections.md, "What a
 * cold render costs").
 */
export async function startFeaturedPeople(params: { placeSlug: string; locationLevel: FeaturedLocationLevel }): FeaturedPeopleInFlight {
	preloadElectionTemplate(locationTemplateTypeFromLevel(params.locationLevel));
	const [result] = await Promise.allSettled([getFeaturedPeople(params)]);
	return result;
}

async function joinFeaturedPeople(inFlight: FeaturedPeopleInFlight): Promise<FeaturedPeople> {
	const result = await inFlight;
	if (result.status === 'rejected') throw result.reason;
	return result.value;
}

export async function renderElectionsIndexPage(ctx: ElectionsIndexTemplateContext) {
	const { featuredPeopleInFlight, ...pageCtx } = ctx;
	const context = { templateType: locationTemplateTypeFromLevel(ctx.locationLevel), placeSlug: ctx.placeSlug };
	const tokens = buildElectionsIndexTokens(pageCtx);
	// Fetched here rather than in each route so every location page feeds the block.
	// The template reads nothing from election-api, so it resolves alongside the people.
	const [featuredPeople, resolved] = await Promise.all([
		pageCtx.featuredPeople ??
			(featuredPeopleInFlight
				? joinFeaturedPeople(featuredPeopleInFlight)
				: getFeaturedPeople({ placeSlug: ctx.placeSlug, locationLevel: ctx.locationLevel })),
		resolveElectionTemplate(context, { tokens }),
	]);
	return renderElectionTemplatePage({
		context,
		resolved,
		sectionOverrides: buildElectionsIndexSectionOverrides({ ...pageCtx, featuredPeople }),
		tokens,
		schemas: [buildElectionsIndexPageSchema(pageCtx)],
		enableLandingSearch: true,
	});
}
