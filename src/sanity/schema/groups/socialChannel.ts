import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const socialChannel = {
  title: 'Social Channel',
  name: 'socialChannel',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('WatsonHealth3rdPartyConnected'),
  fields: [
    {
      title: 'Social Channel',
      name: 'field_socialChannel',
      type: 'field_socialChannel',
    },
    {
      title: 'Social Channel URL',
      name: 'field_socialChannelUrl',
      type: 'field_socialChannelUrl',
    },
  ],
  preview: {
    select: {
      title: 'field_socialChannel',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('WatsonHealth3rdPartyConnected'),
      fallback: {
        previewTitle: 'field_socialChannel',
        title: 'Social Channel',
      },
    }
         const title = resolveValue('title', socialChannel.preview.select, x);         const subtitle = resolveValue('subtitle', socialChannel.preview.select, x);         const media = resolveValue('media', socialChannel.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}