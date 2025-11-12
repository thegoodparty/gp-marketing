import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const goodpartyOrg_navigation = {
  title: 'Navigation',
  name: 'goodpartyOrg_navigation',
  type: 'document',
  icon: getIcon('Menu'),
  fields: [
    {
      title: 'Primary Navigation',
      name: 'primaryNavigation',
      type: 'primaryNavigation',
    },
  ],
  preview: {
    select: {
      list: 'list_primaryNavigation',
    },
    prepare: x => {
const infer = {
      name: 'Primary Navigation',
      singletonTitle: null,
      icon: getIcon('Menu'),
      fallback: {
        previewTitle: '*Navigation',
        title: 'Navigation',
      },
    }
           const title = resolveValue("title", goodpartyOrg_navigation.preview.select, x);           const subtitle = resolveValue("subtitle", goodpartyOrg_navigation.preview.select, x);           const media = resolveValue("media", goodpartyOrg_navigation.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 item" : x.list?.length > 0 ? `${x.list.length} items` : "No items",             media: media || infer.icon           }, x, infer.fallback);         },
  },
  options: {
    channels: {},
    single: true,
  },
}