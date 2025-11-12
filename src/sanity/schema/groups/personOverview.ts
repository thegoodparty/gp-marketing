import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const personOverview = {
  title: 'Person Overview',
  name: 'personOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('User'),
  fields: [
    {
      title: 'Name',
      name: 'field_personName',
      type: 'field_personName',
    },
    {
      title: 'Job Title/Role',
      name: 'field_jobTitleOrRole',
      type: 'field_jobTitleOrRole',
    },
    {
      title: 'Short Bio',
      name: 'field_shortBio',
      type: 'field_shortBio',
    },
    {
      title: 'Profile Picture',
      name: 'img_profilePicture',
      type: 'img_profilePicture',
    },
  ],
  preview: {
    select: {
      title: 'field_personName',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('User'),
      fallback: {},
    }
         const title = resolveValue("title", personOverview.preview.select, x);         const subtitle = resolveValue("subtitle", personOverview.preview.select, x);         const media = resolveValue("media", personOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback["title"],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]().required().validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")),
}