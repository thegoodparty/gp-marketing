import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const videoSection = {
  title: 'Video Section',
  name: 'videoSection',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Video'),
  fields: [
    {
      title: 'Video Embed Code',
      name: 'field_videoEmbedCode',
      type: 'field_videoEmbedCode',
    },
    {
      title: 'Caption',
      name: 'field_caption',
      type: 'field_caption',
    },
  ],
  preview: {
    select: {
      title: 'field_videoEmbedCode',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Video'),
      fallback: {},
    }
         const title = resolveValue('title', videoSection.preview.select, x);         const subtitle = resolveValue('subtitle', videoSection.preview.select, x);         const media = resolveValue('media', videoSection.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}