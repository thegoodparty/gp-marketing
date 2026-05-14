import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_imageTwoColumnCopyBlock = {
  title: 'Image Two Column Copy Block',
  name: 'component_imageTwoColumnCopyBlock',
  type: 'object',
  icon: getIcon('Columns'),
  fields: [
    {
      title: 'Label',
      name: 'field_label',
      type: 'string',
      group: 'content',
    },
    {
      title: 'Title',
      name: 'field_title',
      type: 'string',
      group: 'content',
    },
    {
      title: 'Copy (Left Column)',
      name: 'block_copyLeft',
      type: 'block_summaryText',
      group: 'content',
    },
    {
      title: 'Copy (Right Column)',
      name: 'block_copyRight',
      type: 'block_summaryText',
      group: 'content',
    },
    {
      title: 'Image',
      name: 'ctaAssets',
      type: 'ctaAssets',
      group: 'ctaAssets',
    },
    {
      title: 'CTA',
      name: 'primaryCTA',
      type: 'ctaAction',
      group: 'primaryCTA',
    },
    {
      title: 'Design Settings',
      name: 'imageTwoColumnCopyBlockDesignSettings',
      type: 'imageTwoColumnCopyBlockDesignSettings',
      group: 'imageTwoColumnCopyBlockDesignSettings',
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
      title: 'field_title',
      _type: '_type',
      media: 'ctaAssets.img_featuredImage',
    },
    prepare: x => {
      const infer = {
        singletonTitle: null,
        icon: getIcon('Columns'),
        fallback: {
          previewTitle: 'field_title',
          previewSubTitle: '*Image Two Column Copy Block',
          title: 'Image Two Column Copy Block',
        },
      };
      const title = resolveValue("title", component_imageTwoColumnCopyBlock.preview.select, x);
      const subtitle = resolveValue("subtitle", component_imageTwoColumnCopyBlock.preview.select, x);
      const media = resolveValue("media", component_imageTwoColumnCopyBlock.preview.select, x);
      return handleReplacements({
        title: infer.singletonTitle || title || undefined,
        subtitle: subtitle ? subtitle : infer.fallback["title"],
        media: media || infer.icon,
      }, x, infer.fallback);
    },
  },
  groups: [
    {
      title: 'Content',
      name: 'content',
      icon: getIcon('TextFont'),
    },
    {
      title: 'Image',
      name: 'ctaAssets',
      icon: getIcon('Image'),
    },
    {
      title: 'CTA',
      name: 'primaryCTA',
      icon: getIcon('Rocket'),
    },
    {
      title: 'Design Settings',
      name: 'imageTwoColumnCopyBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
};
