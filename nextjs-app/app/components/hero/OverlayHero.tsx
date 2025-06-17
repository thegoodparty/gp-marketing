import React from 'react'
import { BlockHeaderSection } from '../BlockHeaderSection'
import { HeroImage } from './HeroImage'
import { BackgroundTheme } from '../../types/design-tokens'
import { HeroLayout, Alignment } from '../../types/ui'
import { SanityImage, TransformedHeader } from '../../types/sanity'

export const OverlayHero: React.FC<{
  layoutEnum: HeroLayout
  image: SanityImage
  transformedHeader: TransformedHeader
  alignmentEnum: Alignment
}> = ({ layoutEnum, image, transformedHeader, alignmentEnum }) => (
  <div className="relative min-h-[500px]">
    {layoutEnum === HeroLayout.IMAGE_FULL_WIDTH ? (
      <div className="absolute inset-0">
        <HeroImage image={image} layout={layoutEnum} />
      </div>
    ) : (
      <div className="absolute inset-0 flex justify-center px-5 sm:px-10 md:px-20">
        <div className="w-full max-w-[1376px] py-5 sm:py-10 md:py-20">
          <HeroImage image={image} layout={layoutEnum} />
        </div>
      </div>
    )}
    <div className="relative z-10 flex items-center justify-center min-h-[500px] px-10 md:px-20 py-20">
      <div
        className={`w-full max-w-4xl ${layoutEnum === HeroLayout.IMAGE_CONTAINED ? 'max-[1100px]:px-5' : ''}`}
      >
        <BlockHeaderSection
          header={transformedHeader}
          backgroundColor={BackgroundTheme.DARK}
          headerAlignment={alignmentEnum}
        />
      </div>
    </div>
  </div>
)
