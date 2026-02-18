import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const goodpartyOrg_embedPage = {
	title: 'Embed Pages',
	name: 'goodpartyOrg_embedPage',
	type: 'document',
	icon: getIcon('Link'),
	fields: [
		{
			title: 'Overview',
			name: 'embedPageOverview',
			type: 'embedPageOverview',
			group: 'embedPageOverview',
		},
		{
			title: 'SEO',
			name: 'seo',
			type: 'seo',
			group: 'seo',
		},
	],
	preview: {
		select: {
			title: 'embedPageOverview.field_pageName',
			_type: '_type',
			subtitle: 'embedPageOverview.field_embedUrl',
			media: 'seo.img_openGraphImage',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Link'),
				fallback: {
					previewTitle: 'embedPageOverview.field_pageName',
					previewSubTitle: 'embedPageOverview.field_embedUrl',
					previewMedia: 'seo.img_openGraphImage',
					title: 'Embed Pages',
				},
			};
			const title = resolveValue('title', goodpartyOrg_embedPage.preview.select, x);
			const subtitle = resolveValue('subtitle', goodpartyOrg_embedPage.preview.select, x);
			const media = resolveValue('media', goodpartyOrg_embedPage.preview.select, x);
			return handleReplacements(
				{
					title: (infer.singletonTitle as string) || (title as string) || undefined,
					subtitle: (subtitle as string) ? (subtitle as string) : (infer.fallback as Record<string, string>)['title'],
					media: (media as string) || infer.icon,
				},
				x,
				infer.fallback as Record<string, unknown>,
			);
		},
	},
	groups: [
		{
			title: 'Overview',
			name: 'embedPageOverview',
			icon: getIcon('Link'),
		},
		{
			title: 'SEO',
			name: 'seo',
			icon: getIcon('Search'),
		},
	],
	options: {
		pathParams: {
			slug: 'embedPageOverview.field_slug',
		},
		channels: {
			goodpartyOrg: '/embed/:slug',
		},
		documentSlugs: [
			{
				slugField: 'embedPageOverview.field_slug',
				slugSources: ['embedPageOverview.field_pageName'],
			},
		],
		single: false,
	},
};
