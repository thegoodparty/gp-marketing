import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const contactPageOverview = {
  title: 'Contact Page Overview',
  name: 'contactPageOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Home'),
  fields: [
    {
      title: 'Page Title',
      name: 'field_pageTitle',
      type: 'field_pageTitle',
    },
    {
      title: 'Summary Description',
      name: 'field_summaryDescription',
      type: 'field_summaryDescription',
    },
    {
      title: 'Form',
      name: 'ref_formUsed',
      type: 'ref_formUsed',
    },
  ],
  preview: {
    select: {
      title: 'field_pageTitle',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {},
    }
         const title = resolveValue("title", contactPageOverview.preview.select, x);         const subtitle = resolveValue("subtitle", contactPageOverview.preview.select, x);         const media = resolveValue("media", contactPageOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}