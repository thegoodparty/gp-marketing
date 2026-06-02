import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const stateOverview = {
  title: 'State overview',
  name: 'stateOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('EarthAmericas'),
  fields: [
    {
      title: 'State Name',
      name: 'field_stateName',
      type: 'field_stateName',
    },
  ],
  preview: {
    select: {
      title: 'field_stateName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('EarthAmericas'),
      fallback: {},
    }
         const title = resolveValue('title', stateOverview.preview.select, x);         const subtitle = resolveValue('subtitle', stateOverview.preview.select, x);         const media = resolveValue('media', stateOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}