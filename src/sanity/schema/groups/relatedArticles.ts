import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const relatedArticles = {
  title: 'Related Articles',
  name: 'relatedArticles',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('ChartRelationship'),
  fields: [
    {
      title: 'Sticky Related Article',
      name: 'ref_stickyRelatedArticle',
      type: 'ref_stickyRelatedArticle',
    },
    {
      title: 'Related Articles',
      name: 'list_relatedArticles',
      type: 'list_relatedArticles',
    },
  ],
  preview: {
    select: {
      ref: 'ref_stickyRelatedArticle._ref',
      type: 'ref_stickyRelatedArticle._type',
      subtitle: 'list_relatedContent',
    },
    prepare: x => {
const infer = {
      name: 'Sticky Related Article',
      singletonTitle: null,
      icon: getIcon('ChartRelationship'),
      fallback: {
        previewTitle: '*Related Articles',
        previewSubTitle: 'list_relatedContent',
        title: 'Related Articles',
      },
    }
           const vtype = x.type;           const title = resolveValue('title', relatedArticles.preview.select, x);           const subtitle = resolveValue('subtitle', relatedArticles.preview.select, x);           const media = resolveValue('media', relatedArticles.preview.select, x);           const restitle = vtype in x ? x[vtype] : title;           return handleReplacements({             title: infer.singletonTitle || restitle || infer.name,             subtitle: subtitle ? subtitle : infer.fallback['title'],             media: media || infer.icon           }, x, infer.fallback);         },
  },
}