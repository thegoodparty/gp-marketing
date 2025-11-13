import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const inlineEmailLink = {
  title: 'Inline Email Link',
  name: 'inlineEmailLink',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Email'),
  fields: [
    {
      title: 'Email Link',
      name: 'field_emailLink',
      type: 'field_emailLink',
    },
  ],
  preview: {
    select: {
      title: 'field_emailLink',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Email'),
      fallback: {},
    }
         const title = resolveValue("title", inlineEmailLink.preview.select, x);         const subtitle = resolveValue("subtitle", inlineEmailLink.preview.select, x);         const media = resolveValue("media", inlineEmailLink.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}