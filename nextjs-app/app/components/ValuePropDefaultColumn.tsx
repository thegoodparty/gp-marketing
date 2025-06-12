import React from 'react'
import { getLucideIcon } from '../utils/icons'
import { LinkButton } from './LinkButton'
import { ButtonVariant } from '../types/design-tokens'
import { IconPosition } from '../types/ui'
import type { ContentColumn } from './ValueProposition'

interface ValuePropDefaultColumnProps {
  column: ContentColumn
  className?: string
}

export const ValuePropDefaultColumn: React.FC<ValuePropDefaultColumnProps> = ({
  column,
  className = '',
}) => {
  return (
    <div
      className={`flex-1 basis-1/2 rounded-3xl p-5 sm:p-8 xl:p-12 ${className}`}
      style={{ backgroundColor: column.backgroundColor }}
    >
      <h3 className="text-[40px] font-semibold text-gray-900 mb-8 leading-tight">
        {column.title}
      </h3>

      <div className="space-y-6 mb-8">
        {column.items.map((item, itemIndex) => {
          const ItemIcon = getLucideIcon(item.icon)

          return (
            <div key={itemIndex} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <ItemIcon className="w-5 h-5 text-gray-700" />
              </div>

              <div className="flex-1 pt-1">
                <p className="text-lead text-[20px] text-gray-900 leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {column.button && column.button.label && column.button.url && (
        <div className="mt-8">
          <LinkButton
            label={column.button.label}
            url={column.button.url}
            icon={column.button.icon || 'ArrowUpRight'}
            variant={ButtonVariant.SECONDARY}
            iconPosition={IconPosition.RIGHT}
          />
        </div>
      )}
    </div>
  )
}
