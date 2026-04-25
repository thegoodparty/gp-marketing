
export const list_usMapStateItems = {
  name: 'list_usMapStateItems',
  title: 'State Configurations',
  description: 'Configure color and hover info for individual states. States not listed will use the default color.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      title: 'State',
      type: 'usMapStateItem',
    },
  ],
}
