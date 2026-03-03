import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const faq = {
  title: 'FAQs',
  name: 'faq',
  description: 'A set of frequently asked questions and answers.',
  type: 'document',
  icon: getIcon('QuestionAnswering'),
  fields: [
    {
      title: 'Overview',
      name: 'faqOverview',
      type: 'faqOverview',
      group: 'faqOverview',
    },
    {
      title: 'Tags',
      name: 'generalContentTags',
      type: 'generalContentTags',
      group: 'generalContentTags',
    },
  ],
  preview: {
    select: {
      title: 'faqOverview.field_question',
      _type: '_type',
      subtitle: 'faqOverview.block_answer.0.children.0.text',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('QuestionAnswering'),
      fallback: {
        previewTitle: 'faqOverview.field_question',
        previewSubTitle: 'faqOverview.block_answer.0.children.0.text',
        title: 'FAQs',
      },
    }
         const title = resolveValue("title", faq.preview.select, x);         const subtitle = resolveValue("subtitle", faq.preview.select, x);         const media = resolveValue("media", faq.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'faqOverview',
      icon: getIcon('QuestionAnswering'),
    },
    {
      title: 'Tags',
      name: 'generalContentTags',
      icon: getIcon('Tag'),
    },
  ],
  options: {
    channels: {},
    single: false,
  },
}