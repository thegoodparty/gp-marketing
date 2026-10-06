export const field_filterQuotesByPageState = {
  name: 'field_filterQuotesByPageState',
  title: "Only show quotes from the page's state",
  description:
    "On election location and position pages, show the chosen quotes from the page's state first and fill the rest from the nearest states. Quotes with no state set come last. Pages that have no state, such as the Voter Hub, show the full list. Uses 'Max Number to Display' as the number of cards, or 3 when that is blank.",
  options: {
    collapsible: false,
  },
  initialValue: false,
  type: 'boolean',
}
