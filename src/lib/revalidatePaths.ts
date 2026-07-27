export function isSlugObject(value: unknown): value is { current: string } {
	return value != null && typeof value === 'object' && 'current' in value && typeof (value as { current: unknown }).current === 'string';
}

export function getSlugFromPayload(payload: Record<string, unknown>, path: string): string | undefined {
	const parts = path.split('.');
	let value: unknown = payload;
	for (const part of parts) {
		if (value == null || typeof value !== 'object') return undefined;
		value = (value as Record<string, unknown>)[part];
	}
	if (typeof value === 'string') return value;
	if (isSlugObject(value)) return value.current;
	return undefined;
}

const LLMS_TXT_FEEDING_TYPES = new Set<string>([
	'article',
	'glossary',
	'goodpartyOrg_landingPages',
	'policy',
	'goodpartyOrg_home',
	'goodpartyOrg_allArticles',
	'goodpartyOrg_glossary',
	'goodpartyOrg_contact',
]);

export function shouldRevalidateAllLayouts(_type: string): boolean {
	return _type === 'faq';
}

export function getPathsToRevalidate(_type: string, payload: Record<string, unknown>): string[] {
	const slugPaths: Record<string, string> = {
		article: 'editorialOverview.field_slug',
		categories: 'tagOverview.field_slug',
		topics: 'tagOverview.field_slug',
		glossary: 'glossaryTermOverview.field_slug',
		goodpartyOrg_landingPages: 'detailPageOverviewNoHero.field_slug',
		policy: 'policyOverview.field_slug',
		faq: 'faqOverview.field_slug',
	};

	const slug = slugPaths[_type] ? getSlugFromPayload(payload, slugPaths[_type]) : undefined;

	const pathMap: Record<string, string | string[]> = {
		article: slug ? [`/blog/article/${slug}`, '/blog'] : ['/blog'],
		categories: slug ? [`/blog/section/${slug}`, '/blog'] : ['/blog'],
		topics: slug ? [`/blog/tag/${slug}`, '/blog'] : ['/blog'],
		glossary: slug ? [`/political-terms/${slug}`, '/political-terms'] : ['/political-terms'],
		goodpartyOrg_landingPages: slug ? [`/${slug}`] : ['/'],
		goodpartyOrg_home: ['/'],
		policy: slug ? [`/${slug}`] : ['/'],
		faq: slug ? [`/frequently-asked-questions/${slug}`, '/frequently-asked-questions'] : ['/frequently-asked-questions'],
		goodpartyOrg_contact: ['/contact'],
		goodpartyOrg_navigation: ['/'],
		goodpartyOrg_footer: ['/'],
		goodpartyOrg_allArticles: ['/blog'],
		goodpartyOrg_glossary: ['/political-terms'],
		goodpartyOrg_404Page: ['/'],
		goodpartyOrg_allComponents: ['/all'],
		quoteCollections: ['/elections'],
		goodpartyOrg_globalTemplate: ['/elections', '/candidate'],
		goodpartyOrg_customTemplate: ['/elections', '/candidate'],
	};

	const raw = pathMap[_type];
	const paths = raw ? (Array.isArray(raw) ? [...raw] : [raw]) : ['/'];

	if (LLMS_TXT_FEEDING_TYPES.has(_type) && !paths.includes('/llms.txt')) {
		paths.push('/llms.txt');
	}

	return paths;
}
