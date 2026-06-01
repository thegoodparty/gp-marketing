import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const secondaryCta = {
  title: 'Secondary CTA',
  name: 'secondaryCta',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  description: 'An optional supporting action shown alongside the primary CTA, if needed and space allows.',
  icon: getIcon('Rocket'),
  fields: [
    {
      title: 'CTA',
      name: 'ctaActionWithShared',
      type: 'ctaActionWithShared',
    },
  ],
  preview: {
    select: {
      title: 'field_buttonText',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Rocket'),
      fallback: {},
    }
         const title = resolveValue('title', secondaryCta.preview.select, x);         const subtitle = resolveValue('subtitle', secondaryCta.preview.select, x);         const media = resolveValue('media', secondaryCta.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}