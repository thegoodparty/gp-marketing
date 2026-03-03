import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const goodpartyOrg_contact = {
  title: 'Contact',
  name: 'goodpartyOrg_contact',
  type: 'document',
  icon: getIcon('Phone'),
  fields: [
    {
      title: 'Overview',
      name: 'contactPageOverview',
      type: 'contactPageOverview',
      group: 'contactPageOverview',
    },
    {
      title: 'Page Sections',
      name: 'pageSections',
      type: 'pageSections',
      group: 'pageSections',
    },
    {
      title: 'SEO',
      name: 'seo',
      type: 'seo',
      group: 'seo',
    },
  ],
  preview: {
    select: {
      title: 'contactPageOverview.field_pageTitle',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {
        previewTitle: 'contactPageOverview.field_pageTitle',
        previewSubTitle: '*Contact',
        title: 'Contact',
      },
    }
         const title = resolveValue("title", goodpartyOrg_contact.preview.select, x);         const subtitle = resolveValue("subtitle", goodpartyOrg_contact.preview.select, x);         const media = resolveValue("media", goodpartyOrg_contact.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'contactPageOverview',
      icon: getIcon('Home'),
    },
    {
      title: 'Page Sections',
      name: 'pageSections',
      icon: getIcon('PageBreak'),
    },
    {
      title: 'SEO',
      name: 'seo',
      icon: getIcon('Search'),
    },
  ],
  options: {
    channels: {
      goodpartyOrg: '/contact',
    },
    single: true,
  },
}