import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const component_goodPartyOrgPledge = {
	title: 'GoodParty.org Pledge',
	name: 'component_goodPartyOrgPledge',
	type: 'object',
	icon: getIcon('Heart'),
	fields: [
		{
			title: 'Text',
			name: 'summaryInfo',
			type: 'summaryInfo',
			group: 'summaryInfo',
		},
		{
			title: 'Pledge Cards',
			name: 'goodPartyOrgPledgeItems',
			type: 'goodPartyOrgPledgeItems',
			group: 'goodPartyOrgPledgeItems',
		},
		{
			title: 'Design Settings',
			name: 'goodPartyOrgPledgeDesignSettings',
			type: 'goodPartyOrgPledgeDesignSettings',
			group: 'goodPartyOrgPledgeDesignSettings',
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
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Heart'),
				fallback: {
					previewTitle: 'summaryInfo.field_title',
					previewSubTitle: '*GoodParty.org Pledge',
					title: 'GoodParty.org Pledge',
				},
			};
			const title = resolveValue('title', component_goodPartyOrgPledge.preview.select, x);
			const subtitle = resolveValue('subtitle', component_goodPartyOrgPledge.preview.select, x);
			const media = resolveValue('media', component_goodPartyOrgPledge.preview.select, x);
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
			title: 'Pledge Cards',
			name: 'goodPartyOrgPledgeItems',
			icon: getIcon('Grid'),
		},
		{
			title: 'Design Settings',
			name: 'goodPartyOrgPledgeDesignSettings',
			icon: getIcon('ColorPalette'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
