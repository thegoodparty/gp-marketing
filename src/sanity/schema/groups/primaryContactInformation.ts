import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const primaryContactInformation = {
  title: 'Primary Contact Information',
  name: 'primaryContactInformation',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Phone'),
  fields: [
    {
      title: 'Email Address',
      name: 'field_emailAddress',
      type: 'field_emailAddress',
    },
    {
      title: 'Telephone Number',
      name: 'field_telephoneNumber',
      type: 'field_telephoneNumber',
    },
    {
      title: 'Primary Postal Address',
      name: 'field_primaryPostalAddress',
      type: 'field_primaryPostalAddress',
    },
  ],
  preview: {
    select: {
      title: 'field_emailAddress',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Phone'),
      fallback: {},
    }
         const title = resolveValue("title", primaryContactInformation.preview.select, x);         const subtitle = resolveValue("subtitle", primaryContactInformation.preview.select, x);         const media = resolveValue("media", primaryContactInformation.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}