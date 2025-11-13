
export const field_blogBlockContentOptions = {
  name: 'field_blogBlockContentOptions',
  title: 'Blog Block Content Options',
  description: 'Choose how you want to display articles',
  options: {
    collapsible: false,
    list: [
      {
        _key: 'b54ded0a57fc',
        _type: 'item',
        title: 'Latest by All',
        value: 'AllLatest',
      },
      {
        _key: 'd6e2c6cf1682',
        _type: 'item',
        title: 'Latest By Category',
        value: 'Category',
      },
      {
        _key: 'e9dad899272d',
        _type: 'item',
        title: 'Latest by Topic',
        value: 'Topic',
      },
    ],
  },
  initialValue: 'AllLatest',
  type: 'string',
}