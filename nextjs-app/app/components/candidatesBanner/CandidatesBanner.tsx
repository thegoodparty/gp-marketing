import React from 'react'
import { SanityImage } from '../../types/sanity'
import CandidatesBannerProfile from './CandidatesBannerProfile'

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
              <CandidatesBannerProfile
                key={`${img.asset?._ref || 'img'}-${i}`}
                img={img}
                index={i}
              />
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
