import {createElement} from "react";
import {FieldDescription} from "../../utils/FieldDescription.tsx";

export const field_toUrl = {
  name: 'field_toUrl',
  title: 'To URL',
  description: createElement(FieldDescription,{description:'The destination path you want to redirect to (e.g. /about-us). This must start with a forward slash and should not include the domain.',example:'/about-us'}),
  options: {
    collapsible: false,
  },
  type: 'string',
}