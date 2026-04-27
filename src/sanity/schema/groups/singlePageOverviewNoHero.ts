import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const singlePageOverviewNoHero = {
  title: 'Single Page Overview (No Hero Info)',
  name: 'singlePageOverviewNoHero',
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
      title: 'Featured Image',
      name: 'img_featuredImage',
      type: 'img_featuredImage',
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
         const title = resolveValue('title', singlePageOverviewNoHero.preview.select, x);         const subtitle = resolveValue('subtitle', singlePageOverviewNoHero.preview.select, x);         const media = resolveValue('media', singlePageOverviewNoHero.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}