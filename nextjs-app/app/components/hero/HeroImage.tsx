import React from 'react'
import Image from 'next/image'
import { urlForImage } from '../../../sanity/lib/utils'
import { HeroLayout } from '../../types/ui'
import { SanityImage } from '../../types/sanity'

interface HeroImageProps {
  image: SanityImage
  layout: HeroLayout
}

const DEFAULT_HERO_WIDTH = 1376
const DEFAULT_HERO_HEIGHT = 800

export const HeroImage: React.FC<HeroImageProps> = ({ image, layout }) => {
  const imageUrl = urlForImage(image)?.url()

  const isPriority =
    layout === HeroLayout.IMAGE_FULL_WIDTH ||
    layout === HeroLayout.IMAGE_CONTAINED

  const layoutConfig = {
    [HeroLayout.HEADER_ONLY]: {
      imageClasses: 'h-auto',
      containerClasses: '',
    },
    [HeroLayout.TWO_COLUMN_IMAGE_LEFT]: {
      imageClasses: 'h-auto object-cover',
      containerClasses: '',
    },
    [HeroLayout.TWO_COLUMN_IMAGE_RIGHT]: {
      imageClasses: 'h-auto object-cover',
      containerClasses: '',
    },
    [HeroLayout.IMAGE_FULL_WIDTH]: {
      imageClasses: 'h-full object-cover min-h-[500px]',
      containerClasses: 'h-full',
    },
    [HeroLayout.IMAGE_CONTAINED]: {
      imageClasses: 'h-full',
      containerClasses: 'h-full',
    },
  }[layout]

  return (
    <>
      {imageUrl && (
        <div className={`w-full ${layoutConfig.containerClasses}`}>
          <Image
            src={imageUrl}
            alt={image.alt || ''}
            width={DEFAULT_HERO_WIDTH}
            height={DEFAULT_HERO_HEIGHT}
            className={`w-full ${layoutConfig.imageClasses}`}
            priority={isPriority}
          />
        </div>
      )}
    </>
  )
}
