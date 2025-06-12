import React from 'react'
import { Alignment } from '../types/ui'
import { BackgroundTheme } from '../types/design-tokens'
import { BlockHeaderSection } from './BlockHeaderSection'
import Accordion from './Accordion'
import { generateFaqJsonLd } from '../utils/seo'
import JsonLd from '../shared/utility/JsonLd'

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

  return (
    <section
      className="px-5 md:px-10 xl:px-20 2xl:px-[clamp(20px,4vw,160px)] py-8 sm:py-16 xl:py-32"
      style={{ backgroundColor: 'var(--color-gp-cream)' }}
    >
      <div className="mx-auto w-full max-w-[1376px] flex flex-col gap-12 lg:flex-row lg:gap-12">
        <div className="lg:w-1/3">
          <BlockHeaderSection
            header={{ heading, subhead, primaryButton: button }}
            backgroundColor={BackgroundTheme.CREME}
            headerAlignment={Alignment.LEFT}
          />
        </div>

        <div className="lg:flex-1 flex flex-col gap-4 max-w-[800px]">
          {items &&
            items.length > 0 &&
            items.map((item, idx) => (
              <Accordion
                key={`faq-${idx}`}
                question={item.question}
                answer={item.answer}
                defaultOpen={idx === 0}
              />
            ))}
        </div>
      </div>

      <JsonLd json={generateFaqJsonLd(items, heading)} />
    </section>
  )
}
