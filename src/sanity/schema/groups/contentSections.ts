import {toPlainText} from '../../utils/toPlainText.ts';
import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const contentSections = {
  title: 'Content Sections',
  name: 'contentSections',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('InsertPage'),
  fields: [
    {
      title: 'Content Sections',
      name: 'block_editorialContentSections',
      type: 'block_editorialContentSections',
    },
  ],
  preview: {
    select: {
      title: 'block_editorialContentSections',
    },
    prepare: x => {
const infer = {
      name: 'Editorial Content Sections',
      singletonTitle: null,
      icon: getIcon('InsertPage'),
      fallback: {},
    }
           const title = resolveValue('title', contentSections.preview.select, x);           const subtitle = resolveValue('subtitle', contentSections.preview.select, x);           const media = resolveValue('media', contentSections.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || typeof title === 'string' ? title : Array.isArray(title) ? toPlainText(title) : infer.name,             subtitle: subtitle ? subtitle : infer.fallback['title'],             media: media || infer.icon           }, x, infer.fallback);         },
  },
}