import React, { useRef, useEffect } from 'react'
import { BackgroundTheme, BACKGROUND_COLOR_MAP } from '../types/design-tokens'
import { EmbedFullWidthBlock as BlockType } from '../types/sanity'
import { EmbedVariant } from '../types/ui'
import { useIsMobile } from '../hooks/use-mobile'

interface Props {
  block: BlockType
}

export const EmbedFullWidthBlock: React.FC<Props> = ({ block }) => {
  const isMobile = useIsMobile()
  const ref = useRef<HTMLDivElement>(null)
  const {
    embedCode,
    variant = EmbedVariant.CONTAINED,
    height = '600px',
    outerBackground = BackgroundTheme.WHITE,
    mobileMessage = 'This content is best viewed on desktop.',
    mobileVideo,
  } = block
  const bg = BACKGROUND_COLOR_MAP[outerBackground]

  useEffect(() => {
    if (isMobile || !ref.current || !embedCode) return

    let content = embedCode

    // If it's just a URL, wrap it in an iframe
    if (!embedCode.startsWith('<')) {
      content = `<iframe src="${embedCode}" style="border:none;width:100%;height:${height};" allow="fullscreen"></iframe>`
    } else {
      // If it's HTML with height="100%", convert to the specified height
      content = embedCode.replace(/height="100%"/g, `height="${height}"`)
    }

    // Optional sanitization: const sanitized = DOMPurify.sanitize(content)
    const fragment = document.createRange().createContextualFragment(content)

    // Clear existing content
    while (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild)
    }

    ref.current.appendChild(fragment)

    return () => {
      while (ref.current?.firstChild) {
        ref.current.removeChild(ref.current.firstChild)
      }
    }
  }, [embedCode, height, isMobile])

  if (isMobile) {
    return (
      <section style={{ backgroundColor: bg }} className="py-10 text-center">
        {mobileVideo ? (
          <video src={mobileVideo} controls className="w-full" />
        ) : (
          <p className="text-lg font-bold">{mobileMessage}</p>
        )}
      </section>
    )
  }

  // Full width variant: edge-to-edge, no padding, natural height
  if (variant === EmbedVariant.FULL_WIDTH) {
    return (
      <section className="w-full">
        <div ref={ref} className="w-full overflow-hidden" />
      </section>
    )
  }

  // Contained variant: with padding and background, natural height
  return (
    <section
      className="py-10 px-5 sm:px-10 md:px-20"
      style={{ backgroundColor: bg }}
    >
      <div
        className="relative mx-auto max-w-[1376px] rounded-xl overflow-hidden"
        style={{ width: '100%' }}
        ref={ref}
      />
    </section>
  )
}
