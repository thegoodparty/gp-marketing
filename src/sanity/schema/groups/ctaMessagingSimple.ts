import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const ctaMessagingSimple = {
  title: 'CTA Messaging Simple',
  name: 'ctaMessagingSimple',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  description: 'The supporting text to display to users for this CTA.',
  icon: getIcon('TextFont'),
  fields: [
    {
      title: 'Heading',
      name: 'field_title',
      type: 'field_title',
    },
    {
      title: 'Body Text',
      name: 'block_summaryText',
      type: 'block_summaryText',
    },
  ],
  preview: {
    select: {
      title: 'field_title',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('TextFont'),
      fallback: {},
    }
         const title = resolveValue('title', ctaMessagingSimple.preview.select, x);         const subtitle = resolveValue('subtitle', ctaMessagingSimple.preview.select, x);         const media = resolveValue('media', ctaMessagingSimple.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}