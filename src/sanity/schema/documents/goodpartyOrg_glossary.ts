import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const goodpartyOrg_glossary = {
  title: 'Glossary',
  name: 'goodpartyOrg_glossary',
  type: 'document',
  icon: getIcon('TextFootnote'),
  fields: [
    {
      title: 'Overview',
      name: 'glossaryOverview',
      type: 'glossaryOverview',
      group: 'glossaryOverview',
    },
    {
      title: 'CTA',
      name: 'glossaryPageCta',
      type: 'glossaryPageCta',
      group: 'glossaryPageCta',
    },
    {
      title: 'SEO',
      name: 'seo',
      type: 'seo',
      group: 'seo',
    },
  ],
  preview: {
    select: {
      title: 'field_name',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Tag'),
      fallback: {},
    }
         const title = resolveValue("title", goodpartyOrg_glossary.preview.select, x);         const subtitle = resolveValue("subtitle", goodpartyOrg_glossary.preview.select, x);         const media = resolveValue("media", goodpartyOrg_glossary.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'glossaryOverview',
      icon: getIcon('Tag'),
    },
    {
      title: 'CTA',
      name: 'glossaryPageCta',
      icon: getIcon('Rocket'),
    },
    {
      title: 'SEO',
      name: 'seo',
      icon: getIcon('Search'),
    },
  ],
  options: {
    channels: {
      goodpartyOrg: '/political-terms',
    },
    single: true,
  },
}