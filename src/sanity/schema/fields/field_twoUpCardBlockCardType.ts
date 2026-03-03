
export const field_twoUpCardBlockCardType = {
  name: 'field_twoUpCardBlockCardType',
  title: 'Two Up Card Block Card Type',
  description: "Choose what type of card you'd like to display.",
  options: {
    collapsible: false,
    list: [
      {
        _key: '102ebd5ede67',
        _type: 'item',
        title: 'Value Proposition Card',
        value: 'ValueProposition',
      },
      {
        _key: 'f21222b68f73',
        _type: 'item',
        title: 'Testimonial Card',
        value: 'Quote',
      },
      {
        _key: 'b42fd57d16e9',
        _type: 'item',
        title: 'Image',
        value: 'Image',
      },
    ],
  },
  initialValue: 'ValueProposition',
  type: 'string',
}