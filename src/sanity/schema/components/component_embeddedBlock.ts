import { getIcon } from '../../utils/getIcon.tsx';

export const component_embeddedBlock = {
  title: 'Embedded Block',
  name: 'component_embeddedBlock',
  type: 'object',
  icon: getIcon('Code'),
  fields: [
    {
      title: 'Embed Code',
      name: 'field_embedCode',
      description: 'Paste the full embed HTML code (iframes, Navattic, HubSpot, Calendly, etc.).',
      type: 'text',
      rows: 8,
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'Height (px)',
      name: 'field_embedHeight',
      description: 'Height of the embed in pixels. Ignored when "Full Page" is enabled. Defaults to 900.',
      type: 'number',
      initialValue: 900,
      validation: (Rule: any) => Rule.min(100).max(5000),
    },
    {
      title: 'Full Page',
      name: 'field_embedFullPage',
      description: 'When enabled, the embed fills the available viewport height.',
      type: 'boolean',
      initialValue: false,
    },
    {
      title: 'Max Width',
      name: 'field_embedMaxWidth',
      description: 'Controls the maximum width of the embed container.',
      type: 'string',
      options: {
        list: [
          { title: 'Full (no max)', value: 'unset' },
          { title: 'Extra Large', value: 'xl' },
          { title: 'Large', value: 'lg' },
          { title: 'Medium', value: 'md' },
        ],
        layout: 'radio',
      },
      initialValue: 'xl',
    },
  ],
  preview: {
    select: {
      title: 'field_embedCode',
    },
    prepare(selection: { title?: string }) {
      return {
        title: selection.title?.slice(0, 80) || 'Embedded Block',
        subtitle: 'Embedded Block',
        media: getIcon('Code'),
      };
    },
  },
};
