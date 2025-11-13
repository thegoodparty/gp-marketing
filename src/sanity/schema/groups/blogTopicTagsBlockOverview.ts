import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const blogTopicTagsBlockOverview = {
  title: 'Blog Topic Tags Block Overview',
  name: 'blogTopicTagsBlockOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Home'),
  fields: [
    {
      title: 'Heading Override',
      name: 'field_topicsHeadingOverride',
      type: 'field_topicsHeadingOverride',
    },
  ],
  preview: {
    select: {
      title: 'field_topicsHeadingOverride',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {},
    }
         const title = resolveValue("title", blogTopicTagsBlockOverview.preview.select, x);         const subtitle = resolveValue("subtitle", blogTopicTagsBlockOverview.preview.select, x);         const media = resolveValue("media", blogTopicTagsBlockOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}