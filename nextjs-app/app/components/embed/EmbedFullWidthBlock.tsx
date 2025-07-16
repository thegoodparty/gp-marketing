import React from 'react'
import { EmbedFullWidthBlock as BlockType } from '../../types/sanity'
import { EmbedContainer } from './EmbedContainer'

interface Props {
  block: BlockType
}

export const EmbedFullWidthBlock: React.FC<Props> = ({ block }) => {
  const {
    embedCode,
    variant,
    height,
    outerBackground,
    mobileMessage,
    mobileVideo,
  } = block

  return (
    <EmbedContainer
      embedCode={embedCode}
      variant={variant}
      height={height}
      outerBackground={outerBackground}
      mobileMessage={mobileMessage}
      mobileVideo={mobileVideo}
    />
  )
}
