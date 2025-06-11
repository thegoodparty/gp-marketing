import React from 'react'
import { Alignment } from '../types/ui'
import { BackgroundTheme } from '../types/design-tokens'
import { BlockHeaderSection } from './BlockHeaderSection'
import Accordion from './Accordion'

interface FaqBlockProps {
  block: {
    heading: string
    subhead?: string
    button?: {
      label: string
      url: string
      icon?: string
    }
    items: Array<{
      question: string
      answer: string
    }>
  }
  index?: number
}

export default function FAQBlock({ block }: FaqBlockProps) {
  const { heading, subhead, button, items } = block

  // Fallback to ensure at least one item exists per validation rules
  if (!items || items.length === 0) return null

  return (
    <section
      className="px-6 py-16 md:p-20"
      style={{ backgroundColor: 'var(--color-gp-cream)' }}
    >
      <div className="mx-auto max-w-7xl flex flex-col gap-8 md:flex-row md:gap-24">
        {/* Sidebar */}
        <div className="md:w-1/3">
          <BlockHeaderSection
            header={{ heading, subhead, primaryButton: button }}
            backgroundColor={BackgroundTheme.CREME}
            headerAlignment={Alignment.LEFT}
          />
        </div>

        {/* FAQ Accordions */}
        <div className="md:flex-1 flex flex-col gap-4 max-w-[800px]">
          {items.map((item, idx) => (
            <Accordion
              key={`faq-${idx}`}
              question={item.question}
              answer={item.answer}
              defaultOpen={idx === 0}
            />
          ))}
        </div>
      </div>

      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateFaqJsonLd(items, heading),
        }}
      />
    </section>
  )
}

function generateFaqJsonLd(
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
