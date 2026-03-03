import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const goodpartyOrg_redirects = {
  title: 'Redirects',
  name: 'goodpartyOrg_redirects',
  type: 'document',
  icon: getIcon('ArrowsHorizontal'),
  fields: [
    {
      title: 'Redirects',
      type: 'list_redirects',
      name: 'list_redirects',
    },
  ],
  preview: {
    select: {
      list: 'list_redirects',
    },
    prepare: x => {
const infer = {
      name: 'Redirects',
      singletonTitle: null,
      icon: getIcon('ArrowsHorizontal'),
      fallback: {
        previewTitle: '*Redirects',
        title: 'Redirects',
      },
    }
           const title = resolveValue("title", goodpartyOrg_redirects.preview.select, x);           const subtitle = resolveValue("subtitle", goodpartyOrg_redirects.preview.select, x);           const media = resolveValue("media", goodpartyOrg_redirects.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 item" : x.list?.length > 0 ? `${x.list.length} items` : "No items",             media: media || infer.icon           }, x, infer.fallback);         },
  },
  options: {
    channels: {},
    single: true,
  },
}