import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const goodpartyOrg_allArticles = {
  title: 'Blog',
  name: 'goodpartyOrg_allArticles',
  type: 'document',
  icon: getIcon('Blog'),
  fields: [
    {
      title: 'Overview',
      name: 'singlePageOverview',
      type: 'singlePageOverview',
      group: 'singlePageOverview',
    },
    {
      title: 'Page Sections',
      name: 'pageSections',
      type: 'pageSections',
      group: 'pageSections',
    },
    {
      title: 'SEO',
      name: 'seo',
      type: 'seo',
      group: 'seo',
    },
  ],
  preview: {
    select: {
      title: 'singlePageOverview.field_pageName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {
        previewTitle: 'singlePageOverview.field_pageName',
        previewSubTitle: '*Blog',
        title: 'Blog',
      },
    }
         const title = resolveValue('title', goodpartyOrg_allArticles.preview.select, x);         const subtitle = resolveValue('subtitle', goodpartyOrg_allArticles.preview.select, x);         const media = resolveValue('media', goodpartyOrg_allArticles.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'singlePageOverview',
      icon: getIcon('Home'),
    },
    {
      title: 'Page Sections',
      name: 'pageSections',
      icon: getIcon('PageBreak'),
    },
    {
      title: 'SEO',
      name: 'seo',
      icon: getIcon('Search'),
    },
  ],
  options: {
    channels: {
      goodpartyOrg: '/blog',
    },
    single: true,
  },
}