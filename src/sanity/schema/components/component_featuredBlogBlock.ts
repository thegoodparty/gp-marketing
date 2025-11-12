import {resolveValue} from "../../utils/resolveValue.ts";
import {handleReplacements} from "../../utils/handleReplacements.ts";
import {getIcon} from "../../utils/getIcon.tsx";

export const component_featuredBlogBlock = {
  title: 'Featured Blog Block',
  name: 'component_featuredBlogBlock',
  type: 'object',
  icon: getIcon('StarReview'),
  fields: [
    {
      title: 'Content',
      name: 'featuredBlogBlockContent',
      type: 'featuredBlogBlockContent',
      group: 'featuredBlogBlockContent',
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      type: 'componentSettings',
      group: 'componentSettings',
    },
  ],
  preview: {
    select: {
      ref: 'ref_chooseArticle._ref',
      type: 'ref_chooseArticle._type',
      article: 'featuredBlogBlockContent.ref_chooseArticle.editorialOverview.field_editorialTitle',
      title: 'featuredBlogBlockContent.ref_chooseArticle.editorialOverview.field_editorialTitle',
      media: 'featuredBlogBlockContent.ref_chooseArticle.editorialAssets.img_featuredImage',
    },
    prepare: x => {
const infer = {
      name: 'Choose article',
      singletonTitle: null,
      icon: getIcon('Blog'),
      fallback: {
        previewTitle: 'featuredBlogBlockContent.ref_chooseArticle.editorialOverview.field_editorialTitle',
        previewSubTitle: '*Featured Blog Block',
        previewMedia: 'featuredBlogBlockContent.ref_chooseArticle.editorialAssets.img_featuredImage',
        title: 'Featured Blog Block',
      },
    }
           const vtype = x.type;           const title = resolveValue("title", component_featuredBlogBlock.preview.select, x);           const subtitle = resolveValue("subtitle", component_featuredBlogBlock.preview.select, x);           const media = resolveValue("media", component_featuredBlogBlock.preview.select, x);           const restitle = vtype in x ? x[vtype] : title;           return handleReplacements({             title: infer.singletonTitle || restitle || infer.name,             subtitle: subtitle ? subtitle : infer.fallback["title"],             media: media || infer.icon           }, x, infer.fallback);         },
  },
  groups: [
    {
      title: 'Content',
      name: 'featuredBlogBlockContent',
      icon: getIcon('Blog'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}