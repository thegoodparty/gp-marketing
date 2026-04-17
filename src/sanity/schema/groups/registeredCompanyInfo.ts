import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const registeredCompanyInfo = {
  title: 'Registered Company Info',
  name: 'registeredCompanyInfo',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Home'),
  fields: [
    {
      title: 'Registered Company Name',
      name: 'field_registeredCompanyName',
      type: 'field_registeredCompanyName',
    },
    {
      title: 'Registered Office Address',
      name: 'field_registeredOfficeAddress',
      type: 'field_registeredOfficeAddress',
    },
    {
      title: 'Registered Company Number',
      name: 'field_registeredCompanyNumber',
      type: 'field_registeredCompanyNumber',
    },
  ],
  preview: {
    select: {
      title: 'field_registeredCompanyName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {},
    }
         const title = resolveValue('title', registeredCompanyInfo.preview.select, x);         const subtitle = resolveValue('subtitle', registeredCompanyInfo.preview.select, x);         const media = resolveValue('media', registeredCompanyInfo.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}