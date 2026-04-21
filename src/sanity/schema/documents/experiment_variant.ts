import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const experiment_variant = {
  title: 'Experiment Variant',
  name: 'experiment_variant',
  type: 'document',
  icon: getIcon('Chemistry'),
  fields: [
    {
      title: 'Experiment ID',
      name: 'field_experimentId',
      type: 'string',
      description: 'Amplitude flag key (e.g. home_hero_layout_test)',
      validation: (Rule: any) => Rule.required(),
      group: 'experimentSettings',
    },
    {
      title: 'Variant Name',
      name: 'field_variantName',
      type: 'string',
      description: 'Must match the Amplitude variant value exactly (e.g. variant-a)',
      validation: (Rule: any) => Rule.required(),
      group: 'experimentSettings',
    },
    {
      title: 'Page Sections',
      name: 'pageSections',
      type: 'pageSections',
      group: 'pageSections',
    },
  ],
  preview: {
    select: {
      title: 'field_variantName',
      subtitle: 'field_experimentId',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Chemistry'),
      fallback: {
        title: 'Experiment Variant',
      },
    }
         const title = resolveValue("title", experiment_variant.preview.select, x);         const subtitle = resolveValue("subtitle", experiment_variant.preview.select, x);         const media = resolveValue("media", experiment_variant.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Experiment Settings',
      name: 'experimentSettings',
      icon: getIcon('Chemistry'),
    },
    {
      title: 'Page Sections',
      name: 'pageSections',
      icon: getIcon('PageBreak'),
    },
  ],
  options: {
    single: false,
  },
}
