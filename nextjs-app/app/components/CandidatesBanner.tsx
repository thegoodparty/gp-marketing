import React from 'react'
import Image from 'next/image'
import { urlForImage } from '../../sanity/lib/utils'
import { SanityImage } from '../types/sanity'
import { DesignTokens } from '../types/design-tokens'
import styles from './CandidatesBanner.module.css'

const CANDIDATE_BORDER_COLOR_VALUES = [
  DesignTokens.COLOR_BLUE_200,
  DesignTokens.COLOR_LAVENDER_100,
  DesignTokens.COLOR_WAXFLOWER_100,
] as const

const BORDER_CLASS_MAP = {
  [DesignTokens.COLOR_BLUE_200]: styles.borderBlue,
  [DesignTokens.COLOR_LAVENDER_100]: styles.borderLavender,
  [DesignTokens.COLOR_WAXFLOWER_100]: styles.borderWaxflower,
} as const

interface CandidatesBannerProps {
  block: {
    headline: string
    profiles: SanityImage[]
  }
  index: number
}

export default function CandidatesBanner({ block }: CandidatesBannerProps) {
  return (
    <section className="py-10 px-5 sm:px-10 md:px-20 bg-white">
      <div className="mx-auto max-w-[1376px] bg-brand-secondary rounded-xl px-16 [@media(max-width:360px)]:px-8 py-12">
        <div className="flex items-center justify-center gap-9 [@media(max-width:360px)]:flex-col">
          <div className="flex -space-x-10 justify-center">
            {block.profiles?.map((img, i) => (
              <div
                key={`${img.asset?._ref || 'img'}-${i}`}
                className="relative size-16 rounded-full overflow-hidden"
              >
                <Image
                  src={urlForImage(img)?.width(128).height(128).url() as string}
                  alt={img.alt || 'Candidate headshot'}
                  fill
                  className="object-cover"
                />

                <span
                  className={`${styles.avatarWrapper} ${
                    BORDER_CLASS_MAP[
                      CANDIDATE_BORDER_COLOR_VALUES[
                        i % CANDIDATE_BORDER_COLOR_VALUES.length
                      ]
                    ]
                  }`}
                />
              </div>
            ))}
          </div>

          <h2 className="font-bold leading-[150%] text-[22px] text-center md:text-left text-white">
            {block.headline}
          </h2>
        </div>
      </div>
    </section>
  )
}
