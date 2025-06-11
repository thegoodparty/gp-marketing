import React from 'react'
import { urlForImage } from '@/sanity/lib/utils'
import { GoodPartyOrgLogo } from 'goodparty-styleguide'

interface TestimonialCardProps {
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
  backgroundColor?: string
  className?: string
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  authorName,
  authorTitle,
  authorImage,
  backgroundColor = '#FFFFFF',
  className = '',
}) => {
  const authorImageUrl = urlForImage(authorImage)
    ?.width(160)
    .height(160)
    .fit('crop')
    .crop('center')
    .url()

  return (
    <div
      className={`relative rounded-2xl shrink-0 h-[400px] min-h-[400px] w-full max-w-full ${className}`}
      style={{ backgroundColor }}
    >
      <div className="relative w-full h-full">
        <div className="box-border flex flex-col h-[400px] items-start justify-between w-full p-6 relative">
          <div className="relative shrink-0 w-full">
            <div className="box-border flex flex-col gap-4 items-start justify-start p-0 relative w-full">
              <div className="h-7 relative shrink-0 w-[34px]">
                <GoodPartyOrgLogo />
              </div>

              <div className="relative shrink-0 w-full">
                <div className="box-border flex flex-col gap-8 items-start justify-start p-0 relative w-full">
                  <div className="open-sans font-regular leading-none relative shrink-0 text-brand-secondary text-lg text-left w-full">
                    <p className="leading-relaxed">&ldquo;{quote}&rdquo;</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative shrink-0">
            <div className="flex flex-row items-center relative w-full">
              <div className="box-border flex flex-row gap-4 items-center justify-start pl-0 pr-6 py-0 relative w-full">
                <div
                  className="bg-cover bg-center bg-no-repeat rounded-[32px] shrink-0 w-12 h-12"
                  style={{ backgroundImage: `url('${authorImageUrl}')` }}
                />

                <div className="flex flex-row items-center self-stretch">
                  <div className="h-full relative shrink-0 w-[210px]">
                    <div className="box-border flex flex-col gap-1 h-full items-start justify-center leading-none p-0 relative text-grayscale-950 text-left w-[210px]">
                      <div className="font-heading font-semibold relative shrink-0 text-base w-full leading-tight">
                        {authorName}
                      </div>
                      <div className="open-sans font-regular relative shrink-0 text-xs w-full leading-normal">
                        {authorTitle}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
