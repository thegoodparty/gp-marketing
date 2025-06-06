import React from 'react'
import { TestimonialCard } from './TestimonialCard'
import { type ButtonVariant } from '../types/design-tokens'
import { LinkButton } from './LinkButton'
import styles from './TestimonialBlock.module.css'

interface TestimonialBlockProps {
  block: {
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
    testimonials: Array<{
      backgroundColor: string
      quote: string
      authorName: string
      authorTitle: string
      authorImage: {
        asset: {
          _ref: string
        }
        alt: string
        hotspot?: {
          x: number
          y: number
        }
        crop?: {
          top: number
          bottom: number
          left: number
          right: number
        }
      }
    }>
  }
}

export default function TestimonialBlock({ block }: TestimonialBlockProps) {
  const { header, testimonials } = block

  if (!testimonials || testimonials.length < 3) {
    return null
  }

  const renderButton = (
    button:
      | NonNullable<TestimonialBlockProps['block']['header']>['primaryButton']
      | NonNullable<
          TestimonialBlockProps['block']['header']
        >['secondaryButton'],
  ) => {
    if (!button?.label || !button?.url) return null

    return (
      <LinkButton
        label={button.label}
        url={button.url}
        icon={button.icon}
        variant={button.variant}
        iconPosition="right"
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
    <section className="relative w-full bg-brand-secondary">
      <div className="flex flex-col items-center w-full">
        <div className="box-border flex flex-col gap-12 items-center justify-start px-20 py-32 w-full">
          {header && (
            <div className="w-full">
              <div className="box-border flex flex-col gap-6 items-center justify-start p-0 w-full">
                <div className="w-full">
                  <div className="box-border flex flex-col gap-4 items-center justify-start leading-none p-0 text-white w-full">
                    {header.overline && (
                      <div className="font-heading font-medium text-lg text-center whitespace-nowrap leading-tight">
                        {header.overline}
                      </div>
                    )}
                    <div className="font-heading font-semibold text-6xl text-center w-full leading-tight">
                      {header.heading}
                    </div>
                    {header.subhead && (
                      <div className="open-sans font-regular text-lg text-center w-full leading-relaxed">
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
            <div className="md:hidden">
              <div
                className={`flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 ${
                  testimonials.length === 1 ? 'justify-center' : ''
                }`}
                style={{ scrollBehavior: 'smooth' }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`flex-none snap-center ${
                      testimonials.length === 1
                        ? 'w-[85vw] max-w-[350px]'
                        : 'w-[85vw]'
                    }`}
                  >
                    <TestimonialCard
                      quote={testimonial.quote}
                      authorName={testimonial.authorName}
                      authorTitle={testimonial.authorTitle}
                      authorImage={testimonial.authorImage}
                      backgroundColor={testimonial.backgroundColor}
                      className="h-[400px]"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-white opacity-30"
                  />
                ))}
              </div>
            </div>

            <div
              className={`hidden md:grid gap-6 lg:gap-8 justify-items-center justify-center mx-auto w-full ${styles.testimonialGrid}`}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full">
                  <TestimonialCard
                    quote={testimonial.quote}
                    authorName={testimonial.authorName}
                    authorTitle={testimonial.authorTitle}
                    authorImage={testimonial.authorImage}
                    backgroundColor={testimonial.backgroundColor}
                    className="h-[400px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
