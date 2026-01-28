import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const goodPartyOrgPledgeItems = {
	title: 'GoodParty.org Pledge Items',
	name: 'goodPartyOrgPledgeItems',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Grid'),
	fields: [
		{
			title: 'Pledge Cards',
			name: 'list_pledgeCards',
			type: 'list_pledgeCards',
		},
	],
	preview: {
		select: {
			list: 'list_pledgeCards',
		},
		prepare: x => {
			const infer = {
				name: 'Pledge Cards',
				singletonTitle: null,
				icon: getIcon('Grid'),
				fallback: {},
			};
			const title = resolveValue('title', goodPartyOrgPledgeItems.preview.select, x);
			const subtitle = resolveValue('subtitle', goodPartyOrgPledgeItems.preview.select, x);
			const media = resolveValue('media', goodPartyOrgPledgeItems.preview.select, x);
			return handleReplacements(
				{
					title: infer.singletonTitle || title || infer.name,
					subtitle: subtitle || (x.list?.length && x.list.length === 1 ? '1 item' : x.list?.length > 0 ? `${x.list.length} items` : 'No items'),
					media: media || infer.icon,
				},
				x,
				infer.fallback,
			);
		},
	},
};
