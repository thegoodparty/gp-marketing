import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_ctaBlock = {
  title: 'CTA Block',
  name: 'component_ctaBlock',
  type: 'object',
  icon: getIcon('Rocket'),
  fields: [
    {
      title: 'CTA Type',
      name: 'field_ctaType',
      type: 'field_ctaType',
    },
    {
      title: 'Shared CTA',
      name: 'campaignPromotion',
      type: 'campaignPromotion',
      group: 'campaignPromotion',
      hidden: function (ctx ) { return !['Reference'].includes(ctx.parent.field_ctaType) },
    },
    {
      title: 'CTA Action',
      name: 'ctaAction',
      type: 'ctaAction',
      group: 'ctaAction',
      hidden: function (ctx ) { return !['Manual'].includes(ctx.parent.field_ctaType) },
    },
    {
      title: 'CTA Text',
      name: 'ctaMessaging',
      type: 'ctaMessaging',
      group: 'ctaMessaging',
      hidden: function (ctx ) { return !['Manual'].includes(ctx.parent.field_ctaType) },
    },
    {
      title: 'Secondary CTA',
      name: 'secondaryCta',
      type: 'secondaryCta',
      group: 'secondaryCta',
      hidden: function (ctx ) { return !['Manual'].includes(ctx.parent.field_ctaType) },
    },
    {
      title: 'Design Settings',
      name: 'ctaBlockDesignSettings',
      type: 'ctaBlockDesignSettings',
      group: 'ctaBlockDesignSettings',
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      type: 'componentSettings',
      group: 'componentSettings',
    },
  ],
  preview: {
    select: {
      title: 'campaignPromotion.ref_promotion.ctaOverview.field_ctaInternalName',
      _type: '_type',
      title1: 'ctaAction.field_buttonText',
      media: 'campaignPromotion.ref_promotion.ctaAssets.img_featuredImage',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Rocket'),
      fallback: {
        previewTitle: 'campaignPromotion.ref_promotion.ctaOverview.field_ctaInternalName|ctaAction.field_buttonText',
        previewSubTitle: '*CTA Block',
        previewMedia: 'campaignPromotion.ref_promotion.ctaAssets.img_featuredImage',
        title: 'CTA Block',
      },
    }
         const title = resolveValue('title', component_ctaBlock.preview.select, x);         const subtitle = resolveValue('subtitle', component_ctaBlock.preview.select, x);         const media = resolveValue('media', component_ctaBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Shared CTA',
      name: 'campaignPromotion',
      icon: getIcon('Rocket'),
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
      title: 'Secondary CTA',
      name: 'secondaryCta',
      icon: getIcon('Rocket'),
    },
    {
      title: 'Design Settings',
      name: 'ctaBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}