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
      <section className="px-5 sm:px-10 xl:px-20 2xl:px-[clamp(20px,4vw,160px)] py-8 sm:py-16 xl:py-32">
        <div className="mx-auto w-full max-w-[1218px]">
          <div className="grid gap-8 lg:grid-cols-2 w-full">
            {cards.map((card, index) => (
              <CTACard key={index} {...card} />
            ))}
          </div>
        </div>
      </section>
    )
  )
}
