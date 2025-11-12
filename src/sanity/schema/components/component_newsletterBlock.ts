import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_newsletterBlock = {
  title: 'Newsletter Block',
  name: 'component_newsletterBlock',
  type: 'object',
  icon: getIcon('Email'),
  fields: [
    {
      title: 'Text',
      name: 'newsletterBlockMessaging',
      type: 'newsletterBlockMessaging',
      group: 'newsletterBlockMessaging',
    },
    {
      title: 'Form',
      name: 'newsletterBlockForm',
      type: 'newsletterBlockForm',
      group: 'newsletterBlockForm',
    },
    {
      title: 'Design Settings',
      name: 'newsletterBlockDesignSettings',
      type: 'newsletterBlockDesignSettings',
      group: 'newsletterBlockDesignSettings',
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
      title: 'newsletterBlockMessaging.field_title',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('TextFont'),
      fallback: {
        previewTitle: 'newsletterBlockMessaging.field_title',
        previewSubTitle: '*Newsletter Block',
        title: 'Newsletter Block',
      },
    }
         const title = resolveValue("title", component_newsletterBlock.preview.select, x);         const subtitle = resolveValue("subtitle", component_newsletterBlock.preview.select, x);         const media = resolveValue("media", component_newsletterBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'newsletterBlockMessaging',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Form',
      name: 'newsletterBlockForm',
      icon: getIcon('DataBase'),
    },
    {
      title: 'Design Settings',
      name: 'newsletterBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}