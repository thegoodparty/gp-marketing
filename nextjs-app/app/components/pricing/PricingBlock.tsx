import React from 'react'
import {
  BackgroundTheme,
  BACKGROUND_COLOR_MAP,
} from '../../types/design-tokens'
import { Alignment } from '../../types/ui'
import { BlockHeaderSection } from '../BlockHeaderSection'
import { PricingCard, type PricingCardPlan } from './PricingCard'
import styles from './PricingBlock.module.css'

interface PricingBlockProps {
  block: {
    header?: Parameters<typeof BlockHeaderSection>[0]['header']
    layout: 'threeColumn' | 'twoColumn'
    plans: PricingCardPlan[]
    backgroundTheme?: BackgroundTheme
  }
  index: number
}

export default function PricingBlock({ block }: PricingBlockProps) {
  const { header, plans } = block
  const backgroundTheme = block.backgroundTheme || BackgroundTheme.DARK
  const bgColor = BACKGROUND_COLOR_MAP[backgroundTheme]

  return (
    <section
      className="py-20 px-5 sm:px-10 xl:px-20 2xl:px-[clamp(20px,4vw,160px)]"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto w-full max-w-[1376px]">
        {header && (
          <BlockHeaderSection
            header={header}
            backgroundColor={backgroundTheme}
            headerAlignment={Alignment.CENTER}
          />
        )}

        {plans && plans.length > 0 && (
          <div
            className={`${styles.pricingGrid} ${plans.length === 2 ? styles.twoCards : styles.threeCards} mt-12`}
          >
            {plans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
