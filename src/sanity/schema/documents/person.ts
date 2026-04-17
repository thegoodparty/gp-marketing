import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const person = {
  title: 'People',
  name: 'person',
  description: 'A category for individual people.',
  type: 'document',
  icon: getIcon('User'),
  fields: [
    {
      title: 'Overview',
      name: 'personOverview',
      type: 'personOverview',
    },
  ],
  preview: {
    select: {
      title: 'personOverview.field_personName',
      _type: '_type',
      subtitle: 'personOverview.field_jobTitleOrRole',
      media: 'personOverview.img_profilePicture',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('User'),
      fallback: {
        previewTitle: 'personOverview.field_personName',
        previewSubTitle: 'personOverview.field_jobTitleOrRole',
        previewMedia: 'personOverview.img_profilePicture',
        title: 'People',
      },
    }
         const title = resolveValue('title', person.preview.select, x);         const subtitle = resolveValue('subtitle', person.preview.select, x);         const media = resolveValue('media', person.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  options: {
    channels: {},
    single: false,
  },
}