import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const ctaAction = {
  title: 'CTA Action',
  name: 'ctaAction',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  description: 'A one-off CTA with custom text and action.',
  icon: getIcon('Rocket'),
  fields: [
    {
      title: 'Button Text',
      name: 'field_buttonText',
      type: 'field_buttonText',
    },
    {
      title: 'Action',
      name: 'field_ctaAction',
      type: 'field_ctaAction',
    },
    {
      title: 'Internal Link',
      name: 'field_internalLink',
      type: 'field_internalLink',
      hidden: function (ctx ) { return !['Internal','Anchor','Contact'].includes(ctx.parent?.field_ctaAction) },
    },
    {
      title: 'External Link',
      name: 'field_externalLink',
      type: 'field_externalLink',
      hidden: function (ctx ) { return !['External'].includes(ctx.parent?.field_ctaAction) },
    },
    {
      title: 'Anchor ID',
      name: 'field_anchorId',
      type: 'field_anchorId',
      hidden: function (ctx ) { return !['Anchor'].includes(ctx.parent?.field_ctaAction) },
    },
    {
      title: 'Download',
      name: 'ref_download',
      type: 'ref_download',
      hidden: function (ctx ) { return !['Download'].includes(ctx.parent?.field_ctaAction) },
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
         const title = resolveValue("title", ctaAction.preview.select, x);         const subtitle = resolveValue("subtitle", ctaAction.preview.select, x);         const media = resolveValue("media", ctaAction.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}