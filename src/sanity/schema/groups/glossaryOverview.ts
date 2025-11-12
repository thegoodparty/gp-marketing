import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const glossaryOverview = {
  title: 'Glossary Overview',
  name: 'glossaryOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Tag'),
  fields: [
    {
      title: 'Name',
      name: 'field_name',
      type: 'field_name',
    },
    {
      title: 'Page Subtitle',
      name: 'field_pageSubtitle',
      type: 'field_pageSubtitle',
    },
  ],
  preview: {
    select: {
      title: 'field_name',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Tag'),
      fallback: {},
    }
         const title = resolveValue("title", glossaryOverview.preview.select, x);         const subtitle = resolveValue("subtitle", glossaryOverview.preview.select, x);         const media = resolveValue("media", glossaryOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}