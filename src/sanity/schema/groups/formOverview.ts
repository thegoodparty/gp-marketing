import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const formOverview = {
  title: 'Form Overview',
  name: 'formOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('DataBase'),
  fields: [
    {
      title: 'Form Name (Internal)',
      name: 'field_formNameInternal',
      type: 'field_formNameInternal',
    },
    {
      title: 'Form Provider',
      name: 'field_formProvider',
      type: 'field_formProvider',
    },
    {
      title: 'Form Type',
      name: 'field_formType',
      type: 'field_formType',
    },
    {
      title: 'Hubspot Form ID',
      name: 'field_hubspotFormId',
      type: 'field_hubspotFormId',
      hidden: function (ctx ) { return !['Hubspot'].includes(ctx.parent?.field_formProvider) },
    },
  ],
  preview: {
    select: {
      title: 'field_formNameInternal',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('DataBase'),
      fallback: {},
    }
         const title = resolveValue('title', formOverview.preview.select, x);         const subtitle = resolveValue('subtitle', formOverview.preview.select, x);         const media = resolveValue('media', formOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}