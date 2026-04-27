import {createElement} from 'react';
import {FieldDescription} from '../../utils/FieldDescription.tsx';

export const field_hubspotFormId = {
  name: 'field_hubspotFormId',
  title: 'Hubspot Form ID',
  description: createElement(FieldDescription,{description:'Unique ID for your Hubspot form.',example:'12345-abcde'}),
  options: {
    collapsible: false,
  },
  type: 'string',
}