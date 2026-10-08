/**
 * Which pages record a LogRocket session. Dependency-free so it can be unit tested
 * without a DOM. Everything under /elections (the index, state, county, city and
 * subplace location pages, and their position and candidates pages) plus the
 * /people profiles. Nothing else on the site records.
 */
export function isLogRocketPath(pathname: string | null | undefined): boolean {
	if (!pathname) return false;
	const withoutQuery = pathname.split('?')[0] ?? '';
	const path = withoutQuery.replace(/\/+$/, '').toLowerCase();
	return path === '/elections' || path.startsWith('/elections/') || path.startsWith('/people/');
}
