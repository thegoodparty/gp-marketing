import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const download = {
  title: 'Downloads',
  name: 'download',
  description: 'A section for storing and accessing files.',
  type: 'document',
  icon: getIcon('Download'),
  fields: [
    {
      title: 'Overview',
      name: 'downloadOverview',
      type: 'downloadOverview',
    },
  ],
  preview: {
    select: {
      title: 'downloadOverview.field_documentName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Download'),
      fallback: {
        previewTitle: 'downloadOverview.field_documentName',
        previewSubTitle: '*Download',
        title: 'Downloads',
      },
    }
         const title = resolveValue("title", download.preview.select, x);         const subtitle = resolveValue("subtitle", download.preview.select, x);         const media = resolveValue("media", download.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  options: {
    channels: {},
    single: false,
  },
}