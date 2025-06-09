import React from 'react'
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
  button,
  textColor,
  className = '',
  backgroundColor = BackgroundTheme.WHITE,
}: FeatureCardProps) {
  const MainIcon = getLucideIcon(icon)
  const isDarkMode = backgroundColor === BackgroundTheme.DARK

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
        </div>

        {button && (
          <div className="mt-6">
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
    </div>
  )
}
