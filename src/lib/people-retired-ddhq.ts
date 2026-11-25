import { RETIRED_DDHQ_GONE, RETIRED_DDHQ_REDIRECTS } from '~/lib/people-retired-ddhq.data';

/**
 * The DDHQ-only candidate profiles gp-data-platform #982 retired on Oct 7, 2026
 * with no survivor. The /people resolver forwards every other retired id along
 * its merge chain, but these have nothing to forward to and fell through to 404
 * (about 27,900 URLs; SEO ticket wi-20261030-001). The data team's per-URL
 * export (ClickUp DATA-2674) carries John's call for each one: an office page
 * where the race could be matched, otherwise gone. This answers from that export
 * so Google drops the URL on its next crawl instead of re-fetching a 404.
 *
 * Keyed on the whole slug Google holds, not the 8-hex id suffix alone. The
 * suffix is 32 bits and the live resolver matches on it by itself, so with
 * ~600,000 live ids and ~28,000 retired ones a few live profiles share a suffix
 * with a retired one by chance; a suffix-only match here would answer those live
 * profiles with a 410 before the route ever saw them. The name part makes the
 * key specific to the retired page.
 */
export type RetiredDdhqAnswer = { kind: 'redirect'; destination: string } | { kind: 'gone' };

const PEOPLE_PREFIX = '/people/';

let goneSlugs: Set<string> | null = null;

const isGone = (slug: string): boolean => {
	goneSlugs ??= new Set(RETIRED_DDHQ_GONE.split('\n').filter(Boolean));
	return goneSlugs.has(slug);
};

/**
 * The office page a retired race slug forwards to. The old-app office route
 * (`/elections/position/<race slug>`) already looks the race up and 308s to the
 * canonical position page, supplying the county a city slug lacks, so this
 * reuses that rather than guessing the county here.
 */
export const retiredDdhqRedirectDestination = (raceSlug: string): string => `/elections/position/${raceSlug}`;

export const retiredDdhqAnswer = (pathname: string): RetiredDdhqAnswer | null => {
	if (!pathname.startsWith(PEOPLE_PREFIX)) return null;
	const slug = pathname.slice(PEOPLE_PREFIX.length).replace(/\/+$/, '').toLowerCase();
	if (!slug || slug.includes('/')) return null;

	const raceSlug = Object.hasOwn(RETIRED_DDHQ_REDIRECTS, slug) ? RETIRED_DDHQ_REDIRECTS[slug] : undefined;
	if (raceSlug) return { kind: 'redirect', destination: retiredDdhqRedirectDestination(raceSlug) };
	if (isGone(slug)) return { kind: 'gone' };
	return null;
};
