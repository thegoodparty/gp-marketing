import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const stepperBlockItems = {
  title: 'Stepper Block Items',
  name: 'stepperBlockItems',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('WatsonHealthStackedScrolling_1'),
  fields: [
    {
      title: 'Cards',
      name: 'list_stepperBlockItems',
      type: 'list_stepperBlockItems',
    },
  ],
  preview: {
    select: {
      list: 'list_stepperBlockItems',
    },
    prepare: x => {
const infer = {
      name: 'Stepper Block Items',
      singletonTitle: null,
      icon: getIcon('WatsonHealthStackedScrolling_1'),
      fallback: {},
    }
           const title = resolveValue("title", stepperBlockItems.preview.select, x);           const subtitle = resolveValue("subtitle", stepperBlockItems.preview.select, x);           const media = resolveValue("media", stepperBlockItems.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? "1 item" : x.list?.length > 0 ? `${x.list.length} items` : "No items",             media: media || infer.icon           }, x, infer.fallback);         },
  },
}