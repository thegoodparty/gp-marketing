
export const list_primaryNavigation = {
  name: 'list_primaryNavigation',
  title: 'Primary Navigation',
  description: 'The primary navigation for this website.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      title: 'Internal Link',
      type: 'internalLink',
    },
    {
      title: 'External Link',
      type: 'externalLink',
    },
    {
      title: 'Nav Group',
      type: 'navigationGroup',
    },
  ],
}