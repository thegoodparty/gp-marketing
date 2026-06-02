import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const policySection = {
  title: 'Policy Section',
  name: 'policySection',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('InsertPage'),
  fields: [
    {
      title: 'Section Label',
      name: 'field_policySectionLabel',
      type: 'field_policySectionLabel',
    },
    {
      title: 'Section Title',
      name: 'field_policySectionTitle',
      type: 'field_policySectionTitle',
    },
    {
      title: 'Policy Text',
      name: 'block_policyText',
      type: 'block_policyText',
    },
  ],
  preview: {
    select: {
      title: 'field_policySectionLabel',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('InsertPage'),
      fallback: {},
    }
         const title = resolveValue('title', policySection.preview.select, x);         const subtitle = resolveValue('subtitle', policySection.preview.select, x);         const media = resolveValue('media', policySection.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}