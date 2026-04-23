import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_usMapBlock = {
  title: 'US Map Block',
  name: 'component_usMapBlock',
  type: 'object',
  icon: getIcon('Map'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
      group: 'summaryInfo',
    },
    {
      title: 'Map States',
      name: 'usMapBlockContent',
      type: 'usMapBlockContent',
      group: 'usMapBlockContent',
    },
    {
      title: 'Design Settings',
      name: 'usMapBlockDesignSettings',
      type: 'usMapBlockDesignSettings',
      group: 'usMapBlockDesignSettings',
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
      icon: getIcon('Map'),
      fallback: {
        previewTitle: 'summaryInfo.field_title',
        previewSubTitle: '*US Map Block',
        title: 'US Map Block',
      },
    }
         const title = resolveValue("title", component_usMapBlock.preview.select, x);         const subtitle = resolveValue("subtitle", component_usMapBlock.preview.select, x);         const media = resolveValue("media", component_usMapBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Map States',
      name: 'usMapBlockContent',
      icon: getIcon('Map'),
    },
    {
      title: 'Design Settings',
      name: 'usMapBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}
