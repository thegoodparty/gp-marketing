import React from 'react'
import Image from 'next/image'
import { urlForImage } from '../../sanity/lib/utils'
import { BlockHeaderSection } from './BlockHeaderSection'
import {
  ICON_CONTAINER_COLOR_HEX,
  IconContainerColor,
  CtaVariant,
  BackgroundTheme,
  TEXT_COLOR_MAP,
  ButtonVariant,
} from '../types/design-tokens'
import { Alignment } from '../types/ui'
import { SanityImage, SanityLink } from '../types/sanity'
import { getLinkUrl } from '../utils/sanity'

interface CtaProps {
  block: {
    variant: CtaVariant
    backgroundColor: IconContainerColor
    overline?: string
    heading: string
    subhead?: string
    image?: SanityImage
    primaryCta: {
      label: string
      url: SanityLink
      icon?: string
      variant?: ButtonVariant
    }
    secondaryCta?: {
      label: string
      url: SanityLink
      icon?: string
      variant?: ButtonVariant
    }
    caption?: string
  }
  index: number
}

export default function CTA({ block }: CtaProps) {
  const backgroundColor = ICON_CONTAINER_COLOR_HEX[block.backgroundColor]
  const isTextImageVariant = block.variant === CtaVariant.TEXT_IMAGE

  const backgroundTheme = BackgroundTheme.WHITE

  const headerConfig = {
    overline: block.overline,
    heading: block.heading,
    subhead: block.subhead,
    primaryButton: block.primaryCta
      ? {
          label: block.primaryCta.label,
          url: getLinkUrl(block.primaryCta.url),
          icon: block.primaryCta.icon,
          variant: block.primaryCta.variant,
        }
      : undefined,
    secondaryButton: block.secondaryCta
      ? {
          label: block.secondaryCta.label,
          url: getLinkUrl(block.secondaryCta.url),
          icon: block.secondaryCta.icon,
          variant: block.secondaryCta.variant,
        }
      : undefined,
  }

  return (
    <section
      className="py-16 px-4 lg:py-20 lg:px-8"
      style={{ backgroundColor }}
    >
      <div className="container mx-auto max-w-7xl">
        {isTextImageVariant ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <BlockHeaderSection
                header={headerConfig}
                backgroundColor={backgroundTheme}
                headerAlignment={Alignment.LEFT}
                className="lg:pr-8"
              />
            </div>

            {block.image && (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden order-1 lg:order-2">
                <Image
                  src={
                    urlForImage(block.image)
                      ?.width(600)
                      .height(450)
                      .url() as string
                  }
                  alt={block.image.alt || ''}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <BlockHeaderSection
              header={headerConfig}
              backgroundColor={backgroundTheme}
              headerAlignment={Alignment.CENTER}
            />

            {block.caption && (
              <p
                className="text-sm text-center mt-6"
                style={{ color: TEXT_COLOR_MAP[backgroundTheme] }}
              >
                {block.caption}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
