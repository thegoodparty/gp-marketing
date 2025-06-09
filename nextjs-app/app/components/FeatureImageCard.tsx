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

interface FeatureImageCardProps {
  icon: string
  iconContainerColor: IconContainerColor
  heading: string
  body: string
  image: {
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

export default function FeatureImageCard({
  icon,
  iconContainerColor,
  heading,
  body,
  image,
  button,
  textColor,
  className = '',
  backgroundColor = BackgroundTheme.WHITE,
}: FeatureImageCardProps) {
  const MainIcon = getLucideIcon(icon)
  const isDarkMode = backgroundColor === BackgroundTheme.DARK
  const borderClass = isDarkMode
    ? 'border border-white'
    : 'border border-gray-100'

  return (
    <div className={`w-full max-w-[500px] relative ${className}`}>
      <div
        className={`flex flex-col w-full h-full rounded-lg overflow-hidden ${borderClass}`}
      >
        <div className="flex flex-col gap-6 p-6 lg:p-8">
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
            <div>
              <LinkText
                label={button.label}
                url={button.url}
                icon={button.icon || 'ArrowUpRight'}
                iconPosition={IconPosition.RIGHT}
                className={isDarkMode ? 'text-white' : 'text-black'}
              />
            </div>
          )}
        </div>

        <div className="relative w-full h-48 lg:h-56">
          <Image
            src={urlForImage(image)?.width(500).height(300).url() as string}
            alt={image.alt || ''}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  )
}
