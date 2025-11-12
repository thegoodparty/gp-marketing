import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const quotes = {
  title: 'Quotes',
  name: 'quotes',
  description: 'A collection of notable sayings or expressions.',
  type: 'document',
  icon: getIcon('Quotes'),
  fields: [
    {
      title: 'Quote',
      name: 'quote',
      type: 'quote',
      group: 'quote',
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
      title: 'quote.field_quoteName',
      _type: '_type',
      subtitle: 'quote.ref_quoteBy.organisationOverview.field_organisationName',
      subtitle1: 'quote.ref_quoteBy.personOverview.field_personName',
      media: 'quote.ref_quoteBy.personOverview.img_profilePicture',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Quotes'),
      fallback: {
        previewTitle: 'quote.field_quoteName',
        previewSubTitle: 'quote.ref_quoteBy.organisationOverview.field_organisationName|quote.ref_quoteBy.personOverview.field_personName',
        previewMedia: 'quote.ref_quoteBy.personOverview.img_profilePicture',
        title: 'Quotes',
      },
    }
         const title = resolveValue("title", quotes.preview.select, x);         const subtitle = resolveValue("subtitle", quotes.preview.select, x);         const media = resolveValue("media", quotes.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Quote',
      name: 'quote',
      icon: getIcon('Quotes'),
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