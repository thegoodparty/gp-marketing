import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const organisation = {
  title: 'Organisations',
  name: 'organisation',
  description: 'A collection of data related to different organisations.',
  type: 'document',
  icon: getIcon('LocationCompany'),
  fields: [
    {
      title: 'Overview',
      name: 'organisationOverview',
      type: 'organisationOverview',
    },
  ],
  preview: {
    select: {
      title: 'organisationOverview.field_organisationName',
      _type: '_type',
      media: 'organisationOverview.img_logo',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('LocationCompany'),
      fallback: {
        previewTitle: 'organisationOverview.field_organisationName',
        previewSubTitle: '*Organisation',
        previewMedia: 'organisationOverview.img_logo',
        title: 'Organisations',
      },
    }
         const title = resolveValue('title', organisation.preview.select, x);         const subtitle = resolveValue('subtitle', organisation.preview.select, x);         const media = resolveValue('media', organisation.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  options: {
    channels: {},
    single: false,
  },
}