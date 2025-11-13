import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const ctaOverview = {
  title: 'CTA Overview',
  name: 'ctaOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Promote'),
  fields: [
    {
      title: 'CTA Name (Internal)',
      name: 'field_ctaInternalName',
      type: 'field_ctaInternalName',
    },
    {
      title: 'CTA Note (Internal)',
      name: 'field_ctaInternalNote',
      type: 'field_ctaInternalNote',
    },
  ],
  preview: {
    select: {
      title: 'field_ctaInternalName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Promote'),
      fallback: {},
    }
         const title = resolveValue("title", ctaOverview.preview.select, x);         const subtitle = resolveValue("subtitle", ctaOverview.preview.select, x);         const media = resolveValue("media", ctaOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}