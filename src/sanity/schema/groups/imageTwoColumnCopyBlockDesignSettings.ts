import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const imageTwoColumnCopyBlockDesignSettings = {
  title: 'Image Two Column Copy Block Design Settings',
  name: 'imageTwoColumnCopyBlockDesignSettings',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ColorPalette'),
  fields: [
    {
      title: 'Block Color',
      name: 'field_blockColorCreamMidnight',
      type: 'field_blockColorCreamMidnight',
    },
    {
      title: 'Media Alignment',
      name: 'field_mediaAlignmentRightLeft',
      type: 'field_mediaAlignmentRightLeft',
    },
  ],
  preview: {
    select: {
      title: 'field_blockColorCreamMidnight',
      _type: '_type',
    },
    prepare: x => {
      const infer = {
        singletonTitle: null,
        icon: getIcon('ColorPalette'),
        fallback: {},
      };
      const title = resolveValue('title', imageTwoColumnCopyBlockDesignSettings.preview.select, x);
      const subtitle = resolveValue('subtitle', imageTwoColumnCopyBlockDesignSettings.preview.select, x);
      const media = resolveValue('media', imageTwoColumnCopyBlockDesignSettings.preview.select, x);
      return handleReplacements(
        { title: infer.singletonTitle || title || undefined, subtitle: subtitle || undefined, media: media || infer.icon },
        x,
        infer.fallback,
      );
    },
  },
};
