import React from 'react'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/utils'
import { GoodPartyOrgLogo } from 'goodparty-styleguide'

interface CarouselCandidateCardProps {
  quote: string
  candidateName: string
  candidateTitle: string
  candidateImage: {
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

export const CarouselCandidateCard: React.FC<CarouselCandidateCardProps> = ({
  quote,
  candidateName,
  candidateTitle,
  candidateImage,
  backgroundColor = '#CCEADD',
  className = '',
}) => {
  const avatarUrl = urlForImage(candidateImage)
    ?.width(512)
    .height(512)
    .fit('crop')
    .crop('center')
    .url()

  return (
    <div
      className={`relative rounded-2xl shrink-0 h-[450px] min-h-[400px] w-full max-w-full ${className}`}
      style={{ backgroundColor }}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 gap-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="rounded-full overflow-hidden w-full h-full bg-[#DDF2E8] flex items-center justify-center">
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt={candidateImage.alt || candidateName}
                width={192}
                height={192}
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <div className="absolute bottom-4 right-4 w-[34px] h-7 z-10">
            <GoodPartyOrgLogo />
          </div>
        </div>

        <div className="text-brand-secondary text-lg text-center px-2">
          <p className="text-xl font-semibold">&ldquo;{quote}&rdquo;</p>
        </div>

        <div className="flex flex-col items-start w-full px-2">
          <div className="font-heading font-medium text-base text-brand-secondary text-left w-full">
            {candidateName}
          </div>
          <div className="open-sans text-xs text-brand-secondary text-left w-full">
            {candidateTitle}
          </div>
        </div>
      </div>
    </div>
  )
}
