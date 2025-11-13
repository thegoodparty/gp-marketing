import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_ctaCardsBlock = {
  title: 'CTA Cards Block',
  name: 'component_ctaCardsBlock',
  type: 'object',
  icon: getIcon('Rocket'),
  fields: [
    {
      title: 'CTA Card One',
      name: 'ctaCardOne',
      type: 'ctaCardOne',
      group: 'ctaCardOne',
    },
    {
      title: 'CTA Card Two',
      name: 'ctaCardTwo',
      type: 'ctaCardTwo',
      group: 'ctaCardTwo',
    },
    {
      title: 'Design Settings',
      name: 'ctaCardsBlockDesignSettings',
      type: 'ctaCardsBlockDesignSettings',
      group: 'ctaCardsBlockDesignSettings',
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
      title: 'ctaCardOne.field_label',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Rocket'),
      fallback: {
        previewTitle: 'ctaCardOne.field_label',
        previewSubTitle: '*CTA Cards Block',
        title: 'CTA Cards Block',
      },
    }
         const title = resolveValue("title", component_ctaCardsBlock.preview.select, x);         const subtitle = resolveValue("subtitle", component_ctaCardsBlock.preview.select, x);         const media = resolveValue("media", component_ctaCardsBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'CTA Card One',
      name: 'ctaCardOne',
      icon: getIcon('Rocket'),
    },
    {
      title: 'CTA Card Two',
      name: 'ctaCardTwo',
      icon: getIcon('Rocket'),
    },
    {
      title: 'Design Settings',
      name: 'ctaCardsBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}