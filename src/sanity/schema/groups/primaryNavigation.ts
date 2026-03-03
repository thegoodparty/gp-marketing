import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const primaryNavigation = {
  title: 'Primary Navigation',
  name: 'primaryNavigation',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Menu'),
  fields: [
    {
      title: 'Primary Navigation',
      name: 'list_primaryNavigation',
      type: 'list_primaryNavigation',
    },
    {
      title: 'Logged Out CTAs',
      name: 'loggedOutCtAs',
      type: 'loggedOutCtAs',
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
      fallback: {},
    }
           const title = resolveValue("title", primaryNavigation.preview.select, x);           const subtitle = resolveValue("subtitle", primaryNavigation.preview.select, x);           const media = resolveValue("media", primaryNavigation.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 item" : x.list?.length > 0 ? `${x.list.length} items` : "No items",             media: media || infer.icon           }, x, infer.fallback);         },
  },
}