import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

// Voter-density (district heat map) section. The map data itself is injected at
// render time from the API (people-api → gp-api → the person view model), so
// this Sanity block only carries an optional heading and standard settings —
// it exists so marketing can position / toggle the map as its own section in the
// page builder rather than having it hard-wired inside the profile content block.
export const component_voterDensityBlock = {
	title: 'Voter Density Map Block',
	name: 'component_voterDensityBlock',
	type: 'object',
	icon: getIcon('Map'),
	fields: [
		{
			title: 'Content',
			name: 'voterDensityBlockContent',
			type: 'object',
			fields: [
				{
					title: 'Headline',
					name: 'field_headline',
					type: 'string',
					description: 'Optional heading shown above the district voter-density map.',
				},
			],
			group: 'voterDensityBlockContent',
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
			title: 'voterDensityBlockContent.field_headline',
			_type: '_type',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Map'),
				fallback: {
					previewTitle: 'voterDensityBlockContent.field_headline',
					previewSubTitle: '*Voter Density Map Block',
					title: 'Voter Density Map Block',
				},
			};
			const title = resolveValue('title', component_voterDensityBlock.preview.select, x);
			const subtitle = resolveValue('subtitle', component_voterDensityBlock.preview.select, x);
			const media = resolveValue('media', component_voterDensityBlock.preview.select, x);
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
			name: 'voterDensityBlockContent',
			icon: getIcon('Text'),
		},
		{
			title: 'Settings',
			name: 'componentSettings',
			icon: getIcon('Settings'),
		},
	],
};
