import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const downloadOverview = {
  title: 'Download Overview',
  name: 'downloadOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Download'),
  fields: [
    {
      title: 'Name',
      name: 'field_documentName',
      type: 'field_documentName',
    },
    {
      title: 'File',
      name: 'field_file',
      type: 'field_file',
    },
  ],
  preview: {
    select: {
      title: 'field_documentName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Download'),
      fallback: {},
    }
         const title = resolveValue("title", downloadOverview.preview.select, x);         const subtitle = resolveValue("subtitle", downloadOverview.preview.select, x);         const media = resolveValue("media", downloadOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}