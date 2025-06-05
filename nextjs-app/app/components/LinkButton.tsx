import React from 'react'
import { Button } from 'goodparty-styleguide'
import Link from 'next/link'
import { type ButtonVariant, DEFAULT_BUTTON_VARIANT } from '../types/ui'
import { getLucideIcon } from '../utils/icons'

interface LinkButtonProps {
  label: string
  url: string
  icon?: string
  variant?: ButtonVariant
  iconPosition?: 'left' | 'right'
  target?: '_blank' | '_self'
  className?: string
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  label,
  url,
  icon,
  variant = DEFAULT_BUTTON_VARIANT,
  iconPosition = 'left',
  target = '_blank',
  className = '',
}) => {
  const ButtonIcon = icon ? getLucideIcon(icon) : null

  return (
    <Link href={url} target={target} className={`inline-block ${className}`}>
      <Button iconPosition={iconPosition} variant={variant as any}>
        {ButtonIcon && <ButtonIcon className="mr-2 h-4 w-4" />}
        {label}
      </Button>
    </Link>
  )
}
