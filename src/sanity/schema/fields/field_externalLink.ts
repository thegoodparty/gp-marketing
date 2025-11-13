import {createElement} from "react";
import {FieldDescription} from "../../utils/FieldDescription.tsx";

export const field_externalLink = {
  name: 'field_externalLink',
  title: 'External Link',
  description: createElement(FieldDescription,{description:'A clickable link directing to an external resource.',example:'https://www.example.com'}),
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]().uri({ scheme: "https" }).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")),
  type: 'string',
}