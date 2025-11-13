import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_tabbedImageBlock = {
  title: 'Tabbed Image Block',
  name: 'component_tabbedImageBlock',
  type: 'object',
  icon: getIcon('Grid'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
      group: 'summaryInfo',
    },
    {
      title: 'Content',
      name: 'tabbedImageBlockItems',
      type: 'tabbedImageBlockItems',
      group: 'tabbedImageBlockItems',
    },
    {
      title: 'Design Settings',
      name: 'tabbedImageBlockDesignSettings',
      type: 'tabbedImageBlockDesignSettings',
      group: 'tabbedImageBlockDesignSettings',
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
        previewSubTitle: '*Tabbed Image Block',
        title: 'Tabbed Image Block',
      },
    }
         const title = resolveValue("title", component_tabbedImageBlock.preview.select, x);         const subtitle = resolveValue("subtitle", component_tabbedImageBlock.preview.select, x);         const media = resolveValue("media", component_tabbedImageBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Content',
      name: 'tabbedImageBlockItems',
      icon: getIcon('Grid'),
    },
    {
      title: 'Design Settings',
      name: 'tabbedImageBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}