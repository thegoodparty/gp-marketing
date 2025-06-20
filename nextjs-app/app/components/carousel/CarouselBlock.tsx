import React from 'react'
import { TestimonialCard } from '../testimonial/TestimonialCard'
import { BlockHeaderSection } from '../BlockHeaderSection'
import { BackgroundTheme } from '../../types/design-tokens'
import { Alignment } from '../../types/ui'
import { CarouselControl } from './CarouselControl'
import { useHorizontalScroll } from '@/app/hooks/useHorizontalScroll'
import { CarouselCandidateCard } from './CarouselCandidateCard'
import { BACKGROUND_COLOR_MAP } from '../../types/design-tokens'

interface CarouselBlockProps {
  block: {
    header?: {
      overline?: string
      heading: string
      subhead?: string
    }
    variant: 'testimonials' | 'candidates'
    background?: BackgroundTheme
    testimonials?: Array<{
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
    candidates?: Array<{
      backgroundColor: string
      quote: string
      candidateName: string
      candidateTitle: string
      candidateImage: {
        asset: { _ref: string }
        alt: string
        hotspot?: { x: number; y: number }
        crop?: { top: number; bottom: number; left: number; right: number }
      }
    }>
  }
}

export default function CarouselBlock({ block }: CarouselBlockProps) {
  const {
    header,
    variant,
    background = BackgroundTheme.DARK,
    testimonials = [],
    candidates = [],
  } = block
  const { ref: scrollContainerRef, scrollLeft, scrollRight } =
    useHorizontalScroll()

  return (
    <section
      className="relative w-full"
      style={{ backgroundColor: BACKGROUND_COLOR_MAP[background] }}
    >
      <div className="flex flex-col items-center w-full">
        <div className="box-border flex flex-col gap-12 items-start justify-start px-20 py-20 w-full max-w-[1376px] mx-auto">
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-0">
            {header && (
              <BlockHeaderSection
                header={header}
                backgroundColor={background}
                headerAlignment={Alignment.LEFT}
                className="w-full sm:max-w-[70%]"
              />
            )}
            <CarouselControl
              onPrev={scrollLeft}
              onNext={scrollRight}
              isDark={background === BackgroundTheme.DARK}
              className="sm:ml-auto"
            />
          </div>

          <div className="w-full overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 w-full"
              style={{ scrollBehavior: 'smooth' }}
            >
              {(variant === 'testimonials' ? testimonials : candidates).map((item, index) => (
                <div
                  key={index}
                  className="flex-none snap-center w-[320px] sm:w-[380px]"
                >
                  {variant === 'testimonials' ? (
                    <TestimonialCard
                      quote={(item as any).quote}
                      authorName={(item as any).authorName}
                      authorTitle={(item as any).authorTitle}
                      authorImage={(item as any).authorImage}
                      backgroundColor={(item as any).backgroundColor}
                      className="h-[400px]"
                    />
                  ) : (
                    <CarouselCandidateCard
                      quote={(item as any).quote}
                      candidateName={(item as any).candidateName}
                      candidateTitle={(item as any).candidateTitle}
                      candidateImage={(item as any).candidateImage}
                      backgroundColor={(item as any).backgroundColor}
                      className="h-[400px]"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 