
export const list_socialChannels = {
  name: 'list_socialChannels',
  title: 'Social Channels',
  description: 'List of platforms for social interaction and content sharing.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      title: 'Social Channel',
      type: 'socialChannel',
    },
  ],
}