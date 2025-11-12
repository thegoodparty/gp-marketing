import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_bannerBlock = {
  title: 'Banner Block',
  name: 'component_bannerBlock',
  type: 'object',
  icon: getIcon('UserAvatarFilledAlt'),
  fields: [
    {
      title: 'Content',
      name: 'bannerBlockContent',
      type: 'bannerBlockContent',
      group: 'bannerBlockContent',
    },
    {
      title: 'Design Settings',
      name: 'bannerBlockDesignSettings',
      type: 'bannerBlockDesignSettings',
      group: 'bannerBlockDesignSettings',
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
      list: 'list_Choose3People',
      title: 'bannerBlockContent.field_bannerText',
    },
    prepare: x => {
const infer = {
      name: 'Choose 3 People',
      singletonTitle: null,
      icon: getIcon('TextShortParagraph'),
      fallback: {
        previewTitle: 'bannerBlockContent.field_bannerText',
        previewSubTitle: '*Banner Block',
        title: 'Banner Block',
      },
    }
           const title = resolveValue("title", component_bannerBlock.preview.select, x);           const subtitle = resolveValue("subtitle", component_bannerBlock.preview.select, x);           const media = resolveValue("media", component_bannerBlock.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 item" : x.list?.length > 0 ? `${x.list.length} items` : "No items",             media: media || infer.icon           }, x, infer.fallback);         },
  },
  groups: [
    {
      title: 'Content',
      name: 'bannerBlockContent',
      icon: getIcon('TextShortParagraph'),
    },
    {
      title: 'Design Settings',
      name: 'bannerBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}