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
