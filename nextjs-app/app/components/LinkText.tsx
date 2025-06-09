import React from 'react'
import Link from 'next/link'
import { IconPosition, LinkTarget, TextSize, FontWeight } from '../types/ui'
import { getLucideIcon } from '../utils/icons'

interface LinkTextProps {
  label: string
  url: string
  icon?: string
  iconPosition?: IconPosition
  target?: LinkTarget
  className?: string
  textSize?: TextSize
  fontWeight?: FontWeight
}

export const LinkText: React.FC<LinkTextProps> = ({
  label,
  url,
  icon,
  iconPosition = IconPosition.LEFT,
  target = LinkTarget.BLANK,
  className = '',
  textSize = TextSize.BASE,
  fontWeight = FontWeight.MEDIUM,
}) => {
  const ButtonIcon = icon ? getLucideIcon(icon) : null

  const sizeClass = `text-${textSize}`
  const weightClass = `font-${fontWeight}`
  const baseClasses = `inline-flex items-center gap-2 leading-normal transition-colors hover:opacity-80 ${sizeClass} ${weightClass} tracking-wide`

  const iconClasses =
    iconPosition === IconPosition.RIGHT ? 'order-2' : 'order-1'
  const textClasses =
    iconPosition === IconPosition.RIGHT ? 'order-1' : 'order-2'

  return (
    <Link href={url} target={target} className={`${baseClasses} ${className}`}>
      {ButtonIcon && (
        <ButtonIcon
          className={`h-4 w-4 shrink-0 ${iconClasses}`}
          aria-hidden="true"
        />
      )}
      <span className={textClasses}>{label}</span>
    </Link>
  )
}
