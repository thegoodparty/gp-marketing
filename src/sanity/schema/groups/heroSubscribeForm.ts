import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const heroSubscribeForm = {
  title: 'Hero Subscribe Form',
  name: 'heroSubscribeForm',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('DataBase'),
  fields: [
    {
      title: 'Form',
      name: 'ref_formUsed',
      type: 'ref_formUsed',
    },
  ],
  preview: {
    select: {
      ref: 'ref_formUsed._ref',
      type: 'ref_formUsed._type',
      forms: 'ref_formUsed.field_formNameInternal',
    },
    prepare: x => {
const infer = {
      name: 'Form Used',
      singletonTitle: null,
      icon: getIcon('DataBase'),
      fallback: {},
    }
           const vtype = x.type;           const title = resolveValue("title", heroSubscribeForm.preview.select, x);           const subtitle = resolveValue("subtitle", heroSubscribeForm.preview.select, x);           const media = resolveValue("media", heroSubscribeForm.preview.select, x);           const restitle = vtype in x ? x[vtype] : title;           return handleReplacements({             title: infer.singletonTitle || restitle || infer.name,             subtitle: subtitle ? subtitle : infer.fallback["title"],             media: media || infer.icon           }, x, infer.fallback);         },
  },
}