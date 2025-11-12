import type { DocumentLocationResolverObject, DocumentLocationResolvers, DocumentResolver } from 'sanity/presentation';

export const routeMap = {
	goodpartyOrg_home: '/',
	goodpartyOrg_allArticles: '/blog',
	articles: '/blog/:articles',
	categories: '/blog/:categories',
	topics: '/blog/:topics',
	goodpartyOrg_glossary: '/political-terms',
	glossary: '/political-terms/:glossary',
	goodpartyOrg_contact: '/contact',
	policy: '/:policy',
	goodpartyOrg_landingPages: '/:goodpartyOrg_landingPages',
	goodpartyOrg_allComponents: '/all',
	goodpartyOrg_404Page: '/not-found',
};

export function isStatic(key: string) {
	if (!key) {
		return false;
	}
	if (!(key in routeMap)) {
		return !key
			.split('/')
			.slice(1)
			.some(x => x.includes(':'));
	}
	return !routeMap[key as keyof typeof routeMap]
		.split('/')
		.slice(1)
		.some(x => x.includes(':'));
}

export function getSlugKey(route: string) {
	return route
		.split('/')
		.slice(1)
		.find(x => x.includes(':'))
		?.replace(':', '');
}

export function getRoute(key: string) {
	if (!key) {
		return undefined;
	}
	if (!(key in routeMap)) {
		return undefined;
	}
	return routeMap[key as keyof typeof routeMap];
}

export function getResolvedRoute(route: string, slug: undefined | string) {
	if (!slug || !route) {
		return undefined;
	}
	const slugKey = getSlugKey(route);
	return route.replace(`:${slugKey}`, slug);
}

export const mainDocuments: DocumentResolver[] = Object.entries(routeMap).map(([type, route]) => {
	if (isStatic(type)) {
		return {
			type,
			route,
		} satisfies DocumentResolver;
	}

	return {
		route,
		filter: `_type == "${type}" && slug.current == $${getSlugKey(route)}`,
	} satisfies DocumentResolver;
});

export const locations: DocumentLocationResolvers = Object.fromEntries(
	Object.entries(routeMap).map(([type, route]) => {
		if (isStatic(type)) {
			const state: DocumentLocationResolverObject = {
				select: {
					name: 'name',
				},
				resolve: value => ({
					locations: [
						{
							title: value?.['name'] || <span style={{ opacity: 0.4 }}>Untitled</span>,
							href: route,
						},
					],
				}),
			};
			return [type, state];
		}
		const slugKey = getSlugKey(route);
		const state: DocumentLocationResolverObject = {
			select: {
				name: 'name',
				slug: 'slug.current',
			},
			resolve: value => {
				if (!value?.['slug']) {
					return {
						tone: 'caution',
						message: 'Enter a slug to enable preview',
					};
				}
				return {
					locations: [
						{
							title: value?.['name'] || <span style={{ opacity: 0.4 }}>Untitled</span>,
							href: route.replace(`:${slugKey}`, value['slug']),
						},
					],
				};
			},
		};
		return [type, state];
	}),
);
