import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const websiteSeoSettings = {
  title: 'Website SEO Settings',
  name: 'websiteSeoSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('SearchLocate'),
  fields: [
    {
      title: 'Default Meta Title',
      name: 'field_defaultMetaTitle',
      type: 'field_defaultMetaTitle',
    },
    {
      title: 'Default Open Graph Image',
      name: 'img_defaultOpenGraphImage',
      type: 'img_defaultOpenGraphImage',
    },
  ],
  preview: {
    select: {
      title: 'field_defaultMetaTitle',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('SearchLocate'),
      fallback: {},
    }
         const title = resolveValue("title", websiteSeoSettings.preview.select, x);         const subtitle = resolveValue("subtitle", websiteSeoSettings.preview.select, x);         const media = resolveValue("media", websiteSeoSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}