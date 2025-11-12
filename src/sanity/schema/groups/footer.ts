import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const footer = {
  title: 'Footer',
  name: 'footer',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('AlignBoxBottomCenter'),
  fields: [
    {
      title: 'Navigation',
      name: 'list_footerNavigation',
      type: 'list_footerNavigation',
    },
    {
      title: 'Logo',
      name: 'img_logo',
      type: 'img_logo',
    },
    {
      title: 'Footer Message',
      name: 'field_footerMessage',
      type: 'field_footerMessage',
    },
    {
      title: 'Copyright Message',
      name: 'field_copyrightMessage',
      type: 'field_copyrightMessage',
    },
    {
      title: 'Legal Navigation',
      name: 'list_footerLegalNavigation',
      type: 'list_footerLegalNavigation',
    },
  ],
  preview: {
    select: {
      list: 'list_footerNavigation',
    },
    prepare: x => {
const infer = {
      name: 'Footer Navigation',
      singletonTitle: null,
      icon: getIcon('AlignBoxBottomCenter'),
      fallback: {},
    }
           const title = resolveValue("title", footer.preview.select, x);           const subtitle = resolveValue("subtitle", footer.preview.select, x);           const media = resolveValue("media", footer.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 item" : x.list?.length > 0 ? `${x.list.length} items` : "No items",             media: media || infer.icon           }, x, infer.fallback);         },
  },
}