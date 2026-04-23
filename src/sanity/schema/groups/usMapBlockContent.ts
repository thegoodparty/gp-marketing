import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const usMapBlockContent = {
  title: 'Map States',
  name: 'usMapBlockContent',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Map'),
  fields: [
    {
      title: 'State Configurations',
      name: 'list_usMapStateItems',
      type: 'list_usMapStateItems',
    },
  ],
  preview: {
    select: {
      list: 'list_usMapStateItems',
    },
    prepare: x => {
const infer = {
      name: 'Map States',
      singletonTitle: null,
      icon: getIcon('Map'),
      fallback: {},
    }
           const title = resolveValue("title", usMapBlockContent.preview.select, x);           const subtitle = resolveValue("subtitle", usMapBlockContent.preview.select, x);           const media = resolveValue("media", usMapBlockContent.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 state" : x.list?.length > 0 ? `${x.list.length} states configured` : "No states configured",             media: media || infer.icon           }, x, infer.fallback);         },
  },
}
