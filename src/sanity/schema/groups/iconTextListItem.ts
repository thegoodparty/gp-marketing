import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const iconTextListItem = {
  title: 'Icon & Text List Item',
  name: 'iconTextListItem',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  description: 'A single item made up of an icon and body text.',
  icon: getIcon('ListBulleted'),
  fields: [
    {
      title: 'Icon',
      name: 'field_icon',
      type: 'field_icon',
    },
    {
      title: 'Body Text',
      name: 'block_summaryText',
      type: 'block_summaryText',
    },
  ],
  preview: {
    select: {
      title: 'block_summaryText.0.children.0.text',
      _type: '_type',
      media: 'field_icon',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ListBulleted'),
      fallback: {
        previewTitle: 'block_summaryText.0.children.0.text',
        previewSubTitle: '*List Item',
        previewMedia: 'field_icon',
        title: 'Icon & Text List Item',
      },
    }
         const title = resolveValue("title", iconTextListItem.preview.select, x);         const subtitle = resolveValue("subtitle", iconTextListItem.preview.select, x);         const media = resolveValue("media", iconTextListItem.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}