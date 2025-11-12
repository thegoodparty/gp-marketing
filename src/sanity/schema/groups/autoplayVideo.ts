import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const autoplayVideo = {
  title: 'Autoplay Video',
  name: 'autoplayVideo',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Video'),
  fields: [
    {
      title: 'Short Looping Video',
      name: 'field_shortLoopingVideo',
      type: 'field_shortLoopingVideo',
    },
    {
      title: 'Video',
      name: 'field_video',
      type: 'field_video',
    },
  ],
  preview: {
    select: {
      title: 'field_shortLoopingVideo',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Video'),
      fallback: {},
    }
         const title = resolveValue("title", autoplayVideo.preview.select, x);         const subtitle = resolveValue("subtitle", autoplayVideo.preview.select, x);         const media = resolveValue("media", autoplayVideo.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}