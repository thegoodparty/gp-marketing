import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const quoteCollections = {
  title: 'Quote Collections',
  name: 'quoteCollections',
  description: 'A set of related quotes or testimonials.',
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
      name: 'quoteCollectionContent',
      type: 'quoteCollectionContent',
      group: 'quoteCollectionContent',
    },
    {
      title: 'Tags',
      name: 'generalContentTags',
      type: 'generalContentTags',
      group: 'generalContentTags',
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
        previewSubTitle: '*Quote Collection',
        title: 'Quote Collections',
      },
    }
         const title = resolveValue("title", quoteCollections.preview.select, x);         const subtitle = resolveValue("subtitle", quoteCollections.preview.select, x);         const media = resolveValue("media", quoteCollections.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'collectionOverview',
      icon: getIcon('Home'),
    },
    {
      title: 'Content',
      name: 'quoteCollectionContent',
      icon: getIcon('TableOfContents'),
    },
    {
      title: 'Tags',
      name: 'generalContentTags',
      icon: getIcon('Tag'),
    },
  ],
  options: {
    channels: {},
    single: false,
  },
}