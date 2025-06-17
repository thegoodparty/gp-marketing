import React from 'react'
import { BlockHeaderSection } from '../BlockHeaderSection'
import { HeroImage } from './HeroImage'
import { BackgroundTheme } from '../../types/design-tokens'
import { HeroLayout, Alignment } from '../../types/ui'
import { SanityImage, TransformedHeader } from '../../types/sanity'

export const StandardHero: React.FC<{
  horizontalPaddingClasses: string
  standardPadding: string
  layoutClasses: string
  layoutEnum: HeroLayout
  headerMargin: string
  transformedHeader: TransformedHeader
  backgroundEnum: BackgroundTheme
  alignmentEnum: Alignment
  hasImage: boolean
  image: SanityImage | undefined
}> = ({
  horizontalPaddingClasses,
  standardPadding,
  layoutClasses,
  layoutEnum,
  headerMargin,
  transformedHeader,
  backgroundEnum,
  alignmentEnum,
  hasImage,
  image,
}) => (
  <div className={`${horizontalPaddingClasses} ${standardPadding}`}>
    <div className="mx-auto w-full max-w-[1376px]">
      <div className={`${layoutClasses}`}>
        <div className={`${layoutEnum === HeroLayout.TWO_COLUMN_IMAGE_RIGHT ? 'lg:order-2' : ''} ${headerMargin}`}>
          <BlockHeaderSection
            header={transformedHeader}
            backgroundColor={backgroundEnum}
            headerAlignment={alignmentEnum}
          />
        </div>
        {hasImage && image && (
          <div className={`${layoutEnum === HeroLayout.TWO_COLUMN_IMAGE_LEFT ? 'lg:order-1' : ''}`}>
            <HeroImage image={image} layout={layoutEnum} />
          </div>
        )}
      </div>
    </div>
  </div>
) 