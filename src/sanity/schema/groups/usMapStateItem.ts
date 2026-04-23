import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const usMapStateItem = {
  title: 'State Map Item',
  name: 'usMapStateItem',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  description: 'Configuration for a single US state on the map',
  icon: getIcon('LocationFilled'),
  fields: [
    {
      title: 'State Code',
      name: 'field_stateCode',
      type: 'field_stateCode',
    },
    {
      title: 'State Name',
      name: 'field_stateName',
      type: 'field_stateName',
    },
    {
      title: 'State Color',
      name: 'field_mapStateColor',
      type: 'field_mapStateColor',
    },
    {
      title: 'Hover Title',
      name: 'field_hoverTitle',
      type: 'field_hoverTitle',
    },
    {
      title: 'Hover Description',
      name: 'field_hoverDescription',
      type: 'field_hoverDescription',
    },
    {
      title: 'Hover Stat',
      name: 'field_hoverStat',
      type: 'field_hoverStat',
    },
  ],
  preview: {
    select: {
      title: 'field_stateName',
      _type: '_type',
      subtitle: 'field_stateCode',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('LocationFilled'),
      fallback: {
        previewTitle: 'field_stateName',
        previewSubTitle: 'field_stateCode',
        title: 'State Map Item',
      },
    }
         const title = resolveValue("title", usMapStateItem.preview.select, x);         const subtitle = resolveValue("subtitle", usMapStateItem.preview.select, x);         const media = resolveValue("media", usMapStateItem.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}
