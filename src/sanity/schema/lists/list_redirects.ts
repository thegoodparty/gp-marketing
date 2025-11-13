
export const list_redirects = {
  name: 'list_redirects',
  title: 'Redirects',
  description: 'A list of URLs that redirect to other pages ',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      title: 'Redirects',
      type: 'redirectItem',
    },
  ],
}