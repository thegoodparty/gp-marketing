import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const FEATURED_CANDIDATES_DEFAULT_HEADING = 'Featured candidates and representatives';

export const FEATURED_CANDIDATES_DEFAULT_CALLOUT =
	'This voter guide was built by GoodParty.org, a public benefit corporation that helps independents run for office, win elections, and serve their local communities. The Heart & Star badge marks candidates and officials who have signed the GoodParty.org Pledge to serve people, not political parties or big money.';

export const component_featuredCandidatesBlock = {
	title: 'Featured Candidates Block',
	name: 'component_featuredCandidatesBlock',
	type: 'object',
	icon: getIcon('Users'),
	description:
		'A carousel of up to eight people from the page\'s own location, read live from election data: candidates in its upcoming races, the people who currently hold its offices, or both. Pledged people lead. Built for the Location templates; it renders nothing on pages that do not supply the data.',
	fields: [
		{
			title: 'Heading',
			name: 'field_heading',
			type: 'string',
			group: 'content',
			description: `Defaults to "${FEATURED_CANDIDATES_DEFAULT_HEADING}". Location tokens such as [location] work here.`,
		},
		{
			title: 'Pledge Callout',
			name: 'featuredCandidatesBlockCallout',
			type: 'object',
			group: 'content',
			options: { collapsed: false, columns: 1 },
			fields: [
				{
					title: 'Show Callout',
					name: 'field_showCallout',
					type: 'boolean',
					initialValue: true,
					description: 'The blue box under the heading that explains the Heart & Star badge.',
				},
				{
					title: 'Callout Text',
					name: 'block_calloutText',
					type: 'block_summaryText',
					description: `Defaults to: "${FEATURED_CANDIDATES_DEFAULT_CALLOUT}" Add a link on "GoodParty.org Pledge" once the pledge page exists.`,
				},
			],
		},
		{
			title: 'Design Settings',
			name: 'featuredCandidatesBlockDesignSettings',
			type: 'object',
			group: 'featuredCandidatesBlockDesignSettings',
			fields: [
				{
					title: 'Who To Feature',
					name: 'field_featuredPeople',
					type: 'string',
					description: 'Which people from the page\'s location fill the carousel. Not shown on the page.',
					options: {
						list: [
							{ title: 'Candidates and representatives', value: 'both' },
							{ title: 'Candidates only', value: 'candidates' },
							{ title: 'Representatives only', value: 'representatives' },
						],
						layout: 'radio',
					},
					initialValue: 'both',
				},
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
				icon: getIcon('Users'),
				fallback: {
					title: 'Featured Candidates Block',
				},
			};
			const title = resolveValue('title', component_featuredCandidatesBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_featuredCandidatesBlock.preview.select, x);
			const media = resolveValue('media', component_featuredCandidatesBlock.preview.select, x);
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
			name: 'featuredCandidatesBlockDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
