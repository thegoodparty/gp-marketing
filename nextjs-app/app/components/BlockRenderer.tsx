import React from 'react'

import Cta from '@/app/components/CTABlock'
import Info from '@/app/components/InfoSection'
import { dataAttr } from '@/sanity/lib/utils'
import PageHero from '@/app/components/PageHero'
import ValueProposition from '@/app/components/valueProp/ValueProposition'
import TestimonialBlock from '@/app/components/testimonial/TestimonialBlock'
import FeatureModules from '@/app/components/FeatureModules'
import CTACardBlock from '@/app/components/CTACardBlock'
import FAQBlock from '@/app/components/FAQBlock'
import StepperBlock from '@/app/components/StepperBlock'
import PricingBlock from '@/app/components/pricing/PricingBlock'
import HeroBlock from '@/app/components/hero/HeroBlock'
import CandidatesBanner from '@/app/components/candidatesBanner/CandidatesBanner'
import CTABanner from '@/app/components/CTABanner'
import CarouselBlock from '@/app/components/carousel/CarouselBlock'
import { EmbedBlock } from '@/app/components/embed/EmbedBlock'

type BlocksType = {
  [key: string]: React.FC<any>
}

type BlockType = {
  _type: string
  _key: string
}

type BlockProps = {
  index: number
  block: BlockType
  pageId: string
  pageType: string
}

const Blocks: BlocksType = {
  candidatesBanner: CandidatesBanner,
  callToAction: Cta,
  ctaBanner: CTABanner,
  ctaCardBlock: CTACardBlock,
  carouselBlock: CarouselBlock,
  embedBlock: EmbedBlock,
  embedFullWidthBlock: EmbedBlock,
  faqBlock: FAQBlock,
  featureModules: FeatureModules,
  heroBlock: HeroBlock,
  infoSection: Info,
  pageHero: PageHero,
  pricingBlock: PricingBlock,
  stepperBlock: StepperBlock,
  testimonialBlock: TestimonialBlock,
  valueProposition: ValueProposition,
}

/**
 * Used by the <PageBuilder>, this component renders a the component that matches the block type.
 */
export default function BlockRenderer({
  block,
  index,
  pageId,
  pageType,
}: BlockProps) {
  // Block does exist
  if (typeof Blocks[block._type] !== 'undefined') {
    return (
      <div
        key={block._key}
        data-sanity={dataAttr({
          id: pageId,
          type: pageType,
          path: `pageBuilder[_key=="${block._key}"]`,
        }).toString()}
      >
        {React.createElement(Blocks[block._type], {
          key: block._key,
          block: block,
          index: index,
        })}
      </div>
    )
  }
  // Block doesn't exist yet
  return React.createElement(
    () => (
      <div className="w-full bg-gray-100 text-center text-gray-500 p-20 rounded">
        A &ldquo;{block._type}&rdquo; block hasn&apos;t been created
      </div>
    ),
    { key: block._key },
  )
}
