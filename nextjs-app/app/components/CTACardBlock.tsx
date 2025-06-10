import React from 'react'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import { type CtaCardBlock } from '@/sanity.types'
import {
  IconContainerColor,
  ICON_CONTAINER_COLORS,
} from '../types/design-tokens'

interface CTACardBlockProps {
  block: CtaCardBlock
}

// Icon helper function (reused pattern from other blocks)
const getLucideIcon = (iconName: string): LucideIcon => {
  const IconComponent = LucideIcons[
    iconName as keyof typeof LucideIcons
  ] as LucideIcon
  return IconComponent || LucideIcons.ArrowRight
}

const CTACard = ({
  overline,
  heading,
  backgroundColor,
  url,
  icon,
  linkTarget,
}: NonNullable<CtaCardBlock['cards']>[0]) => {
  const IconComponent = getLucideIcon(icon || 'ArrowRight')

  // Map backgroundColor string to IconContainerColor enum key
  const colorMap: Record<string, IconContainerColor> = {
    'red-200': IconContainerColor.RED,
    'blue-200': IconContainerColor.BLUE,
    'brightYellow-200': IconContainerColor.BRIGHT_YELLOW,
    'orange-200': IconContainerColor.ORANGE,
    'lavender-200': IconContainerColor.LAVENDER,
    'waxFlower-200': IconContainerColor.WAX_FLOWER,
    'haloGreen-200': IconContainerColor.HALO_GREEN,
  }

  const colorKey = colorMap[backgroundColor] || IconContainerColor.BLUE
  const bgColor = ICON_CONTAINER_COLORS[colorKey]

  return (
    <Link
      href={url}
      target={linkTarget || '_blank'}
      className="block rounded-3xl p-[40px] transition-all duration-300 hover:scale-105 group h-full"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex flex-col gap-40 items-start justify-start h-full">
        {overline && (
          <div className="text-lg font-medium leading-[28px]">{overline}</div>
        )}
        <div className="flex flex-row items-center justify-between w-full">
          <h2 className="text-6xl font-semibold leading-none">{heading}</h2>
          <IconComponent className="w-14 h-14 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </Link>
  )
}

export default function CTACardBlock({ block }: CTACardBlockProps) {
  const { cards } = block

  if (!cards || cards.length !== 2) {
    return null
  }

  return (
    <section className="px-5 lg:px-20 py-12 lg:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {cards.map((card, index) => (
            <CTACard key={index} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
