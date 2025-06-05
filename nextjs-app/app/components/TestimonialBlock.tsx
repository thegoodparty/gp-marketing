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

    // Single button - center it
    if (hasPrimary && !hasSecondary) {
      return (
        <div className="flex justify-center items-center mt-8">
          {renderButton(primaryButton)}
        </div>
      )
    }

    // Single secondary button - center it
    if (!hasPrimary && hasSecondary) {
      return (
        <div className="flex justify-center items-center mt-8">
          {renderButton(secondaryButton)}
        </div>
      )
    }

    // Both buttons - side by side on desktop, stacked on mobile
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
        {renderButton(primaryButton)}
        {renderButton(secondaryButton)}
      </div>
    )
  }

  return (
    <section
      className="py-[60px] px-5 lg:py-20 lg:px-4"
      style={{ backgroundColor: '#0B1529' }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        {header && (
          <div className="text-center mb-12 lg:mb-16">
            {header.overline && (
              <p className="text-lg text-white mb-2">{header.overline}</p>
            )}
            <h2 className="text-[48px] font-semibold text-white mb-4 leading-tight">
              {header.heading}
            </h2>
            {header.subhead && (
              <p className="text-lg text-white">{header.subhead}</p>
            )}
            {renderButtons()}
          </div>
        )}

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="h-full">
              <TestimonialCard
                quote={testimonial.quote}
                authorName={testimonial.authorName}
                authorTitle={testimonial.authorTitle}
                authorImage={testimonial.authorImage}
                backgroundColor={testimonial.backgroundColor}
                className="h-full"
              />
            </div>
          ))}
        </div>

        {/* Mobile: Slider/Carousel */}
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
                />
              </div>
            ))}
          </div>

          {/* Pagination dots */}
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
    </section>
  )
}
