import React from 'react'
import Image from 'next/image'
import { urlForImage } from '../../sanity/lib/utils'
import type { ImageColumn } from './ValueProposition'

interface ValuePropImageColumnProps {
  column: ImageColumn
  className?: string
}

export const ValuePropImageColumn: React.FC<ValuePropImageColumnProps> = ({
  column,
  className = '',
}) => {
  const imageUrl = urlForImage(column.image)
    ?.width(624)
    .height(466)
    .fit('crop')
    .crop('center')
    .url()

  return (
    <div
      className={`flex-1 basis-1/2 rounded-3xl overflow-hidden ${className}`}
    >
      <div className="relative w-full h-[300px] lg:h-[466px]">
        <Image
          src={imageUrl || ''}
          alt={column.image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 624px"
        />
      </div>
    </div>
  )
}
