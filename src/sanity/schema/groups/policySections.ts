import {toPlainText} from '../../utils/toPlainText.ts';
import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const policySections = {
  title: 'Policy Content',
  name: 'policySections',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('TextFont'),
  fields: [
    {
      title: 'Policy Text',
      name: 'block_policyText',
      type: 'block_policyText',
    },
  ],
  preview: {
    select: {
      title: 'block_policyText',
    },
    prepare: x => {
const infer = {
      name: 'Policy Text',
      singletonTitle: null,
      icon: getIcon('TextFont'),
      fallback: {},
    }
           const title = resolveValue('title', policySections.preview.select, x);           const subtitle = resolveValue('subtitle', policySections.preview.select, x);           const media = resolveValue('media', policySections.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || typeof title === 'string' ? title : Array.isArray(title) ? toPlainText(title) : infer.name,             subtitle: subtitle ? subtitle : infer.fallback['title'],             media: media || infer.icon           }, x, infer.fallback);         },
  },
}