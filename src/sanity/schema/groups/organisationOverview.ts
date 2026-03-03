import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const organisationOverview = {
  title: 'Organisation Overview',
  name: 'organisationOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('LocationCompany'),
  fields: [
    {
      title: 'Name',
      name: 'field_organisationName',
      type: 'field_organisationName',
    },
    {
      title: 'Summary Description',
      name: 'field_summaryDescription',
      type: 'field_summaryDescription',
    },
    {
      title: 'Logo',
      name: 'img_logo',
      type: 'img_logo',
    },
  ],
  preview: {
    select: {
      title: 'field_organisationName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('LocationCompany'),
      fallback: {},
    }
         const title = resolveValue("title", organisationOverview.preview.select, x);         const subtitle = resolveValue("subtitle", organisationOverview.preview.select, x);         const media = resolveValue("media", organisationOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}