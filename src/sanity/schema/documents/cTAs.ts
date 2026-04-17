import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const cTAs = {
  title: 'CTAs',
  name: 'cTAs',
  description: 'These are prompts guiding users to take action.',
  type: 'document',
  icon: getIcon('Promote'),
  fields: [
    {
      title: 'Overview',
      name: 'ctaOverview',
      type: 'ctaOverview',
      group: 'ctaOverview',
    },
    {
      title: 'CTA Action',
      name: 'ctaAction',
      type: 'ctaAction',
      group: 'ctaAction',
    },
    {
      title: 'CTA Text',
      name: 'ctaMessaging',
      type: 'ctaMessaging',
      group: 'ctaMessaging',
    },
    {
      title: 'CTA Assets',
      name: 'ctaAssets',
      type: 'ctaAssets',
      group: 'ctaAssets',
    },
    {
      title: 'Secondary CTA',
      name: 'secondaryCta',
      type: 'secondaryCta',
      group: 'secondaryCta',
    },
    {
      title: 'Tags',
      name: 'generalContentTags',
      type: 'generalContentTags',
      group: 'generalContentTags',
    },
  ],
  preview: {
    select: {
      title: 'ctaOverview.field_ctaInternalName',
      _type: '_type',
      subtitle: 'ctaAction.field_ctaAction',
      media: 'ctaAssets.img_featuredImage',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Promote'),
      fallback: {
        previewTitle: 'ctaOverview.field_ctaInternalName',
        previewSubTitle: 'ctaAction.field_ctaAction',
        previewMedia: 'ctaAssets.img_featuredImage',
        title: 'CTAs',
      },
    }
         const title = resolveValue('title', cTAs.preview.select, x);         const subtitle = resolveValue('subtitle', cTAs.preview.select, x);         const media = resolveValue('media', cTAs.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Overview',
      name: 'ctaOverview',
      icon: getIcon('Promote'),
    },
    {
      title: 'CTA Action',
      name: 'ctaAction',
      icon: getIcon('Rocket'),
    },
    {
      title: 'CTA Text',
      name: 'ctaMessaging',
      icon: getIcon('TextFont'),
    },
    {
      title: 'CTA Assets',
      name: 'ctaAssets',
      icon: getIcon('Image'),
    },
    {
      title: 'Secondary CTA',
      name: 'secondaryCta',
      icon: getIcon('Rocket'),
    },
    {
      title: 'Tags',
      name: 'generalContentTags',
      icon: getIcon('Tag'),
    },
  ],
  options: {
    channels: {},
    single: false,
  },
}