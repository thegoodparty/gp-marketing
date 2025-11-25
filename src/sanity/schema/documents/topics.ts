import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const topics = {
	title: 'Blog Topics',
	name: 'topics',
	description: 'A broader tag for an article.',
	type: 'document',
	icon: getIcon('Tag'),
	fields: [
		{
			title: 'Overview',
			name: 'tagOverview',
			type: 'tagOverview',
			group: 'tagOverview',
		},
		{
			title: 'Content',
			name: 'featuredBlogBlockContent',
			type: 'featuredBlogBlockContent',
			group: 'featuredBlogBlockContent',
		},
		{
			title: 'Page Sections',
			name: 'pageSections',
			type: 'pageSections',
			group: 'pageSections',
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
			title: 'tagOverview.field_name',
			_type: '_type',
			media: 'seo.img_openGraphImage',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Tag'),
				fallback: {
					previewTitle: 'tagOverview.field_name',
					previewSubTitle: '*Blog Topic',
					previewMedia: 'seo.img_openGraphImage',
					title: 'Blog Topics',
				},
			};
			const title = resolveValue('title', topics.preview.select, x);
			const subtitle = resolveValue('subtitle', topics.preview.select, x);
			const media = resolveValue('media', topics.preview.select, x);
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
			name: 'tagOverview',
			icon: getIcon('Tag'),
		},
		{
			title: 'Content',
			name: 'featuredBlogBlockContent',
			icon: getIcon('Blog'),
		},
		{
			title: 'Page Sections',
			name: 'pageSections',
			icon: getIcon('PageBreak'),
		},
		{
			title: 'SEO',
			name: 'seo',
			icon: getIcon('Search'),
		},
	],
	options: {
		pathParams: {
			slug: 'tagOverview.field_slug',
		},
		channels: {
			goodpartyOrg: '/blog/tag/:slug',
		},
		documentSlugs: [
			{
				slugField: 'tagOverview.field_slug',
				slugSources: ['tagOverview.field_name'],
			},
		],
		single: false,
	},
};
