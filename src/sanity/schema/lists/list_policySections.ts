
export const list_policySections = {
  name: 'list_policySections',
  title: 'Policy Sections',
  description: 'Outlines various sections of the policy document.',
  options: {
    collapsible: false,
  },
  type: 'array',
  of: [
    {
      title: 'Policy Section',
      type: 'policySection',
    },
  ],
}