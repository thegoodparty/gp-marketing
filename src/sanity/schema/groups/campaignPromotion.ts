import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const campaignPromotion = {
  title: 'Campaign Promotion',
  name: 'campaignPromotion',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Rocket'),
  fields: [
    {
      title: 'Shared CTA',
      name: 'ref_promotion',
      type: 'ref_promotion',
    },
  ],
  preview: {
    select: {
      ref: 'ref_promotion._ref',
      type: 'ref_promotion._type',
      cTAs: 'ref_promotion.ctaOverview.field_ctaInternalName',
      title: 'ref_promotion.ctaOverview.field_ctaInternalName',
      media: 'ref_promotion.ctaAssets.img_featuredImage',
    },
    prepare: x => {
const infer = {
      name: 'Promotion',
      singletonTitle: null,
      icon: getIcon('Rocket'),
      fallback: {
        previewTitle: 'ref_promotion.ctaOverview.field_ctaInternalName',
        previewSubTitle: '*Shared CTA',
        previewMedia: 'ref_promotion.ctaAssets.img_featuredImage',
        title: 'Campaign Promotion',
      },
    }
           const vtype = x.type;           const title = resolveValue("title", campaignPromotion.preview.select, x);           const subtitle = resolveValue("subtitle", campaignPromotion.preview.select, x);           const media = resolveValue("media", campaignPromotion.preview.select, x);           const restitle = vtype in x ? x[vtype] : title;           return handleReplacements({             title: infer.singletonTitle || restitle || infer.name,             subtitle: subtitle ? subtitle : infer.fallback["title"],             media: media || infer.icon           }, x, infer.fallback);         },
  },
}