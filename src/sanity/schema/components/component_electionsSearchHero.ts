import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_electionsSearchHero = {
	title: 'Elections Search Hero',
	name: 'component_electionsSearchHero',
	description: 'Hero section for Elections Pages with search functionality and state selection dropdown.',
	type: 'object',
	icon: getIcon('Search'),
	fields: [
		{
			title: 'Logo Settings',
			name: 'logoSettings',
			type: 'object',
			fields: [
				{
					title: 'Show Logo',
					name: 'showLogo',
					type: 'boolean',
					initialValue: true,
				},
				{
					title: 'Logo Image',
					name: 'img_logoImage',
					type: 'image',
					description: 'Optional custom logo image. If not provided, default logo will be used.',
				},
			],
			group: 'logoSettings',
		},
		{
			title: 'Content',
			name: 'electionsSearchHeroContent',
			type: 'object',
			fields: [
				{
					title: 'Header Text',
					name: 'field_headerText',
					type: 'string',
					description: 'The main headline text for the hero section.',
				},
				{
					title: 'Body Copy',
					name: 'field_bodyCopy',
					type: 'text',
					rows: 3,
					description: 'Supporting text below the headline.',
				},
			],
			group: 'electionsSearchHeroContent',
		},
		{
			title: 'CTA',
			name: 'ctaAction',
			type: 'object',
			fields: [
				{
					title: 'Button Text',
					name: 'field_buttonText',
					type: 'string',
					initialValue: 'Search',
				},
				{
					title: 'Button Style',
					name: 'field_buttonStyle',
					type: 'string',
					options: {
						list: [
							{ title: 'Primary', value: 'primary' },
							{ title: 'Secondary', value: 'secondary' },
							{ title: 'Outline', value: 'outline' },
						],
					},
					initialValue: 'primary',
				},
			],
			group: 'ctaAction',
		},
		{
			title: 'Design Settings',
			name: 'electionsSearchHeroDesignSettings',
			type: 'object',
			fields: [
				{
					title: 'Background Image',
					name: 'img_backgroundImage',
					type: 'image',
					description: 'Background image for the hero section.',
				},
				{
					title: 'Background Color',
					name: 'field_backgroundColor',
					type: 'string',
					options: {
						list: [
							{ title: 'Cream', value: 'cream' },
							{ title: 'Midnight', value: 'midnight' },
						],
					},
					initialValue: 'midnight',
					description: 'Background color when no background image is provided.',
				},
			],
			group: 'electionsSearchHeroDesignSettings',
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
			title: 'electionsSearchHeroContent.field_headerText',
			_type: '_type',
			media: 'electionsSearchHeroDesignSettings.img_backgroundImage',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Search'),
				fallback: {
					previewTitle: 'electionsSearchHeroContent.field_headerText',
					previewSubTitle: '*Elections Search Hero',
					previewMedia: 'electionsSearchHeroDesignSettings.img_backgroundImage',
					title: 'Elections Search Hero',
				},
			};
			const title = resolveValue('title', component_electionsSearchHero.preview.select, x);
			const subtitle = resolveValue('subtitle', component_electionsSearchHero.preview.select, x);
			const media = resolveValue('media', component_electionsSearchHero.preview.select, x);
			return handleReplacements(
				{
					title: infer.singletonTitle || title || undefined,
					subtitle: subtitle ? subtitle : infer.fallback['title'],
					media: media || infer.icon,
				},
				x as Record<string, any>,
				infer.fallback,
			);
		},
	},
	groups: [
		{
			title: 'Logo Settings',
			name: 'logoSettings',
			icon: getIcon('Image'),
		},
		{
			title: 'Content',
			name: 'electionsSearchHeroContent',
			icon: getIcon('TextFont'),
		},
		{
			title: 'CTA',
			name: 'ctaAction',
			icon: getIcon('Rocket'),
		},
		{
			title: 'Design Settings',
			name: 'electionsSearchHeroDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
