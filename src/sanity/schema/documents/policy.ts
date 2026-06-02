import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const policy = {
  title: 'Policies',
  name: 'policy',
  description: 'Guidelines or rules set by an organisation.',
  type: 'document',
  icon: getIcon('Policy'),
  fields: [
    {
      title: 'Overview',
      name: 'policyOverview',
      type: 'policyOverview',
      group: 'policyOverview',
    },
    {
      title: 'Policy Content',
      name: 'policySections',
      type: 'policySections',
      group: 'policySections',
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
      title: 'policyOverview.field_policyName',
      _type: '_type',
      media: 'seo.img_openGraphImage',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Policy'),
      fallback: {
        previewTitle: 'policyOverview.field_policyName',
        previewSubTitle: '*Policy',
        previewMedia: 'seo.img_openGraphImage',
        title: 'Policies',
      },
    }
         const title = resolveValue('title', policy.preview.select, x);         const subtitle = resolveValue('subtitle', policy.preview.select, x);         const media = resolveValue('media', policy.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'policyOverview',
      icon: getIcon('Policy'),
    },
    {
      title: 'Policy Content',
      name: 'policySections',
      icon: getIcon('TextFont'),
    },
    {
      title: 'SEO',
      name: 'seo',
      icon: getIcon('Search'),
    },
  ],
  options: {
    pathParams: {
      slug: 'policyOverview.field_slug',
    },
    channels: {
      goodpartyOrg: '/:slug',
    },
    documentSlugs: [
      {
        slugField: 'policyOverview.field_slug',
        slugSources: [
          'policyOverview.field_policyName',
        ],
      },
    ],
    single: false,
  },
}