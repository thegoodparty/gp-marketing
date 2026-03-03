import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const goodPartyOrgPledgeDesignSettings = {
	title: 'GoodParty.org Pledge Design Settings',
	name: 'goodPartyOrgPledgeDesignSettings',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('ColorPalette'),
	fields: [
		{
			title: 'Icon Color',
			name: 'field_iconColor6ColorsWhiteMixed',
			type: 'field_iconColor6ColorsWhiteMixed',
		},
		{
			title: 'Block Color',
			name: 'field_blockColorCreamMidnight',
			type: 'field_blockColorCreamMidnight',
		},
	],
	preview: {
		select: {
			title: 'field_blockColorCreamMidnight',
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('ColorPalette'),
				fallback: {},
			};
			const title = resolveValue('title', goodPartyOrgPledgeDesignSettings.preview.select, x);
			const subtitle = resolveValue('subtitle', goodPartyOrgPledgeDesignSettings.preview.select, x);
			const media = resolveValue('media', goodPartyOrgPledgeDesignSettings.preview.select, x);
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
};
