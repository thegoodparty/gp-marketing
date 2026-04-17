import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const detailPageOverviewNoHero = {
  title: 'Detail Page Overview (No Hero)',
  name: 'detailPageOverviewNoHero',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Home'),
  fields: [
    {
      title: 'Page Name',
      name: 'field_pageName',
      type: 'field_pageName',
    },
    {
      title: 'Slug',
      name: 'field_slug',
      type: 'field_slug',
    },
  ],
  preview: {
    select: {
      title: 'field_pageName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {},
    }
         const title = resolveValue('title', detailPageOverviewNoHero.preview.select, x);         const subtitle = resolveValue('subtitle', detailPageOverviewNoHero.preview.select, x);         const media = resolveValue('media', detailPageOverviewNoHero.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}