import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const iconBlockItem = {
  title: 'Icon Block Item',
  name: 'iconBlockItem',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Checkbox'),
  fields: [
    {
      title: 'Icon',
      name: 'field_icon',
      type: 'field_icon',
    },
    {
      title: 'Heading',
      name: 'field_title',
      type: 'field_title',
    },
    {
      title: 'Body Text',
      name: 'block_summaryText',
      type: 'block_summaryText',
    },
  ],
  preview: {
    select: {
      title: 'field_title',
      _type: '_type',
      subtitle: 'block_summaryText.0.children.0.text',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Checkbox'),
      fallback: {
        previewTitle: 'field_title',
        previewSubTitle: 'block_summaryText.0.children.0.text',
        title: 'Icon Block Item',
      },
    }
         const title = resolveValue("title", iconBlockItem.preview.select, x);         const subtitle = resolveValue("subtitle", iconBlockItem.preview.select, x);         const media = resolveValue("media", iconBlockItem.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}