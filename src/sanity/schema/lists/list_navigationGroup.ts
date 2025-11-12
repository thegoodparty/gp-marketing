
export const list_navigationGroup = {
  name: 'list_navigationGroup',
  title: 'Navigation Group',
  description: 'The links to display in the group.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      title: 'External Link',
      type: 'externalLinkWithIcon',
    },
    {
      title: 'Internal Link',
      type: 'internalLinkWithIcon',
    },
  ],
}