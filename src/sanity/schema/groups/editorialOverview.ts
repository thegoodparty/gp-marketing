import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const editorialOverview = {
  title: 'Editorial Overview',
  name: 'editorialOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Home'),
  fields: [
    {
      title: 'Title',
      name: 'field_editorialTitle',
      type: 'field_editorialTitle',
    },
    {
      title: 'Slug',
      name: 'field_slug',
      type: 'field_slug',
    },
    {
      title: 'Author',
      name: 'ref_author',
      type: 'ref_author',
    },
    {
      title: 'Published Date',
      name: 'field_publishedDate',
      type: 'field_publishedDate',
    },
  ],
  preview: {
    select: {
      title: 'field_editorialTitle',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {},
    }
         const title = resolveValue("title", editorialOverview.preview.select, x);         const subtitle = resolveValue("subtitle", editorialOverview.preview.select, x);         const media = resolveValue("media", editorialOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}