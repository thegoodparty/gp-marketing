import {ImgField} from '../../utils/ImgField.tsx';
import {ImagePromptField} from '../../utils/ImagePromptField.tsx';

export const img_image = {
  name: 'img_image',
  title: 'Image',
  description: 'Visual representation or illustration for content',
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