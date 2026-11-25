import { toPlainText } from '../../utils/toPlainText.ts';
import { getIcon } from '../../utils/getIcon.tsx';

// The direct answer at the top of a blog article. Kept separate from the callout and the CTAs:
// its text is per article, and it renders as plain server-side text with no heading tag.
export const articleSummary = {
	title: 'Article Summary',
	name: 'articleSummary',
	type: 'object',
	icon: getIcon('Document'),
	description: 'The direct answer to the question this article targets, in two to four sentences. Place it first in the article body.',
	fields: [
		{
			title: 'Label',
			name: 'field_label',
			type: 'string',
			description: 'Optional short label shown above the summary, for example "Quick answer". Leave blank for no label.',
			validation: (Rule: any) => Rule.max(80),
		},
		{
			title: 'Summary',
			name: 'block_summaryBody',
			type: 'block_articleSummaryText',
			validation: (Rule: any) => Rule.required().min(1),
		},
	],
	preview: {
		select: {
			label: 'field_label',
			body: 'block_summaryBody',
		},
		prepare: (x: { label?: string; body?: Parameters<typeof toPlainText>[0] }) => {
			const firstBlock = Array.isArray(x.body) ? x.body.find(b => b?._type === 'block') : undefined;
			const firstLine = firstBlock ? toPlainText([firstBlock]) : '';
			return {
				title: firstLine || 'Article Summary',
				subtitle: x.label ? `Article Summary: ${x.label}` : 'Article Summary',
				media: getIcon('Document'),
			};
		},
	},
};
