import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_heroWithSubscribe = {
  title: 'Hero With Subscribe',
  name: 'component_heroWithSubscribe',
  description: 'A page header with a large headline, media and a single field form.',
  type: 'object',
  icon: getIcon('OpenPanelFilledBottom'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfoNoButtons',
      type: 'summaryInfoNoButtons',
      group: 'summaryInfoNoButtons',
    },
    {
      title: 'Form',
      name: 'heroSubscribeForm',
      type: 'heroSubscribeForm',
      group: 'heroSubscribeForm',
    },
    {
      title: 'Design Settings',
      name: 'heroDesignSettings',
      type: 'heroDesignSettings',
      group: 'heroDesignSettings',
    },
    {
      title: 'Image',
      name: 'heroImage',
      type: 'heroImage',
      group: 'heroImage',
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
      media: 'heroImage.img_image',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('TextFont'),
      fallback: {
        previewTitle: 'summaryInfo.field_title',
        previewSubTitle: '*Hero With Subscribe Form',
        previewMedia: 'heroImage.img_image',
        title: 'Hero With Subscribe',
      },
    }
         const title = resolveValue("title", component_heroWithSubscribe.preview.select, x);         const subtitle = resolveValue("subtitle", component_heroWithSubscribe.preview.select, x);         const media = resolveValue("media", component_heroWithSubscribe.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfoNoButtons',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Form',
      name: 'heroSubscribeForm',
      icon: getIcon('DataBase'),
    },
    {
      title: 'Design Settings',
      name: 'heroDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Image',
      name: 'heroImage',
      icon: getIcon('Image'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}