import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const ctaSection = {
  title: 'CTA Section',
  name: 'ctaSection',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
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
      hidden: function (ctx ) { return !['Reference'].includes(ctx.parent?.field_ctaType) },
    },
    {
      title: 'CTA Action',
      name: 'ctaAction',
      type: 'ctaAction',
      hidden: function (ctx ) { return !['Manual'].includes(ctx.parent?.field_ctaType) },
    },
    {
      title: 'CTA Text',
      name: 'ctaMessaging',
      type: 'ctaMessaging',
      hidden: function (ctx ) { return !['Manual'].includes(ctx.parent?.field_ctaType) },
    },
    {
      title: 'Secondary CTA',
      name: 'secondaryCta',
      type: 'secondaryCta',
      hidden: function (ctx ) { return !['Manual'].includes(ctx.parent?.field_ctaType) },
    },
    {
      title: 'Color',
      name: 'field_componentColor6Colors',
      type: 'field_componentColor6Colors',
    },
  ],
  preview: {
    select: {
      title: 'campaignPromotion.ref_promotion.ctaOverview.field_ctaInternalName',
      _type: '_type',
      title1: 'customCta.field_buttonText',
      media: 'campaignPromotion.ref_promotion.ctaAssets.img_featuredImage',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Rocket'),
      fallback: {
        previewTitle: 'campaignPromotion.ref_promotion.ctaOverview.field_ctaInternalName|customCta.field_buttonText',
        previewSubTitle: '*CTA Section',
        previewMedia: 'campaignPromotion.ref_promotion.ctaAssets.img_featuredImage',
        title: 'CTA Section',
      },
    }
         const title = resolveValue("title", ctaSection.preview.select, x);         const subtitle = resolveValue("subtitle", ctaSection.preview.select, x);         const media = resolveValue("media", ctaSection.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}