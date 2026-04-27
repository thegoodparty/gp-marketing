import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const comparisonBlockTableOne = {
  title: 'Comparison Block Table One',
  name: 'comparisonBlockTableOne',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ListBulleted'),
  fields: [
    {
      title: 'Heading',
      name: 'field_title',
      type: 'field_title',
    },
    {
      title: 'Comparison Block Table Items',
      name: 'list_comparisonBlockTableItems',
      type: 'list_comparisonBlockTableItems',
    },
    {
      title: 'Color',
      name: 'field_componentColor6Colors',
      type: 'field_componentColor6Colors',
    },
  ],
  preview: {
    select: {
      title: 'field_title',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('ListBulleted'),
      fallback: {},
    }
         const title = resolveValue('title', comparisonBlockTableOne.preview.select, x);         const subtitle = resolveValue('subtitle', comparisonBlockTableOne.preview.select, x);         const media = resolveValue('media', comparisonBlockTableOne.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}