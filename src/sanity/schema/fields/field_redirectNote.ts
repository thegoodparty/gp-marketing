import {createElement} from "react";
import {FieldDescription} from "../../utils/FieldDescription.tsx";

export const field_redirectNote = {
  name: 'field_redirectNote',
  title: 'Redirect Note',
  description: createElement(FieldDescription,{description:'An optional internal note to explain why this redirect exists.',example:"'Old campaign landing page' or 'Set during site migration'"}),
  options: {
    collapsible: false,
  },
  type: 'text',
}