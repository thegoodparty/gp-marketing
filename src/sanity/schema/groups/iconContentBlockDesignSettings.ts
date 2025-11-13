import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const iconContentBlockDesignSettings = {
  title: 'Icon Content Block Design Settings',
  name: 'iconContentBlockDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Column Layout',
      name: 'field_columnLayout234Columns',
      type: 'field_columnLayout234Columns',
    },
    {
      title: 'Icon Color',
      name: 'field_iconColor6ColorsWhiteMixed',
      type: 'field_iconColor6ColorsWhiteMixed',
    },
    {
      title: 'Block Color',
      name: 'field_blockColorCreamMidnight',
      type: 'field_blockColorCreamMidnight',
    },
  ],
  preview: {
    select: {
      title: 'field_columnLayout234Columns',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ColorPalette'),
      fallback: {},
    }
         const title = resolveValue("title", iconContentBlockDesignSettings.preview.select, x);         const subtitle = resolveValue("subtitle", iconContentBlockDesignSettings.preview.select, x);         const media = resolveValue("media", iconContentBlockDesignSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}