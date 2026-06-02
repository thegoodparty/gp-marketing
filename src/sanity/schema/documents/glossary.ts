import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const glossary = {
  title: 'Glossary Terms',
  name: 'glossary',
  type: 'document',
  icon: getIcon('TextFootnote'),
  fields: [
    {
      title: 'Overview',
      name: 'glossaryTermOverview',
      type: 'glossaryTermOverview',
      group: 'glossaryTermOverview',
    },
    {
      title: 'CTA',
      name: 'glossaryTermCta',
      type: 'glossaryTermCta',
      group: 'glossaryTermCta',
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
      title: 'glossaryTermOverview.field_glossaryTerm',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {
        previewTitle: 'glossaryTermOverview.field_glossaryTerm',
        previewSubTitle: '*Glossary Term',
        title: 'Glossary Terms',
      },
    }
         const title = resolveValue('title', glossary.preview.select, x);         const subtitle = resolveValue('subtitle', glossary.preview.select, x);         const media = resolveValue('media', glossary.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'glossaryTermOverview',
      icon: getIcon('Home'),
    },
    {
      title: 'CTA',
      name: 'glossaryTermCta',
      icon: getIcon('Rocket'),
    },
    {
      title: 'SEO',
      name: 'seo',
      icon: getIcon('Search'),
    },
  ],
  options: {
    pathParams: {
      slug: 'glossaryTermOverview.field_slug',
    },
    channels: {
      goodpartyOrg: '/political-terms/:slug',
    },
    documentSlugs: [
      {
        slugField: 'glossaryTermOverview.field_slug',
        slugSources: [
          'glossaryTermOverview.field_glossaryTerm',
        ],
      },
    ],
    single: false,
  },
}