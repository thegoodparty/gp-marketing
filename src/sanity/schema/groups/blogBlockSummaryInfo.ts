import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const blogBlockSummaryInfo = {
  title: 'Blog Block Summary Info',
  name: 'blogBlockSummaryInfo',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  description: "Use these fields to override the default title and 'see all' button.",
  icon: getIcon('TextFont'),
  fields: [
    {
      title: 'Overline',
      name: 'field_label',
      type: 'field_label',
    },
    {
      title: 'Heading',
      name: 'field_title',
      type: 'field_title',
    },
    {
      title: 'Body Text',
      name: 'block_summaryText',
      type: 'block_summaryText',
    },
    {
      title: 'Buttons',
      name: 'list_buttons',
      type: 'list_buttons',
    },
  ],
  preview: {
    select: {
      title: 'field_label',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('TextFont'),
      fallback: {},
    }
         const title = resolveValue("title", blogBlockSummaryInfo.preview.select, x);         const subtitle = resolveValue("subtitle", blogBlockSummaryInfo.preview.select, x);         const media = resolveValue("media", blogBlockSummaryInfo.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}