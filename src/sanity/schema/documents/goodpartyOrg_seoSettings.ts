import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const goodpartyOrg_seoSettings = {
  title: 'SEO Settings',
  name: 'goodpartyOrg_seoSettings',
  type: 'document',
  icon: getIcon('SearchLocate'),
  fields: [
    {
      title: 'SEO Settings',
      name: 'websiteSeoSettings',
      type: 'websiteSeoSettings',
    },
  ],
  preview: {
    select: {
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('SearchLocate'),
      fallback: {
        previewTitle: '*SEO Settings',
        title: 'SEO Settings',
      },
    }
         const title = resolveValue("title", goodpartyOrg_seoSettings.preview.select, x);         const subtitle = resolveValue("subtitle", goodpartyOrg_seoSettings.preview.select, x);         const media = resolveValue("media", goodpartyOrg_seoSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  options: {
    channels: {},
    single: true,
  },
}