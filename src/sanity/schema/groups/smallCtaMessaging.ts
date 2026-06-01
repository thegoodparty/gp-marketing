import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const smallCtaMessaging = {
  title: 'Small CTA Messaging',
  name: 'smallCtaMessaging',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  description: 'The supporting text to display to users for this Small CTA.',
  icon: getIcon('Quotes'),
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
      icon: getIcon('Quotes'),
      fallback: {},
    }
         const title = resolveValue('title', smallCtaMessaging.preview.select, x);         const subtitle = resolveValue('subtitle', smallCtaMessaging.preview.select, x);         const media = resolveValue('media', smallCtaMessaging.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}