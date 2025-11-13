import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_teamBlock = {
  title: 'Team Block',
  name: 'component_teamBlock',
  type: 'object',
  icon: getIcon('UserMultiple'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
      group: 'summaryInfo',
    },
    {
      title: 'People',
      name: 'people',
      type: 'people',
      group: 'people',
    },
    {
      title: 'Design Settings',
      name: 'teamBlockDesignSettings',
      type: 'teamBlockDesignSettings',
      group: 'teamBlockDesignSettings',
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
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('TextFont'),
      fallback: {
        previewTitle: '*Team Block',
        title: 'Team Block',
      },
    }
         const title = resolveValue("title", component_teamBlock.preview.select, x);         const subtitle = resolveValue("subtitle", component_teamBlock.preview.select, x);         const media = resolveValue("media", component_teamBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'People',
      name: 'people',
      icon: getIcon('UserMultiple'),
    },
    {
      title: 'Design Settings',
      name: 'teamBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}