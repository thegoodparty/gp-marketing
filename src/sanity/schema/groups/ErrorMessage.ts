import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const ErrorMessage = {
  title: '404 Error Message',
  name: 'ErrorMessage',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('DataError'),
  fields: [
    {
      title: 'Overline',
      name: 'field_label',
      type: 'field_label',
    },
    {
      title: 'Heading',
      name: 'field_title',
      type: 'field_title',
    },
    {
      title: 'Summary Description',
      name: 'field_summaryDescription',
      type: 'field_summaryDescription',
    },
    {
      title: 'Buttons',
      name: 'list_buttons',
      type: 'list_buttons',
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
      icon: getIcon('DataError'),
      fallback: {},
    }
         const title = resolveValue("title", ErrorMessage.preview.select, x);         const subtitle = resolveValue("subtitle", ErrorMessage.preview.select, x);         const media = resolveValue("media", ErrorMessage.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}