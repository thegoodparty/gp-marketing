import {ImgField} from '../../utils/ImgField.tsx';
import {ImagePromptField} from '../../utils/ImagePromptField.tsx';

export const img_fallbackImage = {
  name: 'img_fallbackImage',
  title: 'Fallback Image',
  description: "An alternative image displayed when the primary asset can't be loaded.",
  options: {
    hotspot: true,
    aiAssist: {
      imageInstructionField: 'promptForImage',
      imageDescriptionField: 'alt',
    },
  },
  type: 'image',
  fields: [
    {
      type: 'text',
      name: 'alt',
      title: 'Alternative text',
      rows: 2,
      hidden: (x) => typeof x.parent?.asset === 'undefined' && !x.value,
    },
    {
      type: 'text',
      name: 'promptForImage',
      title: 'Image prompt',
      description: 'The field action `Generate image from prompt` will create an AI image from the following input',
      rows: 2,
      hidden: (x) => typeof x.value !== 'string',
      components: {
        field: ImagePromptField,
      },
    },
  ],
  components: {
    field: ImgField,
  },
}