import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const button = {
  title: 'Button',
  name: 'button',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Link'),
  fields: [
    {
      title: 'Button Hierarchy',
      name: 'field_buttonHierarchy',
      type: 'field_buttonHierarchy',
    },
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
      title1: 'ref_sharedCta.ctaOverview.field_ctaInternalName',
      subtitle: 'field_ctaAction',
      subtitle1: 'ref_sharedCta.ctaMessaging.field_ctaActionWithShared',
      media: 'ref_sharedCta.ctaAssets.img_featuredImage',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Link'),
      fallback: {
        previewTitle: 'field_buttonText|ref_sharedCta.ctaOverview.field_ctaInternalName',
        previewSubTitle: 'field_ctaAction|ref_sharedCta.ctaMessaging.field_ctaActionWithShared',
        previewMedia: 'ref_sharedCta.ctaAssets.img_featuredImage',
        title: 'Button',
      },
    }
         const title = resolveValue('title', button.preview.select, x);         const subtitle = resolveValue('subtitle', button.preview.select, x);         const media = resolveValue('media', button.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}