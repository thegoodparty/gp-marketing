import React from 'react'
import { LinkButton } from './LinkButton'
import FeatureCard from './FeatureCard'
import {
  BackgroundTheme,
  IconContainerColor,
  ButtonVariant,
  BACKGROUND_COLOR_MAP,
  TEXT_COLOR_MAP,
} from '../types/design-tokens'
import { IconPosition } from '../types/ui'
import styles from './FeatureModules.module.css'

interface FeatureModulesProps {
  block: {
    backgroundColor: BackgroundTheme
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
      button?: {
        label: string
        url: string
        icon?: string
      }
    }>
  }
}

export default function FeatureModules({ block }: FeatureModulesProps) {
  const { header, features, backgroundColor } = block

  if (!features || features.length < 3) {
    return null
  }

  const bgColor = BACKGROUND_COLOR_MAP[backgroundColor]
  const textColor = TEXT_COLOR_MAP[backgroundColor]

  const renderButton = (
    button:
      | NonNullable<FeatureModulesProps['block']['header']>['primaryButton']
      | NonNullable<FeatureModulesProps['block']['header']>['secondaryButton'],
  ) => {
    if (!button?.label || !button?.url) return null

    return (
      <LinkButton
        label={button.label}
        url={button.url}
        icon={button.icon}
        variant={button.variant}
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
        <div className="flex justify-center items-center">
          {renderButton(primaryButton)}
        </div>
      )
    }

    if (!hasPrimary && hasSecondary) {
      return (
        <div className="flex justify-center items-center">
          {renderButton(secondaryButton)}
        </div>
      )
    }

    return (
      <div className="flex flex-row gap-4 justify-center items-center">
        {renderButton(primaryButton)}
        {renderButton(secondaryButton)}
      </div>
    )
  }

  return (
    <section className="relative w-full" style={{ backgroundColor: bgColor }}>
      <div className="flex flex-col items-center w-full">
        <div className="box-border flex flex-col gap-12 lg:gap-20 items-center justify-start px-5 lg:px-20 py-12 lg:py-20 w-full">
          {header && (
            <div className="w-full">
              <div className="box-border flex flex-col gap-6 items-center justify-start p-0 w-full">
                <div className="w-full">
                  <div className="box-border flex flex-col gap-4 items-center justify-start leading-none p-0 w-full">
                    {header.overline && (
                      <div
                        className="text-large text-center whitespace-nowrap leading-tight"
                        style={{ color: textColor }}
                      >
                        {header.overline}
                      </div>
                    )}
                    <div
                      className="text-6xl font-semibold text-center w-full leading-tight"
                      style={{ color: textColor }}
                    >
                      {header.heading}
                    </div>
                    {header.subhead && (
                      <div
                        className="text-lead text-center w-full leading-relaxed"
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
            {/* Desktop and Tablet: Responsive grid */}
            <div
              className={`hidden md:grid gap-6 lg:gap-8 justify-items-center justify-center mx-auto w-full ${styles.featureGrid}`}
            >
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  iconContainerColor={feature.iconContainerColor}
                  heading={feature.heading}
                  body={feature.body}
                  button={feature.button}
                  textColor={textColor}
                />
              ))}
            </div>

            {/* Mobile: Stacked single column */}
            <div className="md:hidden flex flex-col gap-6 items-center w-full">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  iconContainerColor={feature.iconContainerColor}
                  heading={feature.heading}
                  body={feature.body}
                  button={feature.button}
                  textColor={textColor}
                  className="w-full max-w-[400px]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
