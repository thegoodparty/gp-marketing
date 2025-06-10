import React from 'react'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/utils'
import { BlockHeaderSection } from '@/app/components/BlockHeaderSection'
import {
  ICON_CONTAINER_COLOR_HEX,
  IconContainerColor,
  CtaVariant,
  BackgroundTheme,
  TEXT_COLOR_MAP,
  ButtonVariant,
  LinkType,
} from '@/app/types/design-tokens'
import { Alignment } from '@/app/types/ui'

interface CtaProps {
  block: {
    variant: CtaVariant
    backgroundColor: IconContainerColor
    overline?: string
    heading: string
    subhead?: string
    image?: {
      asset: {
        _ref: string
        _type: 'reference'
      }
      alt?: string
      hotspot?: {
        x: number
        y: number
      }
      crop?: {
        top: number
        bottom: number
        left: number
        right: number
      }
    }
    primaryCta: {
      label: string
      url: {
        linkType?: LinkType
        href?: string
        page?: {
          _ref: string
          _type: 'reference'
        }
        post?: {
          _ref: string
          _type: 'reference'
        }
        openInNewTab?: boolean
      }
      icon?: string
      variant?: ButtonVariant
    }
    secondaryCta?: {
      label: string
      url: {
        linkType?: LinkType
        href?: string
        page?: {
          _ref: string
          _type: 'reference'
        }
        post?: {
          _ref: string
          _type: 'reference'
        }
        openInNewTab?: boolean
      }
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

  const getLinkUrl = (
    linkObj: CtaProps['block']['primaryCta']['url'],
  ): string => {
    if (linkObj.linkType === LinkType.HREF && linkObj.href) {
      return linkObj.href
    }
    // For page/post references, we'd need additional logic to resolve them
    // This would typically involve resolving the reference to get the slug
    // For now, return empty string - this would need to be handled properly
    return ''
  }

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
    <section className="py-20 px-5 lg:px-20" style={{ backgroundColor }}>
      <div className="container mx-auto max-w-7xl">
        {isTextImageVariant ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <BlockHeaderSection
              header={headerConfig}
              backgroundColor={backgroundTheme}
              headerAlignment={Alignment.LEFT}
              className="lg:pr-8"
            />

            {block.image && (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden order-first lg:order-last">
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
