/**
 * Fetches representative and edge-case content slugs from Sanity at E2E test
 * setup time. Results are cached for the lifetime of the test process so the
 * ~7 parallel queries only run once per test run.
 *
 * Queries hit the public Sanity CDN — no token required for the production
 * dataset. Override the dataset via SANITY_TEST_DATASET if needed.
 */

const PROJECT_ID = '3rbseux7';
const DATASET = process.env['SANITY_TEST_DATASET'] ?? 'production';
const API_VERSION = '2025-10-08';

async function queryCdn<T>(groq: string): Promise<T | null> {
	try {
		const url = `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;
		const res = await fetch(url, { headers: { Accept: 'application/json' } });
		if (!res.ok) return null;
		const body = (await res.json()) as { result: T };
		return body.result ?? null;
	} catch {
		return null;
	}
}

export type SanityFixtures = {
	/** Most recently updated article — exercises the "live" content path. */
	articleSlugRecent: string | null;
	/** Oldest article — most stable content; used for visual regression baselines. */
	articleSlugOldest: string | null;
	/** Article with the longest title — tests headline overflow/truncation. */
	articleSlugLongestTitle: string | null;
	/** Article missing a featured image — guards against image null-crash. */
	articleSlugNoImage: string | null;
	/** One blog section/category slug. */
	categorySlug: string | null;
	/** One blog tag/topic slug. */
	topicSlug: string | null;
	/** One glossary term slug. */
	glossaryTermSlug: string | null;
	/** A non-special landing page slug (excludes elections/candidates/profile). */
	landingPageSlug: string | null;
};

let cached: SanityFixtures | null = null;

export async function getSanityFixtures(): Promise<SanityFixtures> {
	if (cached) return cached;

	const [recent, oldest, longest, noImage, category, topic, glossaryTerm, landing] = await Promise.all([
		queryCdn<string>(
			`*[_type == "article" && defined(editorialOverview.field_slug)] | order(_updatedAt desc)[0].editorialOverview.field_slug`,
		),
		queryCdn<string>(
			`*[_type == "article" && defined(editorialOverview.field_slug)] | order(_createdAt asc)[0].editorialOverview.field_slug`,
		),
		queryCdn<string>(
			`*[_type == "article" && defined(editorialOverview.field_slug)] | order(length(editorialOverview.field_editorialTitle) desc)[0].editorialOverview.field_slug`,
		),
		queryCdn<string>(
			`*[_type == "article" && defined(editorialOverview.field_slug) && !defined(editorialAssets.img_featuredImage)][0].editorialOverview.field_slug`,
		),
		queryCdn<string>(
			`*[_type == "categories" && defined(tagOverview.field_slug)][0].tagOverview.field_slug`,
		),
		queryCdn<string>(
			`*[_type == "topics" && defined(tagOverview.field_slug)][0].tagOverview.field_slug`,
		),
		queryCdn<string>(
			`*[_type == "glossary" && defined(glossaryTermOverview.field_slug)][0].glossaryTermOverview.field_slug`,
		),
		// Exclude the three known-special landing page slugs that have their own named routes.
		queryCdn<string>(
			`*[_type == "goodpartyOrg_landingPages" && defined(detailPageOverviewNoHero.field_slug) && !(detailPageOverviewNoHero.field_slug in ["elections","candidates","profile"])][0].detailPageOverviewNoHero.field_slug`,
		),
	]);

	cached = {
		articleSlugRecent: recent,
		articleSlugOldest: oldest,
		articleSlugLongestTitle: longest,
		articleSlugNoImage: noImage,
		categorySlug: category,
		topicSlug: topic,
		glossaryTermSlug: glossaryTerm,
		landingPageSlug: landing,
	};

	return cached;
}
