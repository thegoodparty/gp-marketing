import {createElement} from 'react';
import {FieldDescription} from '../../utils/FieldDescription.tsx';

export const field_fromUrl = {
  name: 'field_fromUrl',
  title: 'From URL',
  description: createElement(FieldDescription,{description:'The full path of the old URL you want to redirect from (e.g. /about-us-old). This must start with a forward slash and should not include the domain.',example:'/about-us-old'}),
  options: {
    collapsible: false,
  },
  type: 'string',
}