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
  const headerRaw = block.blockHeader

  // TODO(goodparty/web-4238): BlockHeaderSection takes string URLs, while Sanity returns `SanityLink` objects.
  // In a future refactor, I'll update BlockHeaderSection (and components using it) to accept `SanityLink`
  // directly so this mapping logic can be removed.
  const resolveLink = (link: any) =>
    typeof link === 'string' ? link : getLinkUrl(link)

  const header = headerRaw
    ? {
        ...headerRaw,
        primaryButton: headerRaw.primaryButton
          ? {
              ...headerRaw.primaryButton,
              url: resolveLink(headerRaw.primaryButton.url),
            }
          : undefined,
        secondaryButton: headerRaw.secondaryButton
          ? {
              ...headerRaw.secondaryButton,
              url: resolveLink(headerRaw.secondaryButton.url),
            }
          : undefined,
      }
    : undefined

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

        {block.steps.map((step, idx) => (
          <section key={idx} className="min-h-screen pointer-events-none">
            <div
              className={`sticky top-20 z-[${10 + idx}] pointer-events-auto`}
            >
              <StepperCard
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
                            url: resolveLink(step.cardHeader.primaryButton.url),
                          }
                        : undefined,
                      secondaryButton: step.cardHeader.secondaryButton
                        ? {
                            ...step.cardHeader.secondaryButton,
                            url: resolveLink(
                              step.cardHeader.secondaryButton.url,
                            ),
                          }
                        : undefined,
                    },
                  } as StepperCardData
                }
              />
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
