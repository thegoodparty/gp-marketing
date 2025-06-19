import React from 'react'
import Image from 'next/image'
import {
  ButtonVariant,
  BackgroundTheme,
  BACKGROUND_COLOR_MAP,
  IconContainerColor,
  ICON_CONTAINER_COLORS,
  TextColor,
  TEXT_COLOR_VALUE_MAP,
} from '../types/design-tokens'
import { SanityLink, SanityImage } from '../types/sanity'
import { getLinkUrl } from '../utils/sanity'
import { urlForImage } from '../../sanity/lib/utils'
import { LinkButton } from './LinkButton'

interface CTABannerProps {
  block: {
    headline: string
    body?: string
    outerBackground?: BackgroundTheme
    innerBackground?: IconContainerColor
    backgroundImage?: SanityImage
    cta: {
      label: string
      url: SanityLink
      icon?: string
      variant?: ButtonVariant
    }
    textColor?: TextColor
  }
  index: number
}

export default function CTABanner({ block }: CTABannerProps) {
  const {
    headline,
    body,
    cta,
    outerBackground = BackgroundTheme.WHITE,
    innerBackground = IconContainerColor.BLUE,
    backgroundImage,
    textColor = TextColor.WHITE,
  } = block

  const outerBgColor = BACKGROUND_COLOR_MAP[outerBackground]
  const innerBgColor = ICON_CONTAINER_COLORS[innerBackground]
  const textColorValue = TEXT_COLOR_VALUE_MAP[textColor]

  return (
    <section
      className="py-10 px-5 sm:px-10 md:px-20"
      style={{ backgroundColor: outerBgColor }}
    >
      <div
        className="relative mx-auto max-w-[1376px] rounded-xl overflow-hidden px-16 [@media(max-width:360px)]:px-8 py-12"
        style={backgroundImage ? undefined : { backgroundColor: innerBgColor }}
      >
        {backgroundImage && (
          <Image
            src={
              urlForImage(backgroundImage)
                ?.width(1376)
                .height(768)
                .url() as string
            }
            alt={backgroundImage.alt || ''}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-stretch gap-6 md:gap-12">
          <div className="flex-1" style={{ color: textColorValue }}>
            <h2 className="font-bold leading-tight text-[28px] md:text-[48px]">
              {headline}
            </h2>
            {body && (
              <p className="mt-4 text-base md:text-lg leading-relaxed">
                {body}
              </p>
            )}
          </div>

          {cta && (
            <div className="shrink-0 mt-6 md:mt-0 md:self-end">
              <LinkButton
                label={cta.label}
                url={getLinkUrl(cta.url)}
                icon={cta.icon}
                variant={cta.variant || ButtonVariant.SECONDARY}
                className="w-full md:w-auto"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
