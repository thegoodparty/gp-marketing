import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const imageCta = {
  title: 'Image CTA',
  name: 'imageCta',
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
      name: 'ctaMessagingSimple',
      type: 'ctaMessagingSimple',
      hidden: function (ctx ) { return !['Manual'].includes(ctx.parent?.field_ctaType) },
    },
    {
      title: 'CTA Assets',
      name: 'ctaAssets',
      type: 'ctaAssets',
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
      media1: 'ctaAssets.img_featuredImage',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Rocket'),
      fallback: {
        previewTitle: 'campaignPromotion.ref_promotion.ctaOverview.field_ctaInternalName|customCta.field_buttonText',
        previewSubTitle: '*Image CTA',
        previewMedia: 'campaignPromotion.ref_promotion.ctaAssets.img_featuredImage|ctaAssets.img_featuredImage',
        title: 'Image CTA',
      },
    }
         const title = resolveValue("title", imageCta.preview.select, x);         const subtitle = resolveValue("subtitle", imageCta.preview.select, x);         const media = resolveValue("media", imageCta.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}