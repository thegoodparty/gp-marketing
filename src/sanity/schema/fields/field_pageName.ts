import {createElement} from 'react';
import {FieldDescription} from '../../utils/FieldDescription.tsx';

export const field_pageName = {
  name: 'field_pageName',
  title: 'Page Name',
  description: createElement(FieldDescription,{description:'A short descriptive name for the page.',example:'Home'}),
  options: {
    collapsible: false,
    search: {
      weight: 9,
    },
  },
  type: 'string',
}