import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const HERO_INTRO_DEFAULT =
  'A nonpartisan guide to [office name] in [County or City]. Find candidates and elected officials who have turned down partisan and big-money influence.';

export const HERO_INTRO_PRE_FILING_DEFAULT =
  'A nonpartisan guide to [office name] in [County or City]. Learn the requirements to run for office near you.';

export const component_electionsPositionHero = {
  title: 'Elections Position Hero',
  name: 'component_electionsPositionHero',
  description:
    'Hero for Position Pages. Shows one of five phases (pre-filing, filing open, mid-election, results pending, decided) chosen from the race dates and results, never by hand. Before filing opens the heading reads "How to run for [office] in [place]" and has its own intro sentence. Sanity controls the two intro sentences and the design settings.',
  type: 'object',
  icon: getIcon('Rocket'),
  fields: [
    {
      title: 'Intro',
      name: 'field_intro',
      type: 'string',
      description:
        'The sentence under the heading from the day filing opens onward. Supports [office name], [County or City], [State] and [location] tokens.',
      initialValue: HERO_INTRO_DEFAULT,
      group: 'content',
    },
    {
      title: 'Intro before filing opens',
      name: 'field_introPreFiling',
      type: 'string',
      description:
        'The sentence under the "How to run for" heading while the page is pre-filing, before the filing window opens. Supports the same tokens.',
      initialValue: HERO_INTRO_PRE_FILING_DEFAULT,
      group: 'content',
    },
    {
      title: 'CTA',
      name: 'ctaAction',
      type: 'ctaActionWithShared',
      group: 'ctaAction',
      hidden: true,
      deprecated: {
        reason: 'The redesigned hero has no standalone button; its links live inside the cards and come from the race data.',
      },
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
      title: 'Content',
      name: 'content',
      icon: getIcon('FileText'),
    },
    {
      title: 'CTA',
      name: 'ctaAction',
      icon: getIcon('Rocket'),
      hidden: true,
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
