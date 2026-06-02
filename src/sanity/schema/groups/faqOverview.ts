import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const faqOverview = {
  title: 'FAQ',
  name: 'faqOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('QuestionAnswering'),
  fields: [
    {
      title: 'Question',
      name: 'field_question',
      type: 'field_question',
    },
    {
      title: 'Answer',
      name: 'block_answer',
      type: 'block_answer',
    },
  ],
  preview: {
    select: {
      title: 'field_question',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('QuestionAnswering'),
      fallback: {},
    }
         const title = resolveValue('title', faqOverview.preview.select, x);         const subtitle = resolveValue('subtitle', faqOverview.preview.select, x);         const media = resolveValue('media', faqOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}