import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_featuresBlock = {
  title: 'Features Block',
  name: 'component_featuresBlock',
  type: 'object',
  icon: getIcon('Star'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
      group: 'summaryInfo',
    },
    {
      title: 'Features',
      name: 'featuresBlockContent',
      type: 'featuresBlockContent',
      group: 'featuresBlockContent',
    },
    {
      title: 'Design Settings',
      name: 'featureBlockDesignSettings',
      type: 'featureBlockDesignSettings',
      group: 'featureBlockDesignSettings',
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
      icon: getIcon('TextFont'),
      fallback: {
        previewTitle: 'summaryInfo.field_title',
        previewSubTitle: '*Features Block',
        title: 'Features Block',
      },
    }
         const title = resolveValue("title", component_featuresBlock.preview.select, x);         const subtitle = resolveValue("subtitle", component_featuresBlock.preview.select, x);         const media = resolveValue("media", component_featuresBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Features',
      name: 'featuresBlockContent',
      icon: getIcon('Star'),
    },
    {
      title: 'Design Settings',
      name: 'featureBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}