import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const article = {
	title: 'Articles',
	name: 'article',
	description: 'A written piece published on a platform.',
	type: 'document',
	icon: getIcon('Blog'),
	fields: [
		{
			title: 'Overview',
			name: 'editorialOverview',
			type: 'editorialOverview',
			group: 'editorialOverview',
		},
		{
			title: 'Tags',
			name: 'editorialContentTags',
			type: 'editorialContentTags',
			group: 'editorialContentTags',
		},
		{
			title: 'Assets',
			name: 'editorialAssets',
			type: 'editorialAssets',
			group: 'editorialAssets',
		},
		{
			title: 'Design Settings',
			name: 'articleDesignSettings',
			type: 'articleDesignSettings',
			group: 'articleDesignSettings',
		},
		{
			title: 'Content Sections',
			name: 'contentSections',
			type: 'contentSections',
			group: 'contentSections',
		},
		{
			title: 'CTA',
			name: 'ctaSection',
			type: 'ctaSection',
			group: 'ctaSection',
		},
		{
			title: 'Related Articles',
			name: 'relatedArticles',
			type: 'relatedArticles',
			group: 'relatedArticles',
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
			title: 'editorialOverview.field_editorialTitle',
			_type: '_type',
			media: 'editorialAssets.img_featuredImage',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Home'),
				fallback: {
					previewTitle: 'editorialOverview.field_editorialTitle',
					previewSubTitle: '*Article',
					previewMedia: 'editorialAssets.img_featuredImage',
					title: 'Articles',
				},
			};
			const title = resolveValue('title', article.preview.select, x);
			const subtitle = resolveValue('subtitle', article.preview.select, x);
			const media = resolveValue('media', article.preview.select, x);
			return handleReplacements(
				{
					title: infer.singletonTitle || title || undefined,
					subtitle: subtitle ? subtitle : infer.fallback['title'],
					media: media || infer.icon,
				},
				x,
				infer.fallback,
			);
		},
	},
	groups: [
		{
			title: 'Overview',
			name: 'editorialOverview',
			icon: getIcon('Home'),
		},
		{
			title: 'Tags',
			name: 'editorialContentTags',
			icon: getIcon('Tag'),
		},
		{
			title: 'Assets',
			name: 'editorialAssets',
			icon: getIcon('ImageCopy'),
		},
		{
			title: 'Design Settings',
			name: 'articleDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Content Sections',
			name: 'contentSections',
			icon: getIcon('InsertPage'),
		},
		{
			title: 'CTA',
			name: 'ctaSection',
			icon: getIcon('Rocket'),
		},
		{
			title: 'Related Articles',
			name: 'relatedArticles',
			icon: getIcon('ChartRelationship'),
		},
		{
			title: 'SEO',
			name: 'seo',
			icon: getIcon('Search'),
		},
	],
	options: {
		pathParams: {
			slug: 'editorialOverview.field_slug',
		},
		channels: {
      goodpartyOrg: '/blog/article/:slug',
		},
		documentSlugs: [
			{
				slugField: 'editorialOverview.field_slug',
				slugSources: ['editorialOverview.field_editorialTitle'],
			},
		],
		single: false,
	},
};
