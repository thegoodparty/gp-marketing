import React from 'react'
import Link from 'next/link'
import { getLucideIcon } from '../utils/icons'
import { mapSanityColorToDesignToken } from '../utils/color-mapping'
import { LinkTarget } from '../types/ui'

export interface CTACardProps {
  overline?: string
  heading: string
  backgroundColor: string
  url: string
  icon?: string
  linkTarget?: LinkTarget
}

const CTACard = ({
  overline,
  heading,
  backgroundColor,
  url,
  icon,
  linkTarget,
}: CTACardProps) => {
  const IconComponent = getLucideIcon(icon || 'ArrowRight')

  const bgColor = mapSanityColorToDesignToken(backgroundColor)

  return (
    <Link
      href={url}
      target={linkTarget || LinkTarget.BLANK}
      className="block rounded-3xl p-[40px] h-full"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex flex-col h-full justify-between">
        {overline && (
          <div className="text-lg font-medium leading-[28px]">{overline}</div>
        )}
        <div className="flex flex-row items-center justify-between w-full">
          <h2 className="text-6xl font-semibold leading-none">{heading}</h2>
          <IconComponent className="w-14 h-14" />
        </div>
      </div>
    </Link>
  )
}

export default CTACard
