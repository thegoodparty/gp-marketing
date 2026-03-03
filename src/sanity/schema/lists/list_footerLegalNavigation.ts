
export const list_footerLegalNavigation = {
  name: 'list_footerLegalNavigation',
  title: 'Footer Legal Navigation',
  description: "Small links displayed in the footer of the website. e.g. 'Privacy Policy'",
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
  ],
}