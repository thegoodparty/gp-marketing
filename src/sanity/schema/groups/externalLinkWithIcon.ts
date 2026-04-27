import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const externalLinkWithIcon = {
  title: 'External Link With Icon',
  name: 'externalLinkWithIcon',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Launch'),
  fields: [
    {
      title: 'Link Icon',
      name: 'field_linkIcon',
      type: 'field_linkIcon',
    },
    {
      title: 'Link Text',
      name: 'field_linkText',
      type: 'field_linkText',
    },
    {
      title: 'External Link',
      name: 'field_externalLink',
      type: 'field_externalLink',
    },
  ],
  preview: {
    select: {
      title: 'field_linkText',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Launch'),
      fallback: {
        previewTitle: 'field_linkText',
        previewSubTitle: '*External Link',
        title: 'External Link With Icon',
      },
    }
         const title = resolveValue('title', externalLinkWithIcon.preview.select, x);         const subtitle = resolveValue('subtitle', externalLinkWithIcon.preview.select, x);         const media = resolveValue('media', externalLinkWithIcon.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}