import React from 'react'
import { Button } from 'goodparty-styleguide'
import * as LucideIcons from 'lucide-react'

interface ListItem {
  icon: string
  text: string
}

interface Column {
  title: string
  backgroundColor: string
  items: ListItem[]
  button?: {
    label: string
    url: string
    icon?: string
  }
}

interface ProblemSectionProps {
  block: {
    columns: Column[]
  }
}

// Helper to get Lucide icon component
const getLucideIcon = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName]
  return IconComponent || LucideIcons.HelpCircle // Fallback icon
}

export default function ProblemSection({ block }: ProblemSectionProps) {
  const { columns } = block

  if (!columns || columns.length !== 2) {
    return null
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {columns.map((column, index) => {
            const ButtonIcon = column.button?.icon
              ? getLucideIcon(column.button.icon)
              : null

            return (
              <div
                key={index}
                className="flex-1 rounded-3xl p-8 lg:p-12"
                style={{ backgroundColor: column.backgroundColor }}
              >
                {/* Column Title */}
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                  {column.title}
                </h2>

                {/* List Items */}
                <div className="space-y-6 mb-8">
                  {column.items.map((item, itemIndex) => {
                    const ItemIcon = getLucideIcon(item.icon)

                    return (
                      <div key={itemIndex} className="flex items-start gap-4">
                        {/* Icon Container */}
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center">
                          <ItemIcon className="w-5 h-5 text-gray-700" />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 pt-1">
                          <p className="text-gray-900 leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* CTA Button */}
                {column.button && column.button.label && column.button.url && (
                  <div className="mt-8">
                    <Button
                      variant="default"
                      onClick={() => window.open(column.button!.url, '_blank')}
                    >
                      {ButtonIcon && <ButtonIcon className="mr-2 h-4 w-4" />}
                      {column.button.label}
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
