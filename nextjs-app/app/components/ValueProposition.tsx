import React from 'react'
import { ValuePropImageColumn } from './ValuePropImageColumn'
import { ValuePropDefaultColumn } from './ValuePropDefaultColumn'
import { ValuePropTestimonialColumn } from './ValuePropTestimonialColumn'

export enum ValuePropositionColumnType {
  CONTENT = 'content',
  IMAGE = 'image',
  TESTIMONIAL = 'testimonial',
}

export interface ListItem {
  icon: string
  text: string
}

export interface ContentColumn {
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

export interface ImageColumn {
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

export interface TestimonialColumn {
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

export type Column = ContentColumn | ImageColumn | TestimonialColumn

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
          {columns &&
            columns.length > 0 &&
            columns.map((column, index) => {
              if (column.columnType === ValuePropositionColumnType.IMAGE) {
                return (
                  <ValuePropImageColumn key={index} column={column} />
                )
              }

              if (column.columnType === ValuePropositionColumnType.TESTIMONIAL) {
                return (
                  <ValuePropTestimonialColumn
                    key={index}
                    column={column}
                  />
                )
              }

              return (
                <ValuePropDefaultColumn key={index} column={column} />
              )
            })}
        </div>
      </div>
    </section>
  )
}
