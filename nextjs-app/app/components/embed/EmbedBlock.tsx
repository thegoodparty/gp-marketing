import React from 'react'
import {
  EmbedBlock as EmbedBlockType,
  EmbedFullWidthBlock,
} from '../../types/sanity'
import { EmbedVariant } from '../../types/ui'
import { EmbedContainer } from './EmbedContainer'

interface EmbedBlockProps {
  block: EmbedBlockType | EmbedFullWidthBlock
}

export const EmbedBlock: React.FC<EmbedBlockProps> = ({ block }) => {
  const { embedCode, outerBackground, height } = block

  const variant = 'variant' in block ? block.variant : EmbedVariant.CONTAINED
  const width = 'width' in block ? block.width : undefined
  const mobileMessage =
    'mobileMessage' in block ? block.mobileMessage : undefined
  const mobileVideo = 'mobileVideo' in block ? block.mobileVideo : undefined

  return (
    <EmbedContainer
      embedCode={embedCode}
      variant={variant}
      outerBackground={outerBackground}
      width={width}
      height={height}
      mobileMessage={mobileMessage}
      mobileVideo={mobileVideo}
    />
  )
}
