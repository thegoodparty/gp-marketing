import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const component_claimProfileBlock = {
  title: 'Claim Profile Block',
  name: 'component_claimProfileBlock',
  type: 'object',
  icon: getIcon('UserFollow'),
  fields: [
    {
      title: 'Content',
      name: 'claimProfileBlockContent',
      type: 'object',
      fields: [
        {
          title: 'Headline',
          name: 'field_headline',
          type: 'string',
          description: 'Main heading for the claim profile block',
        },
        {
          title: 'Body',
          name: 'field_body',
          type: 'text',
          description: 'Body text explaining what to do',
        },
        {
          title: 'Example Card',
          name: 'exampleCard',
          type: 'object',
          description: 'Example candidate profile card',
          fields: [
            {
              title: 'Name',
              name: 'field_name',
              type: 'string',
              description: 'Candidate name',
            },
            {
              title: 'Public Office',
              name: 'field_partyAffiliation',
              type: 'string',
              description: 'Current or seeking public office position (e.g., City Council Member, School Board Trustee)',
            },
            {
              title: 'Secondary Text',
              name: 'field_secondaryText',
              type: 'string',
              description: 'Additional information',
            },
            {
              title: 'Show Badge',
              name: 'field_showBadge',
              type: 'boolean',
              description: 'Display verification badge',
              initialValue: true,
            },
          ],
        },
      ],
      group: 'claimProfileBlockContent',
    },
    {
      title: 'CTA',
      name: 'ctaAction',
      type: 'ctaActionWithShared',
      group: 'ctaAction',
    },
    {
      title: 'Design Settings',
      name: 'claimProfileBlockDesignSettings',
      type: 'object',
      fields: [
        {
          title: 'Background Color',
          name: 'field_blockColorCreamMidnight',
          type: 'string',
          options: {
            list: [
              { title: 'Cream', value: 'cream' },
              { title: 'Midnight', value: 'midnight' },
            ],
          },
          initialValue: 'cream',
        },
      ],
      group: 'claimProfileBlockDesignSettings',
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
      title: 'claimProfileBlockContent.field_headline',
      _type: '_type',
    },
    prepare: x => {
      const infer = {
        singletonTitle: null,
        icon: getIcon('UserFollow'),
        fallback: {
          previewTitle: 'claimProfileBlockContent.field_headline',
          previewSubTitle: '*Claim Profile Block',
          title: 'Claim Profile Block',
        },
      };
      const title = resolveValue('title', component_claimProfileBlock.preview.select, x);
      const subtitle = resolveValue('subtitle', component_claimProfileBlock.preview.select, x);
      const media = resolveValue('media', component_claimProfileBlock.preview.select, x);
      return handleReplacements({
        title: infer.singletonTitle || title || undefined,
        subtitle: subtitle ? subtitle : infer.fallback['title'],
        media: media || infer.icon
      }, x, infer.fallback);
    },
  },
  groups: [
    {
      title: 'Content',
      name: 'claimProfileBlockContent',
      icon: getIcon('Text'),
    },
    {
      title: 'CTA',
      name: 'ctaAction',
      icon: getIcon('Rocket'),
    },
    {
      title: 'Design Settings',
      name: 'claimProfileBlockDesignSettings',
      icon: getIcon('ColorPalette'),
    },
    {
      title: 'Settings',
      name: 'componentSettings',
      icon: getIcon('Settings'),
    },
  ],
};
