import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_locationLandingPageHero = {
	title: 'Location Landing Page Hero',
	name: 'component_locationLandingPageHero',
	type: 'object',
	icon: getIcon('MapPin'),
	fields: [
		{
			title: 'Content',
			name: 'locationLandingPageHeroContent',
			type: 'object',
			fields: [
				{
					title: 'Body Copy',
					name: 'field_bodyCopy',
					type: 'text',
					description: 'Static copy that references location level (state, county, or city). Location names are populated dynamically from the URL.',
				},
				{
					title: 'Search Placeholder',
					name: 'field_searchPlaceholder',
					type: 'string',
					description: 'Placeholder text for the search input (defaults to "Search elections by county and city")',
				},
			],
			group: 'locationLandingPageHeroContent',
		},
		{
			title: 'Design Settings',
			name: 'locationLandingPageHeroDesignSettings',
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
			],
			group: 'locationLandingPageHeroDesignSettings',
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
			_type: '_type',
			bodyCopy: 'locationLandingPageHeroContent.field_bodyCopy',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('MapPin'),
				fallback: {
					previewTitle: '*Location Landing Page Hero',
					previewSubTitle: '*Location-specific hero with search',
					title: 'Location Landing Page Hero',
				},
			};
			const title = resolveValue('title', component_locationLandingPageHero.preview.select, x);
			const subtitle = resolveValue('subtitle', component_locationLandingPageHero.preview.select, x);
			const media = resolveValue('media', component_locationLandingPageHero.preview.select, x);
			return handleReplacements(
				{
					title: infer.singletonTitle || title || undefined,
					subtitle: x.bodyCopy ? String(x.bodyCopy).slice(0, 60) + '...' : infer.fallback['previewSubTitle'],
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
			name: 'locationLandingPageHeroContent',
			icon: getIcon('Text'),
		},
		{
			title: 'Design Settings',
			name: 'locationLandingPageHeroDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
