import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const quote = {
  title: 'Quote',
  name: 'quote',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Quotes'),
  fields: [
    {
      title: 'Name',
      name: 'field_quoteName',
      type: 'field_quoteName',
    },
    {
      title: 'Quote',
      name: 'field_quote',
      type: 'field_quote',
    },
    {
      title: 'Quote By',
      name: 'ref_quoteBy',
      type: 'ref_quoteBy',
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
        title: 'Quote',
      },
    }
         const title = resolveValue('title', quote.preview.select, x);         const subtitle = resolveValue('subtitle', quote.preview.select, x);         const media = resolveValue('media', quote.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}