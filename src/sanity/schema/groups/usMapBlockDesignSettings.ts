import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const usMapBlockDesignSettings = {
  title: 'Design Settings',
  name: 'usMapBlockDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Default State Color',
      name: 'field_defaultStateColor',
      type: 'field_defaultStateColor',
    },
  ],
  preview: {
    select: {
      title: 'field_defaultStateColor',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ColorPalette'),
      fallback: {},
    }
         const title = resolveValue("title", usMapBlockDesignSettings.preview.select, x);         const subtitle = resolveValue("subtitle", usMapBlockDesignSettings.preview.select, x);         const media = resolveValue("media", usMapBlockDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}
