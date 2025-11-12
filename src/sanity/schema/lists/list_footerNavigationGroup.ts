
export const list_footerNavigationGroup = {
  name: 'list_footerNavigationGroup',
  title: 'Footer Navigation Group',
  description: 'The links to display in the group.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      title: 'External Link',
      type: 'externalLink',
    },
    {
      title: 'Internal Link',
      type: 'internalLink',
    },
  ],
}