import React from 'react'
import { Button } from 'goodparty-styleguide'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import { TestimonialCard } from './TestimonialCard'

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
        variant?:
          | 'default'
          | 'secondary'
          | 'destructive'
          | 'outline'
          | 'ghost'
          | 'whiteGhost'
          | 'whiteOutline'
      }
      secondaryButton?: {
        label: string
        url: string
        icon?: string
        variant?:
          | 'default'
          | 'secondary'
          | 'destructive'
          | 'outline'
          | 'ghost'
          | 'whiteGhost'
          | 'whiteOutline'
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

const getIconFromModule = <T extends Record<string, unknown>>(
  iconModule: T,
  iconName: string,
): LucideIcon | undefined => {
  return iconModule[iconName] as LucideIcon | undefined
}

const getLucideIcon = (iconName: string): LucideIcon => {
  const IconComponent = getIconFromModule(LucideIcons, iconName)
  return IconComponent || LucideIcons.HelpCircle
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

    const ButtonIcon = button.icon ? getLucideIcon(button.icon) : null
    const variant = button.variant || 'default'

    return (
      <Link href={button.url} target="_blank" className="inline-block">
        <Button iconPosition="right" variant={variant as any}>
          {ButtonIcon && <ButtonIcon className="mr-2 h-4 w-4" />}
          {button.label}
        </Button>
      </Link>
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
    <section className="relative w-full" style={{ backgroundColor: '#0B1529' }}>
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
            <div className="hidden lg:flex flex-wrap gap-8 items-start justify-center w-full">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="flex-none">
                  <TestimonialCard
                    quote={testimonial.quote}
                    authorName={testimonial.authorName}
                    authorTitle={testimonial.authorTitle}
                    authorImage={testimonial.authorImage}
                    backgroundColor={testimonial.backgroundColor}
                    className="w-[350px] h-[400px]"
                  />
                </div>
              ))}
            </div>

            <div className="hidden md:grid lg:hidden grid-cols-2 gap-6 justify-items-center w-full">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full max-w-[350px]">
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

            <div className="md:hidden">
              <div
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="flex-none w-[85vw] snap-center">
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
          </div>
        </div>
      </div>
    </section>
  )
}
