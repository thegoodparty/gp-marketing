import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_electionsPositionHero = {
  title: 'Elections Position Hero',
  name: 'component_electionsPositionHero',
  description: 'Hero section for Position Pages displaying office position information.',
  type: 'object',
  icon: getIcon('Rocket'),
  fields: [
    {
      title: 'CTA',
      name: 'ctaAction',
      type: 'ctaActionWithShared',
      group: 'ctaAction',
    },
    {
      title: 'Design Settings',
      name: 'electionsPositionHeroDesignSettings',
      type: 'electionsPositionHeroDesignSettings',
      group: 'electionsPositionHeroDesignSettings',
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
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('Rocket'),
      fallback: {
        previewTitle: '*Elections Position Hero',
        previewSubTitle: '*Elections Position Hero',
        title: 'Elections Position Hero',
      },
    }
         const title = resolveValue('title', component_electionsPositionHero.preview.select, x);         const subtitle = resolveValue('subtitle', component_electionsPositionHero.preview.select, x);         const media = resolveValue('media', component_electionsPositionHero.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
  groups: [
    {
      title: 'CTA',
      name: 'ctaAction',
      icon: getIcon('Rocket'),
    },
    {
      title: 'Design Settings',
      name: 'electionsPositionHeroDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
}
