
const PRIMARY_SITE = 'primaryWebsite';

export const contentFilterPaths = {};
export const slugPaths = {};
export const slugMap = {};
export const staticMap = {};
export type SiteTypes = 'primaryWebsite_home';

export async function getNamespaceLink(href: { _type?: string; _ref?: string }): Promise<string | undefined>;
export async function getNamespaceLink(type: string, id: string): Promise<string | undefined>;
export async function getNamespaceLink(type: string | { _type?: string; _ref?: string }, id?: string): Promise<string | undefined> {
	const href = typeof type === 'string' ? { _type: type, _ref: id } : type;

	return getSiteLink(PRIMARY_SITE, href);
}
function getSiteLink(PRIMARY_SITE: string, href: { _type?: string; _ref?: string; }): string | PromiseLike<string | undefined> | undefined {
    throw new Error('Function not implemented.');
}

