import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const glossaryTermOverview = {
  title: 'Glossary Term Overview',
  name: 'glossaryTermOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Home'),
  fields: [
    {
      title: 'Glossary Term',
      name: 'field_glossaryTerm',
      type: 'field_glossaryTerm',
    },
    {
      title: 'Slug',
      name: 'field_slug',
      type: 'field_slug',
    },
    {
      title: 'Glossary Term Definition',
      name: 'block_glossaryTermDefinition',
      type: 'block_glossaryTermDefinition',
    },
  ],
  preview: {
    select: {
      title: 'field_glossaryTerm',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Home'),
      fallback: {},
    }
         const title = resolveValue("title", glossaryTermOverview.preview.select, x);         const subtitle = resolveValue("subtitle", glossaryTermOverview.preview.select, x);         const media = resolveValue("media", glossaryTermOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}