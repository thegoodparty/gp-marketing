import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const loggedOutCtAs = {
  title: 'Logged Out CTAs',
  name: 'loggedOutCtAs',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Rocket'),
  fields: [
    {
      title: 'Primary CTA',
      name: 'ref_navigationPrimaryCTA',
      type: 'ref_navigationPrimaryCTA',
    },
    {
      title: 'Secondary CTA',
      name: 'ref_navigationSecondaryCTA',
      type: 'ref_navigationSecondaryCTA',
    },
  ],
  preview: {
    select: {
      ref: 'ref_navigationPrimaryCTA._ref',
      type: 'ref_navigationPrimaryCTA._type',
      cTAs: 'ref_navigationPrimaryCTA.field_ctaInternalName',
    },
    prepare: x => {
const infer = {
      name: 'Navigation Primary CTA',
      singletonTitle: null,
      icon: getIcon('Rocket'),
      fallback: {},
    }
           const vtype = x.type;           const title = resolveValue("title", loggedOutCtAs.preview.select, x);           const subtitle = resolveValue("subtitle", loggedOutCtAs.preview.select, x);           const media = resolveValue("media", loggedOutCtAs.preview.select, x);           const restitle = vtype in x ? x[vtype] : title;           return handleReplacements({             title: infer.singletonTitle || restitle || infer.name,             subtitle: subtitle ? subtitle : infer.fallback["title"],             media: media || infer.icon           }, x, infer.fallback);         },
  },
}