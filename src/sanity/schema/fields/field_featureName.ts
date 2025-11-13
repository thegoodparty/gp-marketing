import {createElement} from "react";
import {FieldDescription} from "../../utils/FieldDescription.tsx";

export const field_featureName = {
  name: 'field_featureName',
  title: 'Feature Name',
  description: createElement(FieldDescription,{description:'The primary title of the feature',example:'Campaign Tracker'}),
  options: {
    collapsible: false,
    search: {
      weight: 9,
    },
  },
  type: 'string',
}