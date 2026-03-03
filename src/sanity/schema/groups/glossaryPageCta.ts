import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const glossaryPageCta = {
	title: 'Glossary Page CTA',
	name: 'glossaryPageCta',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	description:
		'This sets the CTA displayed on this ‘All Glossary Terms’ page, and also all individual Terms pages. It can be overridden on individual pages if needed.',
	icon: getIcon('Rocket'),
	fields: [
		{
			title: 'Shared CTA',
			name: 'ref_sharedCta',
			type: 'ref_sharedCta',
		},
		{
			title: 'Color',
			name: 'field_componentColor6ColorsInverse',
			type: 'field_componentColor6ColorsInverse',
		},
	],
	preview: {
		select: {
			ref: 'ref_sharedCta._ref',
			type: 'ref_sharedCta._type',
			cTAs: 'ref_sharedCta.field_ctaInternalName',
		},
		prepare: x => {
			const infer = {
				name: 'Shared CTA',
				singletonTitle: null,
				icon: getIcon('Rocket'),
				fallback: {},
			};
			const vtype = x.type;
			const title = resolveValue('title', glossaryPageCta.preview.select, x);
			const subtitle = resolveValue('subtitle', glossaryPageCta.preview.select, x);
			const media = resolveValue('media', glossaryPageCta.preview.select, x);
			const restitle = vtype in x ? x[vtype] : title;
			return handleReplacements(
				{
					title: infer.singletonTitle || restitle || infer.name,
					subtitle: subtitle ? subtitle : infer.fallback['title'],
					media: media || infer.icon,
				},
				x,
				infer.fallback,
			);
		},
	},
};
