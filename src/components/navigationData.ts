import { goodpartyOrg_navigationQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';

/**
 * The Navigation singleton: menu, header buttons and the promo banner. The layout reads it
 * once and hands it to the header and the banner, so neither is an async component that
 * would hold up the page's HTML on its own fetch.
 */
export async function fetchNavigation() {
	try {
		return await sanityFetch({ query: goodpartyOrg_navigationQuery, tags: ['goodpartyOrg_navigation'] });
	} catch (error) {
		console.error('Navigation fetch failed; rendering the header without it.', error);
		return null;
	}
}

export type NavigationData = Awaited<ReturnType<typeof fetchNavigation>>;
