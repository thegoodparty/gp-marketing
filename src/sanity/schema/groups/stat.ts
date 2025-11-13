import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const stat = {
  title: 'Stat',
  name: 'stat',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  description: 'A single stat',
  icon: getIcon('CharacterWholeNumber'),
  fields: [
    {
      title: 'Stat Value',
      name: 'field_statValue',
      type: 'field_statValue',
    },
    {
      title: 'Stat Description',
      name: 'field_statDescription',
      type: 'field_statDescription',
    },
    {
      title: 'Color',
      name: 'field_componentColor6ColorsCreamMidnight',
      type: 'field_componentColor6ColorsCreamMidnight',
    },
  ],
  preview: {
    select: {
      title: 'field_statValue',
      _type: '_type',
      subtitle: 'field_statDescription',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('CharacterWholeNumber'),
      fallback: {
        previewTitle: 'field_statValue',
        previewSubTitle: 'field_statDescription',
        title: 'Stat',
      },
    }
         const title = resolveValue("title", stat.preview.select, x);         const subtitle = resolveValue("subtitle", stat.preview.select, x);         const media = resolveValue("media", stat.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}