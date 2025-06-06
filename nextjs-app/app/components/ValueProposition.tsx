import React from 'react'
import { urlForImage } from '@/sanity/lib/utils'
import Image from 'next/image'
import { getLucideIcon } from '../utils/icons'
import { LinkButton } from './LinkButton'
import { ValuePropositionTestimonial } from './ValuePropositionTestimonial'

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

  if (!columns || columns.length !== 2) {
    return null
  }

  return (
    <section className="py-[60px] px-5 lg:py-12 lg:px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {columns.map((column, index) => {
            if (column.columnType === ValuePropositionColumnType.IMAGE) {
              const imageUrl = urlForImage(column.image)
                ?.width(624)
                .height(466)
                .fit('crop')
                .crop('center')
                .url()

              if (!imageUrl) {
                return null
              }

              return (
                <div key={index} className="flex-1 rounded-3xl overflow-hidden">
                  <div className="relative w-full h-[300px] lg:h-[466px]">
                    <Image
                      src={imageUrl}
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
                <div key={index} className="flex-1">
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
                className="flex-1 rounded-3xl p-5 lg:p-12"
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
                      icon={column.button.icon}
                      variant="secondary"
                      iconPosition="right"
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
