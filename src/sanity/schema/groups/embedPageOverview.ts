import { resolveValue } from "../../utils/resolveValue.ts";
import { handleReplacements } from "../../utils/handleReplacements.ts";
import { getIcon } from "../../utils/getIcon.tsx";

const EMBED_ALLOWED_DOMAINS = ['capture.navattic.com'];

export const embedPageOverview = {
	title: 'Embed Page Overview',
	name: 'embedPageOverview',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Link'),
	fields: [
		{
			title: 'Page Name',
			name: 'field_pageName',
			type: 'field_pageName',
		},
		{
			title: 'Slug',
			name: 'field_slug',
			type: 'field_slug',
		},
		{
			title: 'Embed URL',
			name: 'field_embedUrl',
			type: 'string',
			description: 'The source URL for the embedded experience. Must be from an approved provider (e.g. capture.navattic.com).',
			validation: (Rule) =>
				Rule.required()
					.uri({ scheme: ['https'] })
					.custom((url) => {
						if (!url) return true;
						try {
							const hostname = new URL(url).hostname;
							return EMBED_ALLOWED_DOMAINS.includes(hostname) || 'URL must be from an approved provider.';
						} catch {
							return 'Invalid URL';
						}
					}),
		},
		{
			title: 'Allow Fullscreen',
			name: 'field_allowFullscreen',
			type: 'boolean',
			initialValue: true,
		},
	],
	preview: {
		select: {
			title: 'field_pageName',
			_type: '_type',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Link'),
				fallback: {},
			};
			const title = resolveValue('title', embedPageOverview.preview.select, x);
			const subtitle = resolveValue('subtitle', embedPageOverview.preview.select, x);
			const media = resolveValue('media', embedPageOverview.preview.select, x);
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
};
