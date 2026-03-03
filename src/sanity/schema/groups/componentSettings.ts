import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const componentSettings = {
  title: 'Component Settings',
  name: 'componentSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Settings'),
  fields: [
    {
      title: 'Anchor ID',
      name: 'field_anchorId',
      type: 'field_anchorId',
    },
  ],
  preview: {
    select: {
      title: 'field_anchorId',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Settings'),
      fallback: {},
    }
         const title = resolveValue("title", componentSettings.preview.select, x);         const subtitle = resolveValue("subtitle", componentSettings.preview.select, x);         const media = resolveValue("media", componentSettings.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}