import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_ctaBannerBlock = {
  title: 'CTA Banner Block',
  name: 'component_ctaBannerBlock',
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
      name: 'smallCtaMessaging',
      type: 'smallCtaMessaging',
      group: 'smallCtaMessaging',
    },
    {
      title: 'Design Settings',
      name: 'ctaBannerBlockDesignSettings',
      type: 'ctaBannerBlockDesignSettings',
      group: 'ctaBannerBlockDesignSettings',
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
        previewSubTitle: '*CTA Banner Block',
        previewMedia: 'campaignPromotion.ref_promotion.ctaAssets.img_featuredImage',
        title: 'CTA Banner Block',
      },
    }
         const title = resolveValue("title", component_ctaBannerBlock.preview.select, x);         const subtitle = resolveValue("subtitle", component_ctaBannerBlock.preview.select, x);         const media = resolveValue("media", component_ctaBannerBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
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
      name: 'smallCtaMessaging',
      icon: getIcon('Quotes'),
    },
    {
      title: 'Design Settings',
      name: 'ctaBannerBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}