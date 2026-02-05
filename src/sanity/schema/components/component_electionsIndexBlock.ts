import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_electionsIndexBlock = {
	title: 'Elections Index Block',
	name: 'component_electionsIndexBlock',
	type: 'object',
	icon: getIcon('List'),
	fields: [
		{
			title: 'Header',
			name: 'electionsIndexBlockHeader',
			type: 'summaryInfo',
			group: 'electionsIndexBlockHeader',
		},
		{
			title: 'Design Settings',
			name: 'electionsIndexBlockDesignSettings',
			type: 'object',
			fields: [
				{
					title: 'Background Color',
					name: 'field_blockColorCreamMidnight',
					type: 'string',
					options: {
						list: [
							{ title: 'Cream', value: 'cream' },
							{ title: 'Midnight', value: 'midnight' },
						],
					},
					initialValue: 'midnight',
				},
				{
					title: 'Show Search',
					name: 'field_showSearch',
					type: 'boolean',
					description: 'Show the search input field',
					initialValue: true,
				},
				{
					title: 'Search Placeholder',
					name: 'field_searchPlaceholder',
					type: 'string',
					description: 'Placeholder text for the search input',
					initialValue: 'Search by county or municipality',
				},
				{
					title: 'Initial Display Count',
					name: 'field_initialDisplayCount',
					type: 'number',
					description: 'Number of items to show before "Show more"',
					initialValue: 24,
				},
				{
					title: 'CTA Button Label',
					name: 'field_ctaLabel',
					type: 'string',
					description: 'Label for the CTA button (default: "Browse CTA")',
					initialValue: 'Browse CTA',
				},
			],
			group: 'electionsIndexBlockDesignSettings',
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			type: 'componentSettings',
			group: 'componentSettings',
		},
	],
	preview: {
		select: {
			title: 'electionsIndexBlockHeader.field_title',
			_type: '_type',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('List'),
				fallback: {
					previewTitle: 'electionsIndexBlockHeader.field_title',
					previewSubTitle: '*Elections Index Block',
					title: 'Elections Index Block',
				},
			};
			const title = resolveValue('title', component_electionsIndexBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_electionsIndexBlock.preview.select, x);
			const media = resolveValue('media', component_electionsIndexBlock.preview.select, x);
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
			title: 'Header',
			name: 'electionsIndexBlockHeader',
			icon: getIcon('TextFont'),
		},
		{
			title: 'Design Settings',
			name: 'electionsIndexBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
