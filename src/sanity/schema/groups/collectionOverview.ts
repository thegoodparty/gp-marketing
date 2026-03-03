import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const collectionOverview = {
  title: 'Collection Overview',
  name: 'collectionOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Home'),
  fields: [
    {
      title: 'Name',
      name: 'field_collectionName',
      type: 'field_collectionName',
    },
  ],
  preview: {
    select: {
      title: 'field_collectionName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {},
    }
         const title = resolveValue("title", collectionOverview.preview.select, x);         const subtitle = resolveValue("subtitle", collectionOverview.preview.select, x);         const media = resolveValue("media", collectionOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}