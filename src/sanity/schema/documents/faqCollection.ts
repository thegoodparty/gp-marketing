import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const faqCollection = {
  title: 'FAQ Collections',
  name: 'faqCollection',
  description: 'A set of frequently asked questions and their answers related to a specific area.',
  type: 'document',
  icon: getIcon('DataCollection'),
  fields: [
    {
      title: 'Overview',
      name: 'collectionOverview',
      type: 'collectionOverview',
      group: 'collectionOverview',
    },
    {
      title: 'Content',
      name: 'faqCollectionContent',
      type: 'faqCollectionContent',
      group: 'faqCollectionContent',
    },
  ],
  preview: {
    select: {
      title: 'collectionOverview.field_collectionName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {
        previewTitle: 'collectionOverview.field_collectionName',
        previewSubTitle: '*FAQ Collection',
        title: 'FAQ Collections',
      },
    }
         const title = resolveValue("title", faqCollection.preview.select, x);         const subtitle = resolveValue("subtitle", faqCollection.preview.select, x);         const media = resolveValue("media", faqCollection.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'collectionOverview',
      icon: getIcon('Home'),
    },
    {
      title: 'Content',
      name: 'faqCollectionContent',
      icon: getIcon('TableOfContents'),
    },
  ],
  options: {
    channels: {},
    single: false,
  },
}