
export const list_footerNavigation = {
  name: 'list_footerNavigation',
  title: 'Footer Navigation',
  description: 'Links displayed in the footer of the website.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      title: 'Nav Group',
      type: 'footerNavigationGroup',
    },
  ],
}