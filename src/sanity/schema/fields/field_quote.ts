import type { Rule } from 'sanity';

export const field_quote = {
  name: 'field_quote',
  title: 'Quote',
  description: 'A short extract from a text, used for reference or citation.',
  options: {
    collapsible: false,
  },
  validation: (Rule: Rule) =>
    Rule.required().custom((value) =>
      typeof value === 'string' && value.trim().length > 0 ? true : 'Quote text is required',
    ),
  type: 'text',
}