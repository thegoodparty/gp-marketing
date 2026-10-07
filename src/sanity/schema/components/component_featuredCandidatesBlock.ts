import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const FEATURED_CANDIDATES_DEFAULT_HEADING = 'Candidates and officials who took the GoodParty.org Pledge';

export const FEATURED_CANDIDATES_DEFAULT_BODY =
	'Candidates and elected officials near you who have taken the GoodParty.org Pledge. Read why they\'re running and serving, in their own words.';

export const FEATURED_CANDIDATES_DEFAULT_CALLOUT_TITLE = 'What this symbol means';

export const FEATURED_CANDIDATES_DEFAULT_CALLOUT =
	'Candidates and elected officials with this symbol took the GoodParty.org Pledge, promising to serve people first, independent of both major parties and big-money interests.';

export const FEATURED_CANDIDATES_DEFAULT_PLEDGE_LINK = 'Read the full pledge';

export const component_featuredCandidatesBlock = {
	title: 'Featured Candidates Block',
	name: 'component_featuredCandidatesBlock',
	type: 'object',
	icon: getIcon('Users'),
	description:
		'A carousel of up to eight pledged people on the page\'s ballot, read live from election data: candidates in its upcoming races, the people who currently hold its offices, or both. Only people who took the GoodParty.org Pledge are shown. Built for the Location templates; it renders nothing on pages that do not supply the data.',
	fields: [
		{
			title: 'Heading',
			name: 'field_heading',
			type: 'string',
			group: 'content',
			description: `Defaults to "${FEATURED_CANDIDATES_DEFAULT_HEADING}". Location tokens such as [location] work here.`,
		},
		{
			title: 'Body Copy',
			name: 'field_bodyCopy',
			type: 'text',
			rows: 3,
			group: 'content',
			description: `The paragraph under the heading. Defaults to "${FEATURED_CANDIDATES_DEFAULT_BODY}" Location tokens such as [location] work here, and [count of candidates] becomes the number of pledged people once that figure is available; until then it is left out of the sentence.`,
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
					title: 'Callout Title',
					name: 'field_calloutTitle',
					type: 'string',
					description: `Defaults to "${FEATURED_CANDIDATES_DEFAULT_CALLOUT_TITLE}".`,
				},
				{
					title: 'Callout Text',
					name: 'block_calloutText',
					type: 'block_summaryText',
					description: `Defaults to: "${FEATURED_CANDIDATES_DEFAULT_CALLOUT}" with "GoodParty.org Pledge" in bold.`,
				},
				{
					title: 'Show Pledge Link',
					name: 'field_showPledgeLink',
					type: 'boolean',
					initialValue: true,
					description: 'The link at the end of the callout that opens the pledge pop-up.',
				},
				{
					title: 'Pledge Link Label',
					name: 'field_pledgeLinkLabel',
					type: 'string',
					description: `Defaults to "${FEATURED_CANDIDATES_DEFAULT_PLEDGE_LINK}". Only shown when Show Pledge Link is on.`,
					hidden: (x: any) => x.parent?.field_showPledgeLink === false,
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
					description: 'Which pledged people from the page\'s ballot fill the carousel. Not shown on the page.',
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
