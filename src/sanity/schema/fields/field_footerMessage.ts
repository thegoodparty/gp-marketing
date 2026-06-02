import {createElement} from 'react';
import {FieldDescription} from '../../utils/FieldDescription.tsx';

export const field_footerMessage = {
  name: 'field_footerMessage',
  title: 'Footer Message',
  description: createElement(FieldDescription,{description:'A message to display in the footer.',example:"Not a political party. We're building free tools to change the rules, so good independent candidates can run and win!"}),
  options: {
    collapsible: false,
  },
  type: 'text',
}