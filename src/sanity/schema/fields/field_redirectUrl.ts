import {createElement} from 'react';
import {FieldDescription} from '../../utils/FieldDescription.tsx';

export const field_redirectUrl = {
  name: 'field_redirectUrl',
  title: 'Redirect URL (after submit)',
  description: createElement(FieldDescription,{description:'Relative path to redirect to after a successful form submission. Leave empty to show an inline success message.',example:'/waitlist-thank-you'}),
  options: {
    collapsible: false,
  },
  type: 'string',
}
