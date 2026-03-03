import {createElement} from "react";
import {FieldDescription} from "../../utils/FieldDescription.tsx";

export const field_emailLink = {
  name: 'field_emailLink',
  title: 'Email Link',
  description: createElement(FieldDescription,{description:"A clickable link that opens a new email in the users default email client. It must begin with 'mailto:'",example:'mailto:name@company.com'}),
  options: {
    collapsible: false,
  },
  validation: (R) => R.custom(async (_, ctx) => typeof ctx.type?.hidden === "function" && ctx.type.hidden(ctx) ? true : R["error"]().uri({ scheme: "mailto" }).validate(_, ctx).then((e) => e.length === 0 ? true : e[0].item?.message || "Invalid")),
  type: 'string',
}