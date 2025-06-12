import React from 'react'
import Image from 'next/image'
import { LinkButton } from './LinkButton'
import {
  BackgroundTheme,
  ButtonVariant,
  ICON_CONTAINER_COLORS,
  IconContainerColor,
  TEXT_COLOR_MAP,
} from '../types/design-tokens'
import { IconPosition } from '../types/ui'
import { getLucideIcon } from '../utils/icons'
import { urlForImage } from '../../sanity/lib/utils'

export enum StepperCardVariant {
  IMAGE = 'image',
  ICON_LIST = 'iconList',
}

export interface StepperCardItem {
  icon: string
  title: string
  body: string
}

export interface StepperCardData {
  index: number
  cardHeader: {
    overline?: string
    heading: string
    subhead?: string
    primaryButton?: {
      label: string
      url: string
      icon?: string
      variant?: ButtonVariant
    }
    secondaryButton?: {
      label: string
      url: string
      icon?: string
      variant?: ButtonVariant
    }
  }
  image: {
    asset: { _ref: string }
    alt: string
    hotspot?: { x: number; y: number }
    crop?: { top: number; bottom: number; left: number; right: number }
  }
  items?: StepperCardItem[]
  iconContainerColor: IconContainerColor
}

export const StepperCard: React.FC<{ card: StepperCardData }> = ({ card }) => {
  const isEven = card.index % 2 === 0
  const textColOrder = isEven ? 'lg:order-1' : 'lg:order-2'
  const mediaColOrder = isEven ? 'lg:order-2' : 'lg:order-1'

  const containerColor = ICON_CONTAINER_COLORS[card.iconContainerColor]

  const { overline, heading, subhead, primaryButton, secondaryButton } =
    card.cardHeader

  const hasPrimary = primaryButton?.label && primaryButton?.url
  const hasSecondary = secondaryButton?.label && secondaryButton?.url

  const textColor = TEXT_COLOR_MAP[BackgroundTheme.WHITE]

  return (
    <div className="bg-white rounded-3xl overflow-hidden w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div
          className={`p-6 md:p-8 lg:p-16 flex flex-col gap-6 justify-center ${textColOrder}`}
        >
          <div className="flex flex-col gap-4">
            {overline && (
              <div
                className="text-large leading-tight"
                style={{ color: textColor }}
              >
                {overline}
              </div>
            )}
            <div
              className="text-5xl md:text-5xl font-semibold leading-tight"
              style={{ color: textColor }}
            >
              {heading}
            </div>
            {subhead && (
              <div
                className="text-lead leading-relaxed"
                style={{ color: textColor }}
              >
                {subhead}
              </div>
            )}
          </div>

          {card.items && card.items.length > 0 && (
            <div className="space-y-6 pt-2">
              {card.items.map((item, idx) => {
                const ItemIcon = getLucideIcon(item.icon)
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: containerColor }}
                    >
                      <ItemIcon className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-lg font-semibold text-gray-900 underline">
                        {item.title}
                      </p>
                      <p className="text-base text-gray-700 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {(hasPrimary || hasSecondary) && (
            <div
              className={`flex ${hasPrimary && hasSecondary ? 'flex-row gap-4' : ''} items-start pt-6`}
            >
              {hasPrimary && (
                <LinkButton
                  label={primaryButton.label}
                  url={primaryButton.url}
                  icon={primaryButton.icon}
                  variant={primaryButton.variant as ButtonVariant}
                  iconPosition={IconPosition.RIGHT}
                />
              )}
              {hasSecondary && (
                <LinkButton
                  label={secondaryButton.label}
                  url={secondaryButton.url}
                  icon={secondaryButton.icon}
                  variant={secondaryButton.variant as ButtonVariant}
                  iconPosition={IconPosition.RIGHT}
                />
              )}
            </div>
          )}
        </div>

        {card.image && (
          <div className={`relative ${mediaColOrder}`}>
            <div className="aspect-square h-full w-full">
              <Image
                src={
                  (urlForImage(card.image)
                    ?.width(800)
                    .height(800)
                    .url() as string) || ''
                }
                alt={card.image.alt || ''}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
