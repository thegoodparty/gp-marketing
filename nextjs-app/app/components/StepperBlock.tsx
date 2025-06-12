import React from 'react'
import { StepperCard, StepperCardData } from './StepperCard'
import { BackgroundTheme } from '../types/design-tokens'
import { BlockHeaderSection } from './BlockHeaderSection'
import { Alignment } from '../types/ui'
import { getLinkUrl } from '../utils/sanity'

interface StepperBlockProps {
  block: {
    blockHeader?: StepperCardData['cardHeader']
    steps: Array<{
      index: number
      cardHeader: StepperCardData['cardHeader']
      image?: StepperCardData['image']
      iconList?: string[]
      iconContainerColor: StepperCardData['iconContainerColor']
    }>
  }
  index: number
}

export default function StepperBlock({ block }: StepperBlockProps) {
  const header = block.blockHeader

  return (
    <section className="py-20 px-5 sm:px-10 lg:px-20 xl:px-20 2xl:px-[clamp(20px,4vw,160px)] bg-[var(--color-gp-cream)]">
      <div className="container mx-auto max-w-7xl flex flex-col gap-20">
        {header && (
          <BlockHeaderSection
            header={header}
            headerAlignment={Alignment.CENTER}
            backgroundColor={BackgroundTheme.CREME}
          />
        )}

        {block.steps &&
          block.steps.map((step, idx) => (
            <StepperCard
              key={idx}
              card={
                {
                  ...step,
                  index: idx,
                  iconContainerColor: step.iconContainerColor,
                  cardHeader: {
                    ...step.cardHeader,
                    primaryButton: step.cardHeader.primaryButton
                      ? {
                          ...step.cardHeader.primaryButton,
                          url: getLinkUrl(
                            step.cardHeader.primaryButton.url as any,
                          ),
                        }
                      : undefined,
                    secondaryButton: step.cardHeader.secondaryButton
                      ? {
                          ...step.cardHeader.secondaryButton,
                          url: getLinkUrl(
                            step.cardHeader.secondaryButton.url as any,
                          ),
                        }
                      : undefined,
                  },
                } as StepperCardData
              }
            />
          ))}
      </div>
    </section>
  )
}
