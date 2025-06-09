import React from 'react'
import FeatureCard from './FeatureCard'
import { BlockHeaderSection } from './BlockHeaderSection'
import {
  BackgroundTheme,
  IconContainerColor,
  ButtonVariant,
  BACKGROUND_COLOR_MAP,
  TEXT_COLOR_MAP,
} from '../types/design-tokens'
import { Alignment } from '../types/ui'

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

  const bgColor = BACKGROUND_COLOR_MAP[backgroundColor]
  const textColor = TEXT_COLOR_MAP[backgroundColor]

  const renderFeatureCard = (
    feature: (typeof features)[0],
    index: number,
    className?: string,
  ) => {
    return (
      <FeatureCard
        key={index}
        icon={feature.icon}
        iconContainerColor={feature.iconContainerColor}
        heading={feature.heading}
        body={feature.body}
        image={feature.image}
        button={feature.button}
        textColor={textColor}
        className={className}
        backgroundColor={backgroundColor}
      />
    )
  }

  const numFeatures = features?.length || 0
  const desktopColumnCount = Math.min(3, numFeatures)
  const tabletColumnCount = Math.min(2, numFeatures)
  const desktopItemsPerCol = Math.ceil(numFeatures / desktopColumnCount)
  const tabletItemsPerCol = Math.ceil(numFeatures / tabletColumnCount)

  const desktopColumns: Array<Array<(typeof features)[0]>> = []
  for (let i = 0; i < desktopColumnCount; i++) {
    const start = i * desktopItemsPerCol
    const end = start + desktopItemsPerCol
    if (start < numFeatures && features) {
      desktopColumns.push(features.slice(start, end))
    }
  }

  const tabletColumns: Array<Array<(typeof features)[0]>> = []
  for (let i = 0; i < tabletColumnCount; i++) {
    const start = i * tabletItemsPerCol
    const end = start + tabletItemsPerCol
    if (start < numFeatures && features) {
      tabletColumns.push(features.slice(start, end))
    }
  }

  return (
    <section className="relative w-full" style={{ backgroundColor: bgColor }}>
      <div className="flex flex-col items-center w-full">
        <div className="box-border flex flex-col gap-12 lg:gap-20 items-center justify-start px-5 lg:px-20 py-12 lg:py-20 w-full">
          {header && (
            <BlockHeaderSection
              header={header}
              backgroundColor={backgroundColor}
              headerAlignment={headerAlignment}
            />
          )}

          {features && features.length > 0 && (
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
          )}
        </div>
      </div>
    </section>
  )
}
