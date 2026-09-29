import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_electionsSearchHero = {
	title: 'Elections Search Hero',
	name: 'component_electionsSearchHero',
	description: 'Hero for the Elections page: a headline, a city or county search, and a carousel of photos with quotes.',
	type: 'object',
	icon: getIcon('Search'),
	fields: [
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
					description: 'Label on the search button. The search itself works the same as the Elections Near You Block.',
					initialValue: 'Search',
				},
			],
			group: 'ctaAction',
		},
		{
			title: 'Carousel Slides',
			name: 'list_slides',
			type: 'array',
			description:
				'Photos with a quote card, shown beside the search. Add as many as you like; with none the hero shows the text and search alone.',
			of: [
				{
					title: 'Slide',
					name: 'slide',
					type: 'object',
					fields: [
						{
							title: 'Photo',
							name: 'img_photo',
							type: 'image',
							description: 'Shown as a large square. A slide with no photo is skipped.',
							options: { hotspot: true },
							validation: (R: any) => R.required(),
						},
						{
							title: 'Quote',
							name: 'field_quote',
							type: 'text',
							rows: 3,
							description: 'Short. About two or three lines fit on the card.',
						},
						{
							title: 'Quote By',
							name: 'ref_quoteBy',
							type: 'ref_quoteBy',
							description: 'Supplies the name, title, and small photo on the quote card.',
						},
					],
					preview: {
						select: {
							title: 'ref_quoteBy.personOverview.field_personName',
							organisation: 'ref_quoteBy.organisationOverview.field_organisationName',
							subtitle: 'field_quote',
							media: 'img_photo',
						},
						prepare: (x: Record<string, unknown>) => ({
							title: (x['title'] as string | undefined) || (x['organisation'] as string | undefined) || 'Slide',
							subtitle: x['subtitle'] as string | undefined,
							media: x['media'],
						}),
					},
				},
			],
			group: 'carousel',
		},
		{
			title: 'Design Settings',
			name: 'electionsSearchHeroDesignSettings',
			type: 'object',
			fields: [
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
					initialValue: 'cream',
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
			media: 'list_slides.0.img_photo',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Search'),
				fallback: {
					previewTitle: 'electionsSearchHeroContent.field_headerText',
					previewSubTitle: '*Elections Search Hero',
					previewMedia: 'list_slides.0.img_photo',
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
			title: 'Carousel',
			name: 'carousel',
			icon: getIcon('Image'),
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
