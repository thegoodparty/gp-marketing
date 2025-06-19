import React from 'react'
import { urlForImage } from '../../sanity/lib/utils'
import Image from 'next/image'
import { GoodPartyOrgLogo } from 'goodparty-styleguide'
import type { TestimonialColumn } from './ValueProposition'

interface ValuePropTestimonialColumnProps {
  column: TestimonialColumn
  className?: string
}

export const ValuePropTestimonialColumn: React.FC<
  ValuePropTestimonialColumnProps
> = ({ column, className = '' }) => {
  const { quote, authorName, authorTitle, authorImage, backgroundColor } =
    column
  const authorImageUrl = urlForImage(authorImage)
    ?.width(160)
    .height(160)
    .fit('crop')
    .crop('center')
    .url()

  return (
    <div className={`flex-1 basis-1/2 ${className}`}>
      <div
        className="rounded-3xl p-5 lg:p-12 flex flex-col h-full"
        style={{ backgroundColor }}
      >
        <div className="flex-grow">
          <div className="mb-8">
            <GoodPartyOrgLogo />
          </div>

          <div className="mb-8">
            <p className="text-[18px] font-normal lg:text-[24px] lg:font-semibold text-gray-900 leading-relaxed">
              &ldquo;{quote}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-auto">
          <div className="relative w-[48px] h-[48px] lg:w-[80px] lg:h-[80px] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={authorImageUrl ?? ''}
              alt={authorImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 48px, 80px"
            />
          </div>
          <div>
            <p className="text-[16px] font-semibold lg:text-[20px] lg:font-semibold text-gray-900">
              {authorName}
            </p>
            <p className="text-[12px] font-normal text-gray-900">
              {authorTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
