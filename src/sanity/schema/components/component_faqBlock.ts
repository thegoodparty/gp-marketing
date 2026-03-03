import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_faqBlock = {
  title: 'FAQ Block',
  name: 'component_faqBlock',
  description: 'For displaying FAQs',
  type: 'object',
  icon: getIcon('QuestionAnswering'),
  fields: [
    {
      title: 'Text',
      name: 'summaryInfo',
      type: 'summaryInfo',
      group: 'summaryInfo',
    },
    {
      title: 'Content',
      name: 'faQsContentCollection',
      type: 'faQsContentCollection',
      group: 'faQsContentCollection',
    },
    {
      title: 'Design Settings',
      name: 'faqBlockDesignSettings',
      type: 'faqBlockDesignSettings',
      group: 'faqBlockDesignSettings',
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
        previewSubTitle: '*FAQ Block',
        title: 'FAQ Block',
      },
    }
         const title = resolveValue("title", component_faqBlock.preview.select, x);         const subtitle = resolveValue("subtitle", component_faqBlock.preview.select, x);         const media = resolveValue("media", component_faqBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Text',
      name: 'summaryInfo',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Content',
      name: 'faQsContentCollection',
      icon: getIcon('TableOfContents'),
    },
    {
      title: 'Design Settings',
      name: 'faqBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}