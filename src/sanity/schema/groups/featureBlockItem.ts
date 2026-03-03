import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const featureBlockItem = {
  title: 'Feature Block Item',
  name: 'featureBlockItem',
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
      hidden: function (ctx ) { return !['Reference'].includes(ctx.parent?.field_featureOptions) },
    },
    {
      title: 'Custom Feature',
      name: 'customFeature',
      type: 'customFeature',
      hidden: function (ctx ) { return !['Custom'].includes(ctx.parent?.field_featureOptions) },
    },
  ],
  preview: {
    select: {
      title: 'ref_chooseAFeature.featureOverview.field_featureName',
      _type: '_type',
      title1: 'customFeature.field_featureName',
      subtitle: 'ref_chooseAFeature.featureOverview.field_featureDescription',
      subtitle1: 'customFeature.field_featureDescription',
      media: 'ref_chooseAFeature.featureOverview.field_icon',
      media1: 'customFeature.field_icon',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Star'),
      fallback: {
        previewTitle: 'ref_chooseAFeature.featureOverview.field_featureName|customFeature.field_featureName',
        previewSubTitle: 'ref_chooseAFeature.featureOverview.field_featureDescription|customFeature.field_featureDescription',
        previewMedia: 'ref_chooseAFeature.featureOverview.field_icon|customFeature.field_icon',
        title: 'Feature Block Item',
      },
    }
         const title = resolveValue("title", featureBlockItem.preview.select, x);         const subtitle = resolveValue("subtitle", featureBlockItem.preview.select, x);         const media = resolveValue("media", featureBlockItem.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}