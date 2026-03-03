import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const features = {
  title: 'Features',
  name: 'features',
  type: 'document',
  icon: getIcon('Star'),
  fields: [
    {
      title: 'Overview',
      name: 'featureOverview',
      type: 'featureOverview',
      group: 'featureOverview',
    },
    {
      title: 'Assets',
      name: 'featureAssets',
      type: 'featureAssets',
      group: 'featureAssets',
    },
  ],
  preview: {
    select: {
      title: 'featureOverview.field_featureName',
      _type: '_type',
      subtitle: 'featureOverview.field_featureDescription',
      media: 'featureAssets.img_featureImage',
      media1: 'featureOverview.field_icon',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {
        previewTitle: 'featureOverview.field_featureName',
        previewSubTitle: 'featureOverview.field_featureDescription',
        previewMedia: 'featureAssets.img_featureImage|featureOverview.field_icon',
        title: 'Features',
      },
    }
         const title = resolveValue("title", features.preview.select, x);         const subtitle = resolveValue("subtitle", features.preview.select, x);         const media = resolveValue("media", features.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'featureOverview',
      icon: getIcon('Home'),
    },
    {
      title: 'Assets',
      name: 'featureAssets',
      icon: getIcon('Image'),
    },
  ],
  options: {
    channels: {},
    single: false,
  },
}