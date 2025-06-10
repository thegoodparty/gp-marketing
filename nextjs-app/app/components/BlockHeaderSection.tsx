import React from 'react'
import { LinkButton } from './LinkButton'
import {
  BackgroundTheme,
  ButtonVariant,
  TEXT_COLOR_MAP,
} from '../types/design-tokens'
import { Alignment, IconPosition } from '../types/ui'

interface BlockHeaderSectionProps {
  header: {
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
  backgroundColor?: BackgroundTheme
  headerAlignment?: Alignment.CENTER | Alignment.LEFT
  className?: string
}

export const BlockHeaderSection: React.FC<BlockHeaderSectionProps> = ({
  header,
  backgroundColor = BackgroundTheme.WHITE,
  headerAlignment = Alignment.CENTER,
  className = '',
}) => {
  const textColor = TEXT_COLOR_MAP[backgroundColor]
  const isLeftAligned = headerAlignment === Alignment.LEFT

  const alignmentClasses = {
    container: isLeftAligned ? 'items-start' : 'items-center',
    text: isLeftAligned ? 'text-left' : 'text-center',
    buttons: isLeftAligned ? 'justify-start' : 'justify-center',
  }

  const primaryButton = header.primaryButton
  const secondaryButton = header.secondaryButton
  const hasPrimary = primaryButton?.label && primaryButton?.url
  const hasSecondary = secondaryButton?.label && secondaryButton?.url
  const hasDarkBackground = backgroundColor === BackgroundTheme.DARK

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`box-border flex flex-col gap-6 ${alignmentClasses.container} justify-start p-0 w-full`}
      >
        <div className="w-full">
          <div
            className={`box-border flex flex-col gap-4 ${alignmentClasses.container} justify-start leading-none p-0 w-full`}
          >
            {header.overline && (
              <div
                className={`text-large ${alignmentClasses.text} whitespace-nowrap leading-tight`}
                style={{ color: textColor }}
              >
                {header.overline}
              </div>
            )}
            <div
              className={`text-6xl font-semibold ${alignmentClasses.text} w-full leading-tight`}
              style={{ color: textColor }}
            >
              {header.heading}
            </div>
            {header.subhead && (
              <div
                className={`text-lead ${alignmentClasses.text} w-full leading-relaxed`}
                style={{ color: textColor }}
              >
                {header.subhead}
              </div>
            )}
          </div>
        </div>
        {(hasPrimary || hasSecondary) && (
          <div
            className={`flex ${hasPrimary && hasSecondary ? 'flex-row gap-4' : ''} ${alignmentClasses.buttons} items-center`}
          >
            {hasPrimary && (
              <LinkButton
                label={primaryButton.label}
                url={primaryButton.url}
                icon={primaryButton.icon}
                variant={primaryButton.variant}
                iconPosition={IconPosition.RIGHT}
              />
            )}
            {hasSecondary && (
              <LinkButton
                label={secondaryButton.label}
                url={secondaryButton.url}
                icon={secondaryButton.icon}
                variant={
                  hasDarkBackground
                    ? ButtonVariant.WHITE_OUTLINE
                    : secondaryButton.variant
                }
                iconPosition={IconPosition.RIGHT}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
