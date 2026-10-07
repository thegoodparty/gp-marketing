import { resolveValue } from '../../utils/resolveValue.ts';
import { handleReplacements } from '../../utils/handleReplacements.ts';
import { getIcon } from '../../utils/getIcon.tsx';
import { PROFILE_HERO_INTRO_DEFAULTS } from '../../../lib/profileHeroDefaults.ts';

export const component_profileHero = {
  title: 'Profile Hero',
  name: 'component_profileHero',
  description: 'Hero section for profile pages displaying candidate information.',
  type: 'object',
  icon: getIcon('User'),
  fields: [
    {
      title: 'Text',
      name: 'profileHeroContent',
      type: 'object',
      fields: [
        {
          title: 'Intro for candidates',
          name: 'field_introCandidates',
          type: 'text',
          rows: 4,
          description:
            'The paragraph under the name and office on a candidate’s profile. [candidate name] is replaced with the person’s name. Leave empty to use the default wording.',
          initialValue: PROFILE_HERO_INTRO_DEFAULTS.candidate,
        },
        {
          title: 'Intro for elected officials',
          name: 'field_introOfficeholders',
          type: 'text',
          rows: 4,
          description:
            'The same paragraph on the profile of someone who holds or held office. [candidate name] is replaced with the person’s name. Leave empty to use the default wording.',
          initialValue: PROFILE_HERO_INTRO_DEFAULTS.officeholder,
        },
      ],
      group: 'profileHeroContent',
    },
    {
      title: 'Design Settings',
      name: 'profileHeroDesignSettings',
      type: 'object',
      fields: [
        {
          title: 'Background Color',
          name: 'field_blockColorCreamMidnight',
          type: 'string',
          options: {
            list: [
              { title: 'Cream', value: 'Cream' },
              { title: 'Midnight', value: 'MidnightDark' },
            ],
          },
          initialValue: 'MidnightDark',
        },
      ],
      group: 'profileHeroDesignSettings',
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
        icon: getIcon('User'),
        fallback: {
          previewTitle: '*Profile Hero',
          previewSubTitle: '*Profile Hero',
          title: 'Profile Hero',
        },
      };
      const title = resolveValue('title', component_profileHero.preview.select, x);
      const subtitle = resolveValue('subtitle', component_profileHero.preview.select, x);
      const media = resolveValue('media', component_profileHero.preview.select, x);
      return handleReplacements({
        title: infer.singletonTitle || title || undefined,
        subtitle: subtitle ? subtitle : infer.fallback['title'],
        media: media || infer.icon
      }, x, infer.fallback);
    },
  },
  groups: [
    {
      title: 'Text',
      name: 'profileHeroContent',
      icon: getIcon('Text'),
    },
    {
      title: 'Design Settings',
      name: 'profileHeroDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
};
