import { useRef, useEffect } from 'react'
import {
  processEmbedCode,
  createEmbedFragment,
  clearContainerContent,
  EmbedProcessingOptions,
} from '../utils/embed-utils'

interface UseEmbedOptions extends EmbedProcessingOptions {
  disabled?: boolean
}

export const useEmbed = ({
  embedCode,
  height,
  disabled = false,
}: UseEmbedOptions) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (disabled || !containerRef.current || !embedCode) return

    const container = containerRef.current
    const processedContent = processEmbedCode({
      embedCode,
      height,
    })
    const fragment = createEmbedFragment(processedContent)

    clearContainerContent(container)
    container.appendChild(fragment)

    return () => {
      if (container) {
        clearContainerContent(container)
      }
    }
  }, [embedCode, height, disabled])

  return containerRef
}
