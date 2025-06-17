import React from 'react'
import {
  BACKGROUND_COLOR_MAP,
  BackgroundTheme,
  ButtonVariant,
} from '../../types/design-tokens'
import { HeroLayout, Alignment } from '../../types/ui'
import { HeroBlockProps, SanityImage, TransformedHeader } from '../../types/sanity'
import { OverlayHero } from './OverlayHero'
import { StandardHero } from './StandardHero'

export const HeroBlock: React.FC<HeroBlockProps> = ({ block }) => {
  const {
    header,
    headerAlignment = Alignment.CENTER,
    backgroundTheme = BackgroundTheme.WHITE,
    layout = HeroLayout.HEADER_ONLY,
    image,
    imageContained = false,
  } = block

  const alignmentEnum = headerAlignment as Alignment
  const backgroundEnum = backgroundTheme as BackgroundTheme
  const layoutEnum = layout as HeroLayout

  const backgroundColor = BACKGROUND_COLOR_MAP[backgroundEnum]
  const hasImage = Boolean(layoutEnum !== HeroLayout.HEADER_ONLY && image)

  // TODO: Implement proper link resolution for url props, and unify block header props with other blocks to use SanityLink type
  // JIRA: https://goodparty.atlassian.net/browse/WEB-4279
  const transformedHeader: TransformedHeader = React.useMemo(
    () => ({
      overline: header.overline,
      heading: header.heading,
      subhead: header.subhead,
      primaryButton: header.primaryButton
        ? {
            label: header.primaryButton.label,
            url: '#', // TODO: Replace with resolveUrl(header.primaryButton) when WEB-4279 is implemented
            icon: header.primaryButton.icon,
            variant: header.primaryButton.variant as ButtonVariant,
          }
        : undefined,
      secondaryButton: header.secondaryButton
        ? {
            label: header.secondaryButton.label,
            url: '#', // TODO: Replace with resolveUrl(header.secondaryButton) when WEB-4279 is implemented
            icon: header.secondaryButton.icon,
            variant: header.secondaryButton.variant as ButtonVariant,
          }
        : undefined,
    }),
    [header],
  )

  const isOverlay =
    layoutEnum === HeroLayout.IMAGE_FULL_WIDTH ||
    layoutEnum === HeroLayout.IMAGE_CONTAINED

  const isTwoColumn =
    layoutEnum === HeroLayout.TWO_COLUMN_IMAGE_LEFT ||
    layoutEnum === HeroLayout.TWO_COLUMN_IMAGE_RIGHT

  const standardPadding = isTwoColumn && !imageContained ? 'py-0' : 'py-20'

  const layoutClasses = isTwoColumn
    ? `flex flex-col ${imageContained ? 'gap-12' : 'gap-0'} lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center`
    : isOverlay
      ? 'relative'
      : ''

  const horizontalPaddingClasses =
    isTwoColumn && !imageContained
      ? 'px-0'
      : isTwoColumn && imageContained
        ? 'px-5 sm:px-10 xl:px-20 2xl:px-20'
        : 'px-5 sm:px-10 xl:px-20 2xl:px-[clamp(80px,4vw,160px)]'

  const headerMargin = isTwoColumn
    ? imageContained
      ? 'mb-5 sm:mb-10'
      : 'my-5 sm:my-10'
    : ''

  return (
    <section style={{ backgroundColor }}>
      {isOverlay && hasImage && image ? (
        <OverlayHero
          layoutEnum={layoutEnum}
          image={image}
          transformedHeader={transformedHeader}
          alignmentEnum={alignmentEnum}
        />
      ) : (
        <StandardHero
          horizontalPaddingClasses={horizontalPaddingClasses}
          standardPadding={standardPadding}
          layoutClasses={layoutClasses}
          layoutEnum={layoutEnum}
          headerMargin={headerMargin}
          transformedHeader={transformedHeader}
          backgroundEnum={backgroundEnum}
          alignmentEnum={alignmentEnum}
          hasImage={hasImage}
          image={image}
        />
      )}
    </section>
  )
}

export default HeroBlock
