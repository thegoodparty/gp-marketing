import React from 'react'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/utils'
import { getLucideIcon } from '../utils/icons'
import { LinkButton } from './LinkButton'
import {
  IconContainerColor,
  DesignTokens,
  ICON_CONTAINER_COLORS,
  ButtonVariant,
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
    caption?: string
  }
  button?: {
    label: string
    url: string
    icon?: string
  }
  textColor: string
  className?: string
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
}: FeatureCardProps) {
  const MainIcon = getLucideIcon(icon)

  return (
    <div className={`w-full max-w-[500px] min-h-[300px] relative ${className}`}>
      <div className="flex flex-col p-6 lg:p-8 w-full h-full">
        <div className="flex-1 flex flex-col gap-6">
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

          {/* Image section */}
          {image && (
            <div className="w-full">
              <Image
                src={urlForImage(image)?.width(400).height(240).url() as string}
                alt={image.alt || ''}
                width={400}
                height={240}
                className="w-full h-auto rounded-lg object-cover"
              />
              {image.caption && (
                <p
                  className="text-sm mt-2 opacity-80"
                  style={{ color: textColor }}
                >
                  {image.caption}
                </p>
              )}
            </div>
          )}
        </div>

        {button && (
          <div className="mt-6">
            <LinkButton
              label={button.label}
              url={button.url}
              icon={button.icon || 'ArrowUpRight'}
              variant={ButtonVariant.GHOST}
              iconPosition={IconPosition.RIGHT}
            />
          </div>
        )}
      </div>
    </div>
  )
}
