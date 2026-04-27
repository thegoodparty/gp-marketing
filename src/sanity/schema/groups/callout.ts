import {toPlainText} from '../../utils/toPlainText.ts';
import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const callout = {
  title: 'Callout',
  name: 'callout',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Bullhorn'),
  fields: [
    {
      title: 'Body Text',
      name: 'block_summaryText',
      type: 'block_summaryText',
    },
  ],
  preview: {
    select: {
      subtitle: 'block_summaryText.0.children.0.text',
    },
    prepare: x => {
const infer = {
      name: 'Summary Text (Inline Links)',
      singletonTitle: null,
      icon: getIcon('Bullhorn'),
      fallback: {
        previewTitle: '*Callout',
        previewSubTitle: 'block_summaryText.0.children.0.text',
        title: 'Callout',
      },
    }
           const title = resolveValue('title', callout.preview.select, x);           const subtitle = resolveValue('subtitle', callout.preview.select, x);           const media = resolveValue('media', callout.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || typeof title === 'string' ? title : Array.isArray(title) ? toPlainText(title) : infer.name,             subtitle: subtitle ? subtitle : infer.fallback['title'],             media: media || infer.icon           }, x, infer.fallback);         },
  },
}