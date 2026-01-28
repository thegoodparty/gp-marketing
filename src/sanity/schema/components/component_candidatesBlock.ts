import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_candidatesBlock = {
	title: 'Candidates Block',
	name: 'component_candidatesBlock',
	type: 'object',
	icon: getIcon('Users'),
	fields: [
		{
			title: 'Header',
			name: 'candidatesBlockHeader',
			type: 'summaryInfo',
			group: 'candidatesBlockHeader',
		},
		{
			title: 'Filter Settings',
			name: 'candidatesBlockFilterSettings',
			type: 'object',
			fields: [
				{
					title: 'Enable Filters',
					name: 'field_enableFilters',
					type: 'boolean',
					initialValue: false,
					description: 'Enable filtering and pagination for candidates',
				},
			],
			group: 'candidatesBlockFilterSettings',
		},
		{
			title: 'Optional Button',
			name: 'candidatesBlockOptionalButton',
			type: 'ctaActionWithShared',
			description: 'Optional CTA button (only shown when filters are disabled)',
			group: 'candidatesBlockOptionalButton',
		},
		{
			title: 'Design Settings',
			name: 'candidatesBlockDesignSettings',
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
					initialValue: 'cream',
				},
			],
			group: 'candidatesBlockDesignSettings',
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
			title: 'candidatesBlockHeader.field_title',
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Users'),
				fallback: {
					previewTitle: 'candidatesBlockHeader.field_title',
					previewSubTitle: '*Candidates Block',
					title: 'Candidates Block',
				},
			};
			const title = resolveValue('title', component_candidatesBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_candidatesBlock.preview.select, x);
			const media = resolveValue('media', component_candidatesBlock.preview.select, x);
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
			name: 'candidatesBlockHeader',
			icon: getIcon('TextFont'),
		},
		{
			title: 'Filter Settings',
			name: 'candidatesBlockFilterSettings',
			icon: getIcon('Filter'),
		},
		{
			title: 'Optional Button',
			name: 'candidatesBlockOptionalButton',
			icon: getIcon('Rocket'),
		},
		{
			title: 'Design Settings',
			name: 'candidatesBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
