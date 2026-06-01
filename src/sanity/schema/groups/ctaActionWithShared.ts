import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const ctaActionWithShared = {
  title: 'CTA Action - With Shared',
  name: 'ctaActionWithShared',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Rocket'),
  fields: [
    {
      title: 'Button Text',
      name: 'field_buttonText',
      type: 'field_buttonText',
    },
    {
      title: 'Action',
      name: 'field_ctaActionWithShared',
      type: 'field_ctaActionWithShared',
    },
    {
      title: 'Internal Link',
      name: 'field_internalLink',
      type: 'field_internalLink',
      hidden: function (ctx ) { return !['Internal','Anchor','Contact'].includes(ctx.parent?.field_ctaActionWithShared) },
    },
    {
      title: 'Anchor ID',
      name: 'field_anchorId',
      type: 'field_anchorId',
      hidden: function (ctx ) { return !['Anchor'].includes(ctx.parent?.field_ctaActionWithShared) },
    },
    {
      title: 'External Link',
      name: 'field_externalLink',
      type: 'field_externalLink',
      hidden: function (ctx ) { return !['External'].includes(ctx.parent?.field_ctaActionWithShared) },
    },
    {
      title: 'Download',
      name: 'ref_download',
      type: 'ref_download',
      hidden: function (ctx ) { return !['Download'].includes(ctx.parent?.field_ctaActionWithShared) },
    },
    {
      title: 'Shared CTA',
      name: 'ref_sharedCta',
      type: 'ref_sharedCta',
      hidden: function (ctx ) { return !['Reference'].includes(ctx.parent?.field_ctaActionWithShared) },
    },
    {
      title: 'Form ID',
      name: 'field_formId',
      type: 'field_formId',
    },
  ],
  preview: {
    select: {
      title: 'field_buttonText',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Rocket'),
      fallback: {},
    }
         const title = resolveValue('title', ctaActionWithShared.preview.select, x);         const subtitle = resolveValue('subtitle', ctaActionWithShared.preview.select, x);         const media = resolveValue('media', ctaActionWithShared.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}