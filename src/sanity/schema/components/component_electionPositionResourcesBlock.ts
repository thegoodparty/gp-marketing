import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

const cardFields = (defaults: { label: string; title: string; description: string; icon: string; color: string; buttonText: string }) => [
	{
		title: 'Label',
		name: 'field_label',
		type: 'field_label',
		description: 'The short tag beside the icon, e.g. "Guide".',
		initialValue: defaults.label,
	},
	{
		title: 'Heading',
		name: 'field_title',
		type: 'field_title',
		description: 'Supports position tokens, e.g. "How to Run for [office name]".',
		initialValue: defaults.title,
	},
	{
		title: 'Description',
		name: 'field_description',
		type: 'text',
		rows: 3,
		description: 'One or two sentences. Supports position tokens.',
		initialValue: defaults.description,
	},
	{
		title: 'Icon',
		name: 'field_icon',
		type: 'field_icon',
		initialValue: defaults.icon,
	},
	{
		title: 'Card Color',
		name: 'field_componentColor6ColorsInverse',
		type: 'field_componentColor6ColorsInverse',
		initialValue: defaults.color,
	},
	{
		title: 'Button',
		name: 'button',
		type: 'button',
		initialValue: { field_buttonText: defaults.buttonText, field_ctaActionWithShared: 'External' },
	},
];

export const component_electionPositionResourcesBlock = {
	title: 'Election Position Resources Block',
	name: 'component_electionPositionResourcesBlock',
	description:
		'The three "Campaign guides and resources" cards on position pages: the how-to-run guide for this office, the campaign playbook e-book, and free support. The guide card\'s link is chosen per page from the office; everything else is edited here.',
	type: 'object',
	icon: getIcon('Rocket'),
	fields: [
		{
			title: 'Guide Card',
			name: 'guideCard',
			type: 'object',
			group: 'guideCard',
			description:
				'On position pages the button links to the "how to run" article for that office automatically, chosen from marketing\'s blog article matrix. The link set here is only used on pages that are not position pages.',
			fields: cardFields({
				label: 'Guide',
				title: 'How to Run for [office name]',
				description:
					'A step-by-step guide to running for [office name] as an independent candidate - from deciding to run to election night.',
				icon: 'book-open',
				color: 'Waxflower',
				buttonText: 'Read the guide',
			}),
		},
		{
			title: 'E-book Card',
			name: 'ebookCard',
			type: 'object',
			group: 'ebookCard',
			fields: cardFields({
				label: 'E-book',
				title: '2026 Political Campaign Playbook',
				description: 'Your guide to launching a local campaign in 2026, with advice from winning candidates across the country.',
				icon: 'book-open',
				color: 'Lavender',
				buttonText: 'Read the guide',
			}),
		},
		{
			title: 'Support Card',
			name: 'supportCard',
			type: 'object',
			group: 'supportCard',
			fields: cardFields({
				label: 'Free support',
				title: 'Get free training and support',
				description: "Free coaching and training from our team and candidates who've run and won.",
				icon: 'headset',
				color: 'BrightYellow',
				buttonText: 'Connect with us',
			}),
		},
		{
			title: 'Design Settings',
			name: 'electionPositionResourcesBlockDesignSettings',
			type: 'object',
			group: 'electionPositionResourcesBlockDesignSettings',
			fields: [
				{
					title: 'Background Color',
					name: 'field_blockColorCreamMidnight',
					type: 'field_blockColorCreamMidnight',
				},
			],
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
			title: 'guideCard.field_title',
			_type: '_type',
		},
		prepare: (x: Record<string, unknown>) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Rocket'),
				fallback: {
					previewTitle: 'guideCard.field_title',
					previewSubTitle: '*Election Position Resources Block',
					title: 'Election Position Resources Block',
				},
			};
			const title = resolveValue('title', component_electionPositionResourcesBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_electionPositionResourcesBlock.preview.select, x);
			const media = resolveValue('media', component_electionPositionResourcesBlock.preview.select, x);
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
			title: 'Guide Card',
			name: 'guideCard',
			icon: getIcon('Rocket'),
		},
		{
			title: 'E-book Card',
			name: 'ebookCard',
			icon: getIcon('Rocket'),
		},
		{
			title: 'Support Card',
			name: 'supportCard',
			icon: getIcon('Rocket'),
		},
		{
			title: 'Design Settings',
			name: 'electionPositionResourcesBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
