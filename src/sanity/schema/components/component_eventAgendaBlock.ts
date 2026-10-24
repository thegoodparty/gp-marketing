import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_eventAgendaBlock = {
	title: 'Event Agenda Block',
	name: 'component_eventAgendaBlock',
	type: 'object',
	description: 'An event or webinar section: what to expect on the left, with a button, and an agenda card on the right.',
	icon: getIcon('EventSchedule'),
	fields: [
		{
			title: 'Text',
			name: 'summaryInfo',
			type: 'summaryInfo',
			group: 'summaryInfo',
		},
		{
			title: 'Agenda heading',
			name: 'field_agendaTitle',
			type: 'string',
			initialValue: 'Agenda',
			group: 'agenda',
		},
		{
			title: 'Agenda items',
			name: 'list_agendaItems',
			description: 'One item per part of the session: an icon, a heading, a line of body text and an optional link. Max 12.',
			type: 'array',
			of: [{ title: 'Agenda item', type: 'iconBlockItem' }],
			validation: (Rule: any) => Rule.max(12),
			group: 'agenda',
		},
		{
			title: 'Block Color',
			name: 'field_blockColorCreamMidnight',
			type: 'field_blockColorCreamMidnight',
			group: 'design',
		},
		{
			title: 'Agenda icon color',
			name: 'field_iconColor6ColorsWhiteMixed',
			type: 'field_iconColor6ColorsWhiteMixed',
			group: 'design',
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
			title: 'summaryInfo.field_title',
			subtitle: 'field_agendaTitle',
		},
		prepare: (x: any) => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('EventSchedule'),
				fallback: {
					title: 'Event Agenda Block',
				},
			};
			const title = resolveValue('title', component_eventAgendaBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_eventAgendaBlock.preview.select, x);
			const media = resolveValue('media', component_eventAgendaBlock.preview.select, x);
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
			title: 'Text',
			name: 'summaryInfo',
			icon: getIcon('TextFont'),
		},
		{
			title: 'Agenda',
			name: 'agenda',
			icon: getIcon('EventSchedule'),
		},
		{
			title: 'Design Settings',
			name: 'design',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
