import React from 'react'
import { BlockHeaderSection } from '../BlockHeaderSection'
import { HeroImage } from './HeroImage'
import {
  BACKGROUND_COLOR_MAP,
  BackgroundTheme,
  ButtonVariant,
} from '../../types/design-tokens'
import { HeroLayout, Alignment } from '../../types/ui'
import { HeroBlockProps } from '../../types/sanity'

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
  const hasImage = layoutEnum !== HeroLayout.HEADER_ONLY && image

  // TODO: Implement proper link resolution for url props, and unify block header props with other blocks to use SanityLink type
  // JIRA: WEB-4279
  const transformedHeader = React.useMemo(
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

  const getLayoutClasses = () => {
    switch (layoutEnum) {
      case HeroLayout.TWO_COLUMN_IMAGE_LEFT:
      case HeroLayout.TWO_COLUMN_IMAGE_RIGHT:
        return `flex flex-col ${imageContained ? 'gap-12' : 'gap-0'} lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center`
      case HeroLayout.IMAGE_FULL_WIDTH:
      case HeroLayout.IMAGE_CONTAINED:
        return 'relative'
      default:
        return ''
    }
  }

  const getOrderClasses = (type: 'header' | 'image') => {
    if (layoutEnum !== HeroLayout.TWO_COLUMN_IMAGE_RIGHT) return ''
    return type === 'header' ? 'lg:order-2' : 'lg:order-1'
  }

  const isOverlay =
    layoutEnum === HeroLayout.IMAGE_FULL_WIDTH ||
    layoutEnum === HeroLayout.IMAGE_CONTAINED

  const isTwoColumn =
    layoutEnum === HeroLayout.TWO_COLUMN_IMAGE_LEFT ||
    layoutEnum === HeroLayout.TWO_COLUMN_IMAGE_RIGHT

  const standardPadding = isTwoColumn && !imageContained ? 'py-0' : 'py-20'

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
      {isOverlay && hasImage ? (
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
            <div className={`w-full max-w-4xl ${layoutEnum === HeroLayout.IMAGE_CONTAINED ? 'max-[1100px]:px-5' : ''}`}>
              <BlockHeaderSection
                header={transformedHeader}
                backgroundColor={BackgroundTheme.DARK}
                headerAlignment={alignmentEnum}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className={`${horizontalPaddingClasses} ${standardPadding}`}>
          <div className="mx-auto w-full max-w-[1376px]">
            <div className={`${getLayoutClasses()}`}>
              <div className={`${getOrderClasses('header')} ${headerMargin}`}>
                <BlockHeaderSection
                  header={transformedHeader}
                  backgroundColor={backgroundEnum}
                  headerAlignment={alignmentEnum}
                />
              </div>
              {hasImage && (
                <div className={`${getOrderClasses('image')}`}>
                  <HeroImage image={image} layout={layoutEnum} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default HeroBlock
