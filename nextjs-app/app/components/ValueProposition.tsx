import React from 'react'
import { urlForImage } from '@/sanity/lib/utils'
import Image from 'next/image'
import { getLucideIcon } from '../utils/icons'
import { LinkButton } from './LinkButton'
import { ValuePropositionTestimonial } from './ValuePropositionTestimonial'
import { ButtonVariant } from '../types/design-tokens'
import { IconPosition } from '../types/ui'

enum ValuePropositionColumnType {
  CONTENT = 'content',
  IMAGE = 'image',
  TESTIMONIAL = 'testimonial',
}

interface ListItem {
  icon: string
  text: string
}

interface ContentColumn {
  columnType: ValuePropositionColumnType.CONTENT
  title: string
  backgroundColor: string
  items: ListItem[]
  button?: {
    label: string
    url: string
    icon?: string
  }
}

interface ImageColumn {
  columnType: ValuePropositionColumnType.IMAGE
  image: {
    asset: {
      _ref: string
    }
    alt: string
    hotspot?: {
      x: number
      y: number
    }
    crop?: {
      top: number
      bottom: number
      left: number
      right: number
    }
  }
}

interface TestimonialColumn {
  columnType: ValuePropositionColumnType.TESTIMONIAL
  backgroundColor: string
  quote: string
  authorName: string
  authorTitle: string
  authorImage: {
    asset: {
      _ref: string
    }
    alt: string
    hotspot?: {
      x: number
      y: number
    }
    crop?: {
      top: number
      bottom: number
      left: number
      right: number
    }
  }
}

type Column = ContentColumn | ImageColumn | TestimonialColumn

interface ValuePropositionProps {
  block: {
    columns: Column[]
  }
}

export default function ValueProposition({ block }: ValuePropositionProps) {
  const { columns } = block

  return (
    <section className="py-10 xl:py-20 px-5 sm:px-10 xl:px-20 2xl:px-[clamp(20px,4vw,160px)]">
      <div className="mx-auto w-full max-w-[1376px]">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {columns && columns.length > 0 && columns.map((column, index) => {
            if (column.columnType === ValuePropositionColumnType.IMAGE) {
              const imageUrl = urlForImage(column.image)
                ?.width(624)
                .height(466)
                .fit('crop')
                .crop('center')
                .url()

              return (
                <div key={index} className="flex-1 basis-1/2 rounded-3xl overflow-hidden">
                  <div className="relative w-full h-[300px] lg:h-[466px]">
                    <Image
                      src={imageUrl || ''}
                      alt={column.image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 624px"
                    />
                  </div>
                </div>
              )
            }

            if (column.columnType === ValuePropositionColumnType.TESTIMONIAL) {
              return (
                <div key={index} className="flex-1 basis-1/2">
                  <ValuePropositionTestimonial
                    quote={column.quote}
                    authorName={column.authorName}
                    authorTitle={column.authorTitle}
                    authorImage={column.authorImage}
                    backgroundColor={column.backgroundColor}
                  />
                </div>
              )
            }

            return (
              <div
                key={index}
                className="flex-1 basis-1/2 rounded-3xl p-5 sm:p-8 xl:p-12"
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
          })}
        </div>
      </div>
    </section>
  )
}
