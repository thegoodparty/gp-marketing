import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const HERO_INTRO_DEFAULTS = {
  filing: "Filing is open for this race. See what it takes to run, or find out who's already on the ballot.",
  midElection: "Everything you need to know about this race. See who's running, who holds the seat, and how to run yourself.",
  decided: 'This race has been decided. See who won and what comes next.',
} as const;

export const component_electionsPositionHero = {
  title: 'Elections Position Hero',
  name: 'component_electionsPositionHero',
  description:
    'Hero for Position Pages. Shows one of four states (filing, mid-election, decided, decided with several winners) chosen from the race dates and results, never by hand. Sanity controls the intro sentence per state and the design settings.',
  type: 'object',
  icon: getIcon('Rocket'),
  fields: [
    {
      title: 'Intro while filing is open',
      name: 'field_filingIntro',
      type: 'string',
      description: 'Shown from six months before the filing window opens until the filing deadline. Supports [office name] and location tokens.',
      initialValue: HERO_INTRO_DEFAULTS.filing,
      group: 'content',
    },
    {
      title: 'Intro during the election',
      name: 'field_midElectionIntro',
      type: 'string',
      description: 'Shown after the filing deadline until results are in. Supports [office name] and location tokens.',
      initialValue: HERO_INTRO_DEFAULTS.midElection,
      group: 'content',
    },
    {
      title: 'Intro once the race is decided',
      name: 'field_decidedIntro',
      type: 'string',
      description: 'Shown once we know who won. Supports [office name] and location tokens.',
      initialValue: HERO_INTRO_DEFAULTS.decided,
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
