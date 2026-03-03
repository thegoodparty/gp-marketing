import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const goodpartyOrg_landingPages = {
  title: 'Pages',
  name: 'goodpartyOrg_landingPages',
  type: 'document',
  icon: getIcon('DocumentBlank'),
  fields: [
    {
      title: 'Overview',
      name: 'detailPageOverviewNoHero',
      type: 'detailPageOverviewNoHero',
      group: 'detailPageOverviewNoHero',
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
      title: 'detailPageOverviewNoHero.field_pageName',
      _type: '_type',
      subtitle: 'pageSections.list_pageSections.0.summaryInfo.field_title',
      media: 'pageSections.list_pageSections.0.heroImage.img_image',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {
        previewTitle: 'detailPageOverviewNoHero.field_pageName',
        previewSubTitle: 'pageSections.list_pageSections.0.summaryInfo.field_title',
        previewMedia: 'pageSections.list_pageSections.0.heroImage.img_image',
        title: 'Pages',
      },
    }
         const title = resolveValue("title", goodpartyOrg_landingPages.preview.select, x);         const subtitle = resolveValue("subtitle", goodpartyOrg_landingPages.preview.select, x);         const media = resolveValue("media", goodpartyOrg_landingPages.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'detailPageOverviewNoHero',
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
    pathParams: {
      slug: 'detailPageOverviewNoHero.field_slug',
    },
    channels: {
      goodpartyOrg: '/:slug',
    },
    documentSlugs: [
      {
        slugField: 'detailPageOverviewNoHero.field_slug',
        slugSources: [
          'detailPageOverviewNoHero.field_pageName',
        ],
      },
    ],
    single: false,
  },
}