/**
 * The standalone candidate listing pages (`…/position/<office>/candidates`) are
 * retired: the position page carries the candidate list itself (strategy doc
 * "Programmatic Overhaul Pt. 2", decided August 2026; Emily, 2026-10-06). Each
 * listing URL redirects permanently to its position page, one rule per URL
 * depth. They were never in the sitemap, and nothing on the redesigned pages
 * links to them, so the redirect is for people and crawlers arriving on old
 * links. The route files behind them are removed in a follow-up once the
 * position page batch has merged, because that batch edits the same files.
 */
const POSITION_PAGE_DEPTHS = [
	'/elections/:state/position/:positionSlug',
	'/elections/:state/:county/position/:positionSlug',
	'/elections/:state/:county/:city/position/:positionSlug',
	'/elections/:state/:county/:city/:subplace/position/:positionSlug',
] as const;

export const candidatesPageRedirects = POSITION_PAGE_DEPTHS.map(positionPath => ({
	source: `${positionPath}/candidates`,
	destination: positionPath,
	permanent: true as const,
}));
