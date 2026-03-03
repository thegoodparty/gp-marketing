import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const ctaCardOne = {
  title: 'CTA Card One',
  name: 'ctaCardOne',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Rocket'),
  fields: [
    {
      title: 'Overline',
      name: 'field_label',
      type: 'field_label',
    },
    {
      title: 'CTA',
      name: 'ctaActionWithShared',
      type: 'ctaActionWithShared',
    },
    {
      title: 'Color',
      name: 'field_componentColor6ColorsInverse',
      type: 'field_componentColor6ColorsInverse',
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
      icon: getIcon('Rocket'),
      fallback: {},
    }
         const title = resolveValue("title", ctaCardOne.preview.select, x);         const subtitle = resolveValue("subtitle", ctaCardOne.preview.select, x);         const media = resolveValue("media", ctaCardOne.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}