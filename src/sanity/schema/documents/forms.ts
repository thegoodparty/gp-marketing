import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const forms = {
  title: 'Forms',
  name: 'forms',
  description: 'Configurations and data for using forms in the system.',
  type: 'document',
  icon: getIcon('DataBase'),
  fields: [
    {
      title: 'Overview',
      name: 'formOverview',
      type: 'formOverview',
    },
  ],
  preview: {
    select: {
      title: 'formOverview.field_formNameInternal',
      _type: '_type',
      subtitle: 'formOverview.field_formProvider',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('DataBase'),
      fallback: {
        previewTitle: 'formOverview.field_formNameInternal',
        previewSubTitle: 'formOverview.field_formProvider',
        title: 'Forms',
      },
    }
         const title = resolveValue('title', forms.preview.select, x);         const subtitle = resolveValue('subtitle', forms.preview.select, x);         const media = resolveValue('media', forms.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  options: {
    channels: {},
    single: false,
  },
}