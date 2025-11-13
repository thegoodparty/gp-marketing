import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const registeredCompany = {
  title: 'Registered Company',
  name: 'registeredCompany',
  description: 'Details about a the legally recognised entity.',
  type: 'document',
  icon: getIcon('Account'),
  fields: [
    {
      title: 'Overview',
      name: 'registeredCompanyInfo',
      type: 'registeredCompanyInfo',
      group: 'registeredCompanyInfo',
    },
    {
      title: 'Contact Information',
      name: 'primaryContactInformation',
      type: 'primaryContactInformation',
      group: 'primaryContactInformation',
    },
  ],
  preview: {
    select: {
      title: 'registeredCompanyInfo.field_registeredCompanyName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {
        previewTitle: 'registeredCompanyInfo.field_registeredCompanyName',
        previewSubTitle: '*Registered Company',
        title: 'Registered Company',
      },
    }
         const title = resolveValue("title", registeredCompany.preview.select, x);         const subtitle = resolveValue("subtitle", registeredCompany.preview.select, x);         const media = resolveValue("media", registeredCompany.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'registeredCompanyInfo',
      icon: getIcon('Home'),
    },
    {
      title: 'Contact Information',
      name: 'primaryContactInformation',
      icon: getIcon('Phone'),
    },
  ],
  options: {
    channels: {},
    single: true,
  },
}