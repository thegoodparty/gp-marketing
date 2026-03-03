import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';

export const highlightedFeature = {
	title: 'Highlighted Feature',
	name: 'highlightedFeature',
	type: 'object',
	options: {
		collapsed: false,
		columns: 1,
	},
	icon: getIcon('Star'),
	fields: [
		{
			title: 'Feature Options',
			name: 'field_featureOptions',
			type: 'field_featureOptions',
		},
		{
			title: 'Choose a Feature',
			name: 'ref_chooseAFeature',
			type: 'ref_chooseAFeature',
			hidden: function (ctx) {
				return !['Reference'].includes(ctx.parent?.field_featureOptions);
			},
		},
		{
			title: 'Custom Feature With Image',
			name: 'customFeatureWithImage',
			type: 'customFeatureWithImage',
			hidden: function (ctx) {
				return !['Custom'].includes(ctx.parent?.field_featureOptions);
			},
		},
		{
			title: 'Show Full Image?',
			name: 'showFullImage',
			type: 'boolean',
			initialValue: false,
		},
	],
	preview: {
		select: {
			title: 'ref_chooseAFeature.featureOverview.field_featureName',
			_type: '_type',
			title1: 'customFeatureWithImage.field_featureName',
			subtitle: 'ref_chooseAFeature.featureOverview.field_featureDescription',
			subtitle1: 'customFeatureWithImage.field_featureDescription',
			media: 'ref_chooseAFeature.featureAssets.img_featureImage',
			media1: 'customFeatureWithImage.img_featureImage',
		},
		prepare: x => {
			const infer = {
				singletonTitle: null,
				icon: getIcon('Star'),
				fallback: {
					previewTitle: 'ref_chooseAFeature.featureOverview.field_featureName|customFeatureWithImage.field_featureName',
					previewSubTitle: 'ref_chooseAFeature.featureOverview.field_featureDescription|customFeatureWithImage.field_featureDescription',
					previewMedia: 'ref_chooseAFeature.featureAssets.img_featureImage|customFeatureWithImage.img_featureImage',
					title: 'Highlighted Feature',
				},
			};
			const title = resolveValue('title', highlightedFeature.preview.select, x);
			const subtitle = resolveValue('subtitle', highlightedFeature.preview.select, x);
			const media = resolveValue('media', highlightedFeature.preview.select, x);
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
