import { useMemo } from 'react'
import { EMBED_DIMENSIONS } from '../types/ui'

interface UseProcessedEmbedCodeOptions {
  embedCode: string
  height?: string
}

export const useProcessedEmbedCode = ({
  embedCode,
  height = EMBED_DIMENSIONS.HEIGHT.DEFAULT,
}: UseProcessedEmbedCodeOptions) => {
  return useMemo(() => {
    if (!embedCode) return ''

    return embedCode.startsWith('<')
      ? embedCode.replace(/height="100%"/g, `height="${height}"`)
      : embedCode
  }, [embedCode, height])
}
