import React from 'react'
import {
  BackgroundTheme,
  BACKGROUND_COLOR_MAP,
} from '../../types/design-tokens'
import { EmbedVariant } from '../../types/ui'
import { useEmbed } from '../../hooks/use-embed'
import { EMBED_DIMENSIONS } from '../../utils/embed-utils'

interface EmbedContainerProps {
  embedCode: string
  variant?: EmbedVariant
  height?: string
  width?: string
  outerBackground?: BackgroundTheme
  mobileMessage?: string
  mobileVideo?: string
}

export const EmbedContainer: React.FC<EmbedContainerProps> = ({
  embedCode,
  variant = EmbedVariant.CONTAINED,
  height = EMBED_DIMENSIONS.HEIGHT.AUTO,
  width = EMBED_DIMENSIONS.WIDTH.FULL,
  outerBackground = BackgroundTheme.WHITE,
  mobileMessage = 'This content is best viewed on desktop.',
  mobileVideo,
}) => {
  const backgroundColor = BACKGROUND_COLOR_MAP[outerBackground]

  const containerRef = useEmbed({
    embedCode,
    height:
      height === EMBED_DIMENSIONS.HEIGHT.AUTO
        ? EMBED_DIMENSIONS.HEIGHT.DEFAULT
        : height,
    disabled: false, // Always enable, let CSS handle responsive behavior
  })

  return (
    <>
      <section
        style={{ backgroundColor }}
        className="block md:hidden py-10 text-center"
      >
        {mobileVideo ? (
          <video src={mobileVideo} controls className="w-full" />
        ) : (
          <p className="text-lg font-bold">{mobileMessage}</p>
        )}
      </section>

      {variant === EmbedVariant.FULL_WIDTH ? (
        <section className="hidden md:block w-full">
          <div ref={containerRef} className="w-full overflow-hidden" />
        </section>
      ) : (
        <section
          className="hidden md:block py-10 px-5 sm:px-10 md:px-20"
          style={{ backgroundColor }}
        >
          <div
            className="relative mx-auto max-w-[1376px] rounded-xl overflow-hidden"
            style={{ width, height }}
            ref={containerRef}
          />
        </section>
      )}
    </>
  )
}
