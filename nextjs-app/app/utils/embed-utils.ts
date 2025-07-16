export const EMBED_DIMENSIONS = {
  HEIGHT: {
    AUTO: 'auto',
    DEFAULT: '600px',
  },
  WIDTH: {
    FULL: '100%',
  },
} as const

export interface EmbedProcessingOptions {
  embedCode: string
  height?: string
}

export const processEmbedCode = ({
  embedCode,
  height = EMBED_DIMENSIONS.HEIGHT.DEFAULT,
}: EmbedProcessingOptions): string => {
  if (!embedCode) return ''

  return embedCode.startsWith('<')
    ? embedCode.replace(/height="100%"/g, `height="${height}"`)
    : embedCode
}

export const createEmbedFragment = (content: string): DocumentFragment => {
  const range = document.createRange()
  return range.createContextualFragment(content)
}

export const clearContainerContent = (container: HTMLElement): void => {
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }
}
