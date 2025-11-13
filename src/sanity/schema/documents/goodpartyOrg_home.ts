import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const goodpartyOrg_home = {
  title: 'Home',
  name: 'goodpartyOrg_home',
  type: 'document',
  icon: getIcon('Home'),
  fields: [
    {
      title: 'Overview',
      name: 'singlePageOverviewNoHero',
      type: 'singlePageOverviewNoHero',
      group: 'singlePageOverviewNoHero',
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
      title: 'singlePageOverviewNoHero.field_pageName',
      _type: '_type',
      media: 'singlePageOverviewNoHero.img_featuredImage',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {
        previewTitle: 'singlePageOverviewNoHero.field_pageName',
        previewSubTitle: '*Home',
        previewMedia: 'singlePageOverviewNoHero.img_featuredImage',
        title: 'Home',
      },
    }
         const title = resolveValue("title", goodpartyOrg_home.preview.select, x);         const subtitle = resolveValue("subtitle", goodpartyOrg_home.preview.select, x);         const media = resolveValue("media", goodpartyOrg_home.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'singlePageOverviewNoHero',
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
      goodpartyOrg: '/',
    },
    single: true,
  },
}