import {createElement} from 'react';
import {FieldDescription} from '../../utils/FieldDescription.tsx';

export const field_defaultMetaTitle = {
  name: 'field_defaultMetaTitle',
  title: 'Default Meta Title',
  description: createElement(FieldDescription,{description:'The default Meta Title to display for this site. Typically displayed directly after the Page Title.',example:'Page Meta Title | Default Meta Title'}),
  options: {
    collapsible: false,
    search: {
      weight: 8,
    },
  },
  type: 'string',
}