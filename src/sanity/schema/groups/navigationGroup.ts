import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const navigationGroup = {
  title: 'Navigation Group',
  name: 'navigationGroup',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('CicsSystemGroup'),
  fields: [
    {
      title: 'Link Text',
      name: 'field_linkText',
      type: 'field_linkText',
    },
    {
      title: 'Links',
      name: 'list_navigationGroup',
      type: 'list_navigationGroup',
    },
  ],
  preview: {
    select: {
      title: 'field_linkText',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('CicsSystemGroup'),
      fallback: {
        previewTitle: 'field_linkText',
        previewSubTitle: '*Navigation Group',
        title: 'Navigation Group',
      },
    }
         const title = resolveValue("title", navigationGroup.preview.select, x);         const subtitle = resolveValue("subtitle", navigationGroup.preview.select, x);         const media = resolveValue("media", navigationGroup.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}