import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const socialChannels = {
  title: 'Social Channels',
  name: 'socialChannels',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('WatsonHealth3rdPartyConnected'),
  fields: [
    {
      title: 'Social Channels',
      name: 'list_socialChannels',
      type: 'list_socialChannels',
    },
  ],
  preview: {
    select: {
      list: 'list_socialChannels',
    },
    prepare: x => {
const infer = {
      name: 'Social Channels',
      singletonTitle: null,
      icon: getIcon('WatsonHealth3rdPartyConnected'),
      fallback: {},
    }
           const title = resolveValue('title', socialChannels.preview.select, x);           const subtitle = resolveValue('subtitle', socialChannels.preview.select, x);           const media = resolveValue('media', socialChannels.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? '1 item' : x.list?.length > 0 ? `${x.list.length} items` : 'No items',             media: media || infer.icon           }, x, infer.fallback);         },
  },
}