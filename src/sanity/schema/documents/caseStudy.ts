import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const caseStudy = {
	title: 'Case Studies',
	name: 'caseStudy',
	description: 'A case study published on the Case Studies page.',
	type: 'document',
	icon: getIcon('Document'),
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
					previewSubTitle: '*Case Study',
					previewMedia: 'editorialAssets.img_featuredImage',
					title: 'Case Studies',
				},
			};
			const title = resolveValue('title', caseStudy.preview.select, x);
			const subtitle = resolveValue('subtitle', caseStudy.preview.select, x);
			const media = resolveValue('media', caseStudy.preview.select, x);
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
			goodpartyOrg: '/case-studies/:slug',
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
