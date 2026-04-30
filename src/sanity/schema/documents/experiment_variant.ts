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
      title: 'Target Pages',
      name: 'field_targetPages',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'goodpartyOrg_home' },
            { type: 'goodpartyOrg_landingPages' },
            { type: 'goodpartyOrg_contact' },
            { type: 'goodpartyOrg_glossary' },
            { type: 'goodpartyOrg_allArticles' },
          ],
        },
      ],
      description:
        'Pages where this experiment variant is active. Uses references to prevent typos.',
      validation: (Rule: any) => Rule.required().min(1),
      group: 'experimentSettings',
    },
    {
      title: 'Status',
      name: 'field_status',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Running', value: 'running' },
          { title: 'Ended', value: 'ended' },
        ],
        layout: 'radio',
      },
      description: 'Only Running experiments are resolved at runtime.',
      validation: (Rule: any) => Rule.required(),
      group: 'experimentSettings',
    },
    {
      title: 'Priority',
      name: 'field_priority',
      type: 'number',
      initialValue: 100,
      description:
        'Lower numbers take precedence. When multiple experiments target the same page, the lowest priority number wins.',
      validation: (Rule: any) => Rule.required().integer().min(1).max(999),
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
