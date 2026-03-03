import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const goodpartyOrg_404Page = {
  title: '404 Page',
  name: 'goodpartyOrg_404Page',
  type: 'document',
  icon: getIcon('DataError'),
  fields: [
    {
      title: '404 Error Message',
      name: 'ErrorMessage',
      type: 'ErrorMessage',
    },
  ],
  preview: {
    select: {
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('DataError'),
      fallback: {
        previewTitle: '*404 Page',
        title: '404 Page',
      },
    }
         const title = resolveValue("title", goodpartyOrg_404Page.preview.select, x);         const subtitle = resolveValue("subtitle", goodpartyOrg_404Page.preview.select, x);         const media = resolveValue("media", goodpartyOrg_404Page.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  options: {
    channels: {},
    single: true,
  },
}