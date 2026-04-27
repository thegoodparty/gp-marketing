import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const inlineQuoteSection = {
  title: 'Inline Quote',
  name: 'inlineQuoteSection',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Quotes'),
  fields: [
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
      _type: '_type',
      subtitle: 'ref_quoteBy.organisationOverview.field_organisationName',
      subtitle1: 'ref_quoteBy.personOverview.field_personName',
      media: 'ref_quoteBy.personOverview.img_profilePicture',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Quotes'),
      fallback: {
        previewTitle: '*Quote',
        previewSubTitle: 'ref_quoteBy.organisationOverview.field_organisationName|ref_quoteBy.personOverview.field_personName',
        previewMedia: 'ref_quoteBy.personOverview.img_profilePicture',
        title: 'Inline Quote',
      },
    }
         const title = resolveValue('title', inlineQuoteSection.preview.select, x);         const subtitle = resolveValue('subtitle', inlineQuoteSection.preview.select, x);         const media = resolveValue('media', inlineQuoteSection.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}