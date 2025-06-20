import React from 'react'
import { getLucideIcon } from '../../utils/icons'

export enum Direction {
  LEFT = 'left',
  RIGHT = 'right',
}

interface CarouselControlProps {
  onPrev: () => void
  onNext: () => void
  isDark?: boolean
  className?: string
}

const ArrowButton: React.FC<{
  direction: Direction
  onClick: () => void
  isDark: boolean
}> = ({ direction, onClick, isDark }) => {
  const Icon = getLucideIcon(
    direction === Direction.LEFT ? 'ArrowLeft' : 'ArrowRight',
  )
  const ariaLabel =
    direction === Direction.LEFT ? 'Scroll left' : 'Scroll right'

  const colorClasses = isDark
    ? 'text-white border border-white/60 hover:bg-white/10'
    : 'text-brand-secondary border border-brand-secondary/60 hover:bg-brand-secondary/10'

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`rounded-full p-3 disabled:opacity-30 ${colorClasses}`}
    >
      {Icon && <Icon className="h-6 w-6" />}
    </button>
  )
}

export const CarouselControl: React.FC<CarouselControlProps> = ({
  onPrev,
  onNext,
  isDark = true,
  className = '',
}) => {
  return (
    <div className={`flex gap-4 shrink-0 ${className}`}>
      <ArrowButton direction={Direction.LEFT} onClick={onPrev} isDark={isDark} />
      <ArrowButton direction={Direction.RIGHT} onClick={onNext} isDark={isDark} />
    </div>
  )
} 