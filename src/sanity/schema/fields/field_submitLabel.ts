import {createElement} from 'react';
import {FieldDescription} from '../../utils/FieldDescription.tsx';

export const field_submitLabel = {
  name: 'field_submitLabel',
  title: 'Submit button label',
  description: createElement(FieldDescription,{description:'Text shown on the form submit button. Leave empty to use the default ("Subscribe").',example:'Get Early Access'}),
  options: {
    collapsible: false,
  },
  type: 'string',
}
