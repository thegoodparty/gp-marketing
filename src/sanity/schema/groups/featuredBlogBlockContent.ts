import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const featuredBlogBlockContent = {
  title: 'Featured Blog Block Content',
  name: 'featuredBlogBlockContent',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('Blog'),
  fields: [
    {
      title: 'Choose article',
      name: 'ref_chooseArticle',
      type: 'ref_chooseArticle',
    },
  ],
  preview: {
    select: {
      ref: 'ref_chooseArticle._ref',
      type: 'ref_chooseArticle._type',
      article: 'ref_chooseArticle.field_editorialTitle',
    },
    prepare: x => {
const infer = {
      name: 'Choose article',
      singletonTitle: null,
      icon: getIcon('Blog'),
      fallback: {},
    }
           const vtype = x.type;           const title = resolveValue('title', featuredBlogBlockContent.preview.select, x);           const subtitle = resolveValue('subtitle', featuredBlogBlockContent.preview.select, x);           const media = resolveValue('media', featuredBlogBlockContent.preview.select, x);           const restitle = vtype in x ? x[vtype] : title;           return handleReplacements({             title: infer.singletonTitle || restitle || infer.name,             subtitle: subtitle ? subtitle : infer.fallback['title'],             media: media || infer.icon           }, x, infer.fallback);         },
  },
}