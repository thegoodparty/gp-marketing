import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const policyOverview = {
  title: 'Policy Overview',
  name: 'policyOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Policy'),
  fields: [
    {
      title: 'Name',
      name: 'field_policyName',
      type: 'field_policyName',
    },
    {
      title: 'Slug',
      name: 'field_slug',
      type: 'field_slug',
    },
    {
      title: 'Summary Description',
      name: 'field_policySummary',
      type: 'field_policySummary',
    },
    {
      title: 'Last Updated',
      name: 'field_lastUpdated',
      type: 'field_lastUpdated',
    },
  ],
  preview: {
    select: {
      title: 'field_policyName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Policy'),
      fallback: {},
    }
         const title = resolveValue("title", policyOverview.preview.select, x);         const subtitle = resolveValue("subtitle", policyOverview.preview.select, x);         const media = resolveValue("media", policyOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}