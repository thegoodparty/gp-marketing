import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const seo = {
  title: 'SEO',
  name: 'seo',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Search'),
  fields: [
    {
      title: 'Meta Title',
      name: 'field_metaTitle',
      type: 'field_metaTitle',
    },
    {
      title: 'Meta Description',
      name: 'field_metaDescription',
      type: 'field_metaDescription',
    },
    {
      title: 'Open Graph (OG) Image',
      name: 'img_openGraphImage',
      type: 'img_openGraphImage',
    },
    {
      title: 'No Index',
      name: 'field_noIndex',
      type: 'field_noIndex',
    },
    {
      title: 'No follow',
      name: 'field_noFollow',
      type: 'field_noFollow',
    },
  ],
  preview: {
    select: {
      title: 'field_metaTitle',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Search'),
      fallback: {},
    }
         const title = resolveValue('title', seo.preview.select, x);         const subtitle = resolveValue('subtitle', seo.preview.select, x);         const media = resolveValue('media', seo.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}