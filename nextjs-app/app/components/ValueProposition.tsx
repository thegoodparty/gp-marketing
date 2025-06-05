import React from 'react'
import { Button } from 'goodparty-styleguide'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import { urlForImage } from '@/sanity/lib/utils'
import Image from 'next/image'
import { GoodPartyOrgLogo } from './icons/GoodPartyOrgLogo'

interface InlineTestimonialCardProps {
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
  backgroundColor?: string
  className?: string
}

const InlineTestimonialCard: React.FC<InlineTestimonialCardProps> = ({
  quote,
  authorName,
  authorTitle,
  authorImage,
  backgroundColor = '#FFFFFF',
  className = '',
}) => {
  const authorImageUrl = urlForImage(authorImage)
    ?.width(160)
    .height(160)
    .fit('crop')
    .crop('center')
    .url()

  if (!authorImageUrl) {
    return null
  }

  return (
    <div
      className={`rounded-3xl p-5 lg:p-12 flex flex-col h-full ${className}`}
      style={{ backgroundColor }}
    >
      <div className="flex-grow">
        <div className="mb-8">
          <GoodPartyOrgLogo />
        </div>

        <div className="mb-8">
          <p className="text-[18px] font-normal lg:text-[24px] lg:font-semibold text-gray-900 leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-auto">
        <div className="relative w-[48px] h-[48px] lg:w-[80px] lg:h-[80px] rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={authorImageUrl}
            alt={authorImage.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 48px, 80px"
          />
        </div>
        <div>
          <p className="text-[16px] font-semibold lg:text-[20px] lg:font-semibold text-gray-900">
            {authorName}
          </p>
          <p className="text-[12px] font-normal text-gray-900">{authorTitle}</p>
        </div>
      </div>
    </div>
  )
}

interface ListItem {
  icon: string
  text: string
}

interface ContentColumn {
  columnType: 'content'
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
  columnType: 'image'
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
  columnType: 'testimonial'
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

const getIconFromModule = <T extends Record<string, unknown>>(
  iconModule: T,
  iconName: string,
): LucideIcon | undefined => {
  return iconModule[iconName] as LucideIcon | undefined
}

const getLucideIcon = (iconName: string): LucideIcon => {
  const IconComponent = getIconFromModule(LucideIcons, iconName)
  return IconComponent || LucideIcons.HelpCircle
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
            if (column.columnType === 'image') {
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

            if (column.columnType === 'testimonial') {
              return (
                <div key={index} className="flex-1">
                  <InlineTestimonialCard
                    quote={column.quote}
                    authorName={column.authorName}
                    authorTitle={column.authorTitle}
                    authorImage={column.authorImage}
                    backgroundColor={column.backgroundColor}
                  />
                </div>
              )
            }

            const ButtonIcon = column.button?.icon
              ? getLucideIcon(column.button.icon)
              : null

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
                    <Link
                      href={column.button.url}
                      target="_blank"
                      className="inline-block"
                    >
                      <Button iconPosition="right" variant="secondary">
                        {ButtonIcon && <ButtonIcon className="mr-2 h-4 w-4" />}
                        {column.button.label}
                      </Button>
                    </Link>
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
