import React from 'react'
import { EmbedBlock as EmbedBlockType } from '../../types/sanity'
import { EmbedVariant } from '../../types/ui'
import { EmbedContainer } from './EmbedContainer'

interface EmbedBlockProps {
  block: EmbedBlockType
}

export const EmbedBlock: React.FC<EmbedBlockProps> = ({ block }) => {
  const { embedCode, outerBackground, width, height } = block

  return (
    <EmbedContainer
      embedCode={embedCode}
      variant={EmbedVariant.CONTAINED}
      outerBackground={outerBackground}
      width={width}
      height={height}
    />
  )
}
