import React from 'react'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/utils'
import { getLucideIcon } from '../utils/icons'
import { LinkText } from './LinkText'
import {
  IconContainerColor,
  DesignTokens,
  ICON_CONTAINER_COLORS,
  BackgroundTheme,
} from '../types/design-tokens'
import { IconPosition } from '../types/ui'

interface FeatureCardProps {
  icon: string
  iconContainerColor: IconContainerColor
  heading: string
  body: string
  image?: {
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string
  }
  button?: {
    label: string
    url: string
    icon?: string
  }
  textColor: string
  className?: string
  backgroundColor?: BackgroundTheme
}

export default function FeatureCard({
  icon,
  iconContainerColor,
  heading,
  body,
  image,
  button,
  textColor,
  className = '',
  backgroundColor = BackgroundTheme.WHITE,
}: FeatureCardProps) {
  const MainIcon = getLucideIcon(icon)
  const hasDarkBackground = backgroundColor === BackgroundTheme.DARK

  const hasImage = !!image
  const borderClass = hasImage
    ? hasDarkBackground
      ? 'border border-white'
      : 'border border-gray-100'
    : ''

  const containerClasses = hasImage
    ? `w-full max-w-[500px] relative ${className}`
    : `w-full max-w-[500px] min-h-[300px] relative ${className}`

  const innerClasses = hasImage
    ? `flex flex-col w-full h-full rounded-lg overflow-hidden ${borderClass}`
    : 'flex flex-col p-6 lg:p-8 w-full h-full'

  const contentClasses = hasImage
    ? 'flex flex-col gap-6 p-6 lg:p-8'
    : 'flex flex-col gap-6 flex-1'

  const buttonWrapperClasses = hasImage ? '' : 'mt-6'

  return (
    <div className={containerClasses}>
      <div className={innerClasses}>
        <div className={contentClasses}>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor:
                ICON_CONTAINER_COLORS[iconContainerColor] ||
                ICON_CONTAINER_COLORS[IconContainerColor.BLUE],
            }}
          >
            <MainIcon
              className="w-5 h-5"
              style={{ color: DesignTokens.COLOR_BRAND_SECONDARY }}
            />
          </div>

          <div className="flex flex-col gap-4 items-start w-full">
            <h3
              className="text-2xl font-semibold leading-tight"
              style={{ color: textColor }}
            >
              {heading}
            </h3>
            <p className="text-lead" style={{ color: textColor }}>
              {body}
            </p>
          </div>

          {button && (
            <div className={buttonWrapperClasses}>
              <LinkText
                label={button.label}
                url={button.url}
                icon={button.icon || 'ArrowUpRight'}
                iconPosition={IconPosition.RIGHT}
                className={hasDarkBackground ? 'text-white' : 'text-black'}
              />
            </div>
          )}
        </div>

        {hasImage && (
          <div className="relative w-full h-48 lg:h-56">
            <Image
              src={urlForImage(image)?.width(500).height(300).url() as string}
              alt={image.alt || ''}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  )
}
