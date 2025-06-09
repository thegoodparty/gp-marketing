import React from 'react'
import { LinkButton } from './LinkButton'
import FeatureCard from './FeatureCard'
import FeatureImageCard from './FeatureImageCard'
import {
  BackgroundTheme,
  IconContainerColor,
  ButtonVariant,
  BACKGROUND_COLOR_MAP,
  TEXT_COLOR_MAP,
} from '../types/design-tokens'
import { Alignment, IconPosition } from '../types/ui'

interface FeatureModulesProps {
  block: {
    backgroundColor: BackgroundTheme
    headerAlignment?: Alignment.CENTER | Alignment.LEFT
    header?: {
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
    features: Array<{
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
    }>
  }
}

export default function FeatureModules({ block }: FeatureModulesProps) {
  const {
    header,
    features,
    backgroundColor,
    headerAlignment = Alignment.CENTER,
  } = block

  if (!features || features.length < 3) {
    return null
  }

  const bgColor = BACKGROUND_COLOR_MAP[backgroundColor]
  const textColor = TEXT_COLOR_MAP[backgroundColor]

  const isLeftAligned = headerAlignment === 'left'
  const alignmentClasses = {
    container: isLeftAligned ? 'items-start' : 'items-center',
    text: isLeftAligned ? 'text-left' : 'text-center',
    buttons: isLeftAligned ? 'justify-start' : 'justify-center',
  }

  const renderFeatureCard = (
    feature: (typeof features)[0],
    index: number,
    className?: string,
  ) => {
    const cardProps = {
      icon: feature.icon,
      iconContainerColor: feature.iconContainerColor,
      heading: feature.heading,
      body: feature.body,
      button: feature.button,
      textColor: textColor,
      className: className,
      backgroundColor: backgroundColor,
    }

    if (feature.image) {
      return (
        <FeatureImageCard key={index} {...cardProps} image={feature.image} />
      )
    }

    return <FeatureCard key={index} {...cardProps} />
  }

  const renderButton = (
    button:
      | NonNullable<FeatureModulesProps['block']['header']>['primaryButton']
      | NonNullable<FeatureModulesProps['block']['header']>['secondaryButton'],
    isPrimary = false,
  ) => {
    if (!button?.label || !button?.url) return null

    const isDarkMode = backgroundColor === BackgroundTheme.DARK

    let buttonVariant = button.variant
    if (!isPrimary && isDarkMode) {
      buttonVariant = ButtonVariant.WHITE_OUTLINE
    }

    return (
      <LinkButton
        label={button.label}
        url={button.url}
        icon={button.icon}
        variant={buttonVariant}
        iconPosition={IconPosition.RIGHT}
      />
    )
  }

  const renderButtons = () => {
    const primaryButton = header?.primaryButton
    const secondaryButton = header?.secondaryButton

    const hasPrimary = primaryButton?.label && primaryButton?.url
    const hasSecondary = secondaryButton?.label && secondaryButton?.url

    if (!hasPrimary && !hasSecondary) return null

    if (hasPrimary && !hasSecondary) {
      return (
        <div className={`flex ${alignmentClasses.buttons} items-center`}>
          {renderButton(primaryButton, true)}
        </div>
      )
    }

    if (!hasPrimary && hasSecondary) {
      return (
        <div className={`flex ${alignmentClasses.buttons} items-center`}>
          {renderButton(secondaryButton, false)}
        </div>
      )
    }

    return (
      <div
        className={`flex flex-row gap-4 ${alignmentClasses.buttons} items-center`}
      >
        {renderButton(primaryButton, true)}
        {renderButton(secondaryButton, false)}
      </div>
    )
  }

  const numFeatures = features.length
  const desktopColumnCount = 3
  const tabletColumnCount = 2
  const desktopItemsPerCol = Math.ceil(numFeatures / desktopColumnCount)
  const tabletItemsPerCol = Math.ceil(numFeatures / tabletColumnCount)

  const desktopColumns: Array<Array<(typeof features)[0]>> = []
  for (let i = 0; i < desktopColumnCount; i++) {
    const start = i * desktopItemsPerCol
    const end = start + desktopItemsPerCol
    if (start < numFeatures) {
      desktopColumns.push(features.slice(start, end))
    }
  }

  const tabletColumns: Array<Array<(typeof features)[0]>> = []
  for (let i = 0; i < tabletColumnCount; i++) {
    const start = i * tabletItemsPerCol
    const end = start + tabletItemsPerCol
    if (start < numFeatures) {
      tabletColumns.push(features.slice(start, end))
    }
  }

  return (
    <section className="relative w-full" style={{ backgroundColor: bgColor }}>
      <div className="flex flex-col items-center w-full">
        <div className="box-border flex flex-col gap-12 lg:gap-20 items-center justify-start px-5 lg:px-20 py-12 lg:py-20 w-full">
          {header && (
            <div className="w-full">
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
                {renderButtons()}
              </div>
            </div>
          )}

          <div className="w-full">
            <div className="hidden lg:flex flex-row gap-8 w-full">
              {desktopColumns.map((column, i) => (
                <div key={i} className="flex flex-col gap-8 w-full flex-1">
                  {column.map((feature) => {
                    const originalIndex = features.indexOf(feature)
                    return renderFeatureCard(feature, originalIndex, 'w-full')
                  })}
                </div>
              ))}
            </div>

            <div className="hidden md:flex lg:hidden flex-row gap-6 w-full">
              {tabletColumns.map((column, i) => (
                <div key={i} className="flex flex-col gap-6 w-full flex-1">
                  {column.map((feature) => {
                    const originalIndex = features.indexOf(feature)
                    return renderFeatureCard(feature, originalIndex, 'w-full')
                  })}
                </div>
              ))}
            </div>

            <div className="md:hidden flex flex-col gap-6 items-center w-full">
              {features.map((feature, index) =>
                renderFeatureCard(feature, index, 'w-full max-w-[500px]'),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
