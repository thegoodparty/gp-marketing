import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const goodpartyOrg_footer = {
  title: 'Footer',
  name: 'goodpartyOrg_footer',
  type: 'document',
  icon: getIcon('AlignBoxBottomCenter'),
  fields: [
    {
      title: 'Footer',
      name: 'footer',
      type: 'footer',
    },
  ],
  preview: {
    select: {
      list: 'list_footerNavigation',
    },
    prepare: x => {
const infer = {
      name: 'Footer Navigation',
      singletonTitle: null,
      icon: getIcon('AlignBoxBottomCenter'),
      fallback: {
        previewTitle: '*Footer',
        title: 'Footer',
      },
    }
           const title = resolveValue('title', goodpartyOrg_footer.preview.select, x);           const subtitle = resolveValue('subtitle', goodpartyOrg_footer.preview.select, x);           const media = resolveValue('media', goodpartyOrg_footer.preview.select, x);           return handleReplacements({             title: infer.singletonTitle || title || infer.name,             subtitle: subtitle || x.list?.length && x.list.length === 1 ? '1 item' : x.list?.length > 0 ? `${x.list.length} items` : 'No items',             media: media || infer.icon           }, x, infer.fallback);         },
  },
  options: {
    channels: {},
    single: true,
  },
}