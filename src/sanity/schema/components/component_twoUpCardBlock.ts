import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_twoUpCardBlock = {
  title: 'Two Up Card Block',
  name: 'component_twoUpCardBlock',
  type: 'object',
  icon: getIcon('VerticalView'),
  fields: [
    {
      title: 'Card One',
      name: 'twoUpCardBlockOne',
      type: 'twoUpCardBlockOne',
      group: 'twoUpCardBlockOne',
    },
    {
      title: 'Card Two',
      name: 'twoUpCardBlockTwo',
      type: 'twoUpCardBlockTwo',
      group: 'twoUpCardBlockTwo',
    },
    {
      title: 'Design Settings',
      name: 'twoUpCardBlockDesignSettings',
      type: 'twoUpCardBlockDesignSettings',
      group: 'twoUpCardBlockDesignSettings',
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
      title: 'field_twoUpCardBlockCardType',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('AlignBoxMiddleCenter'),
      fallback: {
        previewSubTitle: '*Two Up Card Block',
        title: 'Two Up Card Block',
      },
    }
         const title = resolveValue("title", component_twoUpCardBlock.preview.select, x);         const subtitle = resolveValue("subtitle", component_twoUpCardBlock.preview.select, x);         const media = resolveValue("media", component_twoUpCardBlock.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'Card One',
      name: 'twoUpCardBlockOne',
      icon: getIcon('AlignBoxMiddleCenter'),
    },
    {
      title: 'Card Two',
      name: 'twoUpCardBlockTwo',
      icon: getIcon('AlignBoxMiddleCenter'),
    },
    {
      title: 'Design Settings',
      name: 'twoUpCardBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}