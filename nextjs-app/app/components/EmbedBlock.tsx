import React, { useRef, useEffect } from 'react'
import { BackgroundTheme, BACKGROUND_COLOR_MAP } from '../types/design-tokens'
import { EmbedBlock as EmbedBlockType } from '../types/sanity'
// Optional: import DOMPurify from 'dompurify' for sanitization

interface EmbedBlockProps {
  block: EmbedBlockType
}

export const EmbedBlock: React.FC<EmbedBlockProps> = ({ block }) => {
  const {
    embedCode,
    outerBackground = BackgroundTheme.WHITE,
    width = '100%',
    height = 'auto',
  } = block

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !embedCode) return

    // Optional sanitization: const sanitized = DOMPurify.sanitize(embedCode)

    const range = document.createRange()
    range.selectNode(containerRef.current)
    const fragment = range.createContextualFragment(embedCode) // or sanitized

    // Clear existing content
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild)
    }

    containerRef.current.appendChild(fragment)

    return () => {
      // Cleanup: remove children to prevent memory leaks
      while (containerRef.current?.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }
    }
  }, [embedCode])

  const backgroundColor = BACKGROUND_COLOR_MAP[outerBackground]

  return (
    <section
      className="py-10 px-5 sm:px-10 md:px-20"
      style={{ backgroundColor }}
    >
      <div
        className="relative mx-auto max-w-[1376px] rounded-xl overflow-hidden"
        style={{ width, height }}
        ref={containerRef}
      />
    </section>
  )
}
