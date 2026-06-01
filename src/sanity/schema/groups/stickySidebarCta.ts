import { getIcon } from '../../utils/getIcon.tsx';

export const stickySidebarCta = {
	title: 'Sticky Sidebar CTA',
	name: 'stickySidebarCta',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Rocket'),
	fields: [
		{
			title: 'Show sticky CTA in sidebar',
			name: 'field_showStickySidebarCta',
			type: 'boolean',
			initialValue: false,
		},
		{
			title: 'CTA',
			name: 'ctaConfig',
			type: 'ctaSection',
			hidden: ({ parent }: { parent?: { field_showStickySidebarCta?: boolean } }) =>
				!parent?.field_showStickySidebarCta,
		},
	],
	preview: {
		prepare: () => ({
			title: 'Sticky Sidebar CTA',
			subtitle: 'Optional sidebar call-to-action',
			media: getIcon('Rocket'),
		}),
	},
};
