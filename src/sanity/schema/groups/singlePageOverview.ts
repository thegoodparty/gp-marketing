import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const singlePageOverview = {
  title: 'Single Page Overview',
  name: 'singlePageOverview',
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
      title: 'Page Title',
      name: 'field_pageTitle',
      type: 'field_pageTitle',
    },
    {
      title: 'Summary Description',
      name: 'field_summaryDescription',
      type: 'field_summaryDescription',
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
         const title = resolveValue("title", singlePageOverview.preview.select, x);         const subtitle = resolveValue("subtitle", singlePageOverview.preview.select, x);         const media = resolveValue("media", singlePageOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}