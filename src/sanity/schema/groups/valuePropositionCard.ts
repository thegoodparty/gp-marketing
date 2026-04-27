import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const valuePropositionCard = {
  title: 'Value Proposition Card',
  name: 'valuePropositionCard',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('WatsonHealthStackedScrolling_1'),
  fields: [
    {
      title: 'Heading',
      name: 'field_title',
      type: 'field_title',
    },
    {
      title: 'Value Proposition Card Items',
      name: 'list_valuePropositionCardItems',
      type: 'list_valuePropositionCardItems',
    },
    {
      title: 'Button',
      name: 'button',
      type: 'button',
    },
    {
      title: 'Color',
      name: 'field_componentColor6ColorsInverse',
      type: 'field_componentColor6ColorsInverse',
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
      icon: getIcon('WatsonHealthStackedScrolling_1'),
      fallback: {},
    }
         const title = resolveValue('title', valuePropositionCard.preview.select, x);         const subtitle = resolveValue('subtitle', valuePropositionCard.preview.select, x);         const media = resolveValue('media', valuePropositionCard.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}