import React from 'react'
import { Button } from 'goodparty-styleguide'
import Link from 'next/link'
import { ButtonVariant } from '../types/design-tokens'
import { IconPosition, LinkTarget } from '../types/ui'
import { getLucideIcon } from '../utils/icons'

interface LinkButtonProps {
  label: string
  url: string
  icon?: string
  variant?: ButtonVariant
  iconPosition?: IconPosition
  target?: LinkTarget
  className?: string
  buttonClassName?: string
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  label,
  url,
  icon,
  variant = ButtonVariant.DEFAULT,
  iconPosition = IconPosition.LEFT,
  target = LinkTarget.BLANK,
  className = '',
  buttonClassName = '',
}) => {
  const ButtonIcon = icon ? getLucideIcon(icon) : null

  return (
    <Link href={url} target={target} className={`inline-block ${className}`}>
      <Button
        iconPosition={iconPosition}
        variant={variant}
        className={buttonClassName}
      >
        {ButtonIcon && <ButtonIcon className="mr-2 h-4 w-4" />}
        {label}
      </Button>
    </Link>
  )
}
