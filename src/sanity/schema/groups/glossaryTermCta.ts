import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const glossaryTermCta = {
	title: 'Glossary Term CTA',
	name: 'glossaryTermCta',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	description:
		'If left blank, this page will inherit the default CTA from the ‘All Glossary Terms’ page. Add a CTA here to override it for this specific page.',
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
			const title = resolveValue('title', glossaryTermCta.preview.select, x);
			const subtitle = resolveValue('subtitle', glossaryTermCta.preview.select, x);
			const media = resolveValue('media', glossaryTermCta.preview.select, x);
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
