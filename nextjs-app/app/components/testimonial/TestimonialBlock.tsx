import React from 'react'
import { TestimonialCard } from './TestimonialCard'
import { BlockHeaderSection } from '../BlockHeaderSection'
import { type ButtonVariant, BackgroundTheme } from '../../types/design-tokens'
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

  return (
    <section className="relative w-full bg-brand-secondary">
      <div className="flex flex-col items-center w-full">
        <div className="box-border flex flex-col gap-12 items-center justify-start px-5 py-8 sm:px-10 sm:py-16 xl:px-20 xl:py-32 w-full max-w-[1376px] mx-auto">
          {header && (
            <BlockHeaderSection
              header={header}
              backgroundColor={BackgroundTheme.DARK}
            />
          )}

          <div className="w-full">
            <div className="xl:hidden">
              <div
                className={`flex gap-12 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 ${
                  testimonials.length === 1 ? 'justify-center' : ''
                }`}
                style={{ scrollBehavior: 'smooth' }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="flex-none snap-center w-[320px] sm:w-[380px]"
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
              className={`hidden xl:grid gap-12 justify-items-center justify-center mx-auto w-full ${styles.testimonialGrid}`}
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
