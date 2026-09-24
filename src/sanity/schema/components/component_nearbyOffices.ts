import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_nearbyOffices = {
	title: 'Nearby Offices',
	name: 'component_nearbyOffices',
	type: 'object',
	icon: getIcon('Building'),
	description:
		'Up to eight other positions near the one on this page, read live from election data. Built for the Position template; it renders nothing on pages that do not supply the data.',
	fields: [
		{
			title: 'Heading',
			name: 'field_heading',
			type: 'string',
			description: 'Defaults to "Nearby offices". Location tokens such as [County or City] work here.',
		},
		{
			title: 'Design Settings',
			name: 'nearbyOfficesDesignSettings',
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
			group: 'nearbyOfficesDesignSettings',
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
			title: 'field_heading',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Building'),
				fallback: {
					title: 'Nearby Offices',
				},
			};
			const title = resolveValue('title', component_nearbyOffices.preview.select, x);
			const subtitle = resolveValue('subtitle', component_nearbyOffices.preview.select, x);
			const media = resolveValue('media', component_nearbyOffices.preview.select, x);
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
			title: 'Content',
			name: 'content',
			icon: getIcon('TextFont'),
			default: true,
		},
		{
			title: 'Design Settings',
			name: 'nearbyOfficesDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
