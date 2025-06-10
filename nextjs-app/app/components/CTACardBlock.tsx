import React from 'react'
import CTACard from './CTACard'
import { LinkTarget } from '../types/ui'

interface CTACardBlockProps {
  block: {
    cards?: Array<{
      overline?: string
      heading: string
      backgroundColor: string
      url: string
      icon?: string
      linkTarget?: LinkTarget
    }>
  }
}

export default function CTACardBlock({ block }: CTACardBlockProps) {
  const { cards } = block

  return (
    cards &&
    cards.length > 0 && (
      <section className="px-5 lg:px-20 py-12 lg:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {cards.map((card, index) => (
              <CTACard key={index} {...card} />
            ))}
          </div>
        </div>
      </section>
    )
  )
}
