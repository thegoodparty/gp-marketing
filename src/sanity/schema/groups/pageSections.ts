import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const pageSections = {
  title: 'Page Sections',
  name: 'pageSections',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('PageBreak'),
  fields: [
    {
      title: 'Page Sections',
      name: 'list_pageSections',
      type: 'list_pageSections',
    },
  ],
  preview: {
    select: {
      list: 'list_pageSections',
    },
    prepare: x => {
const infer = {
      name: 'Page Sections',
      singletonTitle: null,
      icon: getIcon('PageBreak'),
      fallback: {},
    }
           const title = resolveValue("title", pageSections.preview.select, x);           const subtitle = resolveValue("subtitle", pageSections.preview.select, x);           const media = resolveValue("media", pageSections.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 item" : x.list?.length > 0 ? `${x.list.length} items` : "No items",             media: media || infer.icon           }, x, infer.fallback);         },
  },
}