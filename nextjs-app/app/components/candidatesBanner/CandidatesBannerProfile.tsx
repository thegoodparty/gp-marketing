import React from 'react'
import Image from 'next/image'
import { urlForImage } from '../../../sanity/lib/utils'
import { SanityImage } from '../../types/sanity'
import { DesignTokens } from '../../types/design-tokens'
import styles from './CandidatesBanner.module.css'

const CANDIDATE_BORDER_COLOR_VALUES = [
  DesignTokens.COLOR_BLUE_200,
  DesignTokens.COLOR_LAVENDER_100,
  DesignTokens.COLOR_WAXFLOWER_100,
] as const

const BORDER_CLASS_MAP: Record<string, string> = {
  [DesignTokens.COLOR_BLUE_200]: styles.borderBlue,
  [DesignTokens.COLOR_LAVENDER_100]: styles.borderLavender,
  [DesignTokens.COLOR_WAXFLOWER_100]: styles.borderWaxflower,
}

interface CandidatesBannerProfileProps {
  img: SanityImage
  index: number
}

export default function CandidatesBannerProfile({
  img,
  index,
}: CandidatesBannerProfileProps) {
  const borderColor =
    CANDIDATE_BORDER_COLOR_VALUES[index % CANDIDATE_BORDER_COLOR_VALUES.length]
  const borderClass = BORDER_CLASS_MAP[borderColor]

  return (
    <div className="relative size-16 rounded-full overflow-hidden">
      <Image
        src={urlForImage(img)?.width(128).height(128).url() as string}
        alt={img.alt || 'Candidate headshot'}
        fill
        className="object-cover"
      />
      <span className={`${styles.avatarWrapper} ${borderClass}`} />
    </div>
  )
}
