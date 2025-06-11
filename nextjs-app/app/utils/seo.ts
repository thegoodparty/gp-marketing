export function generateFaqJsonLd(
  items: { question: string; answer: string }[],
  title: string,
) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: title,
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.answer,
      },
    })),
  })
}
