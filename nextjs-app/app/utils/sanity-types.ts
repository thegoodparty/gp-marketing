export enum SanityType {
  REFERENCE = 'reference',
  DOCUMENT = 'document',
  OBJECT = 'object',
  ARRAY = 'array',
  IMAGE = 'image',
  FILE = 'file',
}

export enum LinkType {
  HREF = 'href',
  PAGE = 'page',
  POST = 'post',
}

export interface SanityReference {
  _ref: string
  _type: SanityType.REFERENCE
  _weak?: boolean
}

export interface SanityImageAsset {
  _ref: string
  _type: SanityType.REFERENCE
}

export interface SanityImage {
  asset: SanityImageAsset
  alt?: string
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
  caption?: string
}

export interface SanityDocumentReference {
  _ref: string
  _type: SanityType.REFERENCE
}

export interface SanityLink {
  linkType?: LinkType
  href?: string
  page?: SanityDocumentReference
  post?: SanityDocumentReference
  openInNewTab?: boolean
}

export interface SanityArrayItem {
  _key: string
  _type: string
}

export interface SanityDocument {
  _id: string
  _type: string
  _createdAt: string
  _updatedAt: string
  _rev: string
}

export const createSanityReference = (
  id: string,
  weak: boolean = false,
): SanityReference => ({
  _ref: id,
  _type: SanityType.REFERENCE,
  ...(weak && { _weak: true }),
})

export const isSanityReference = (obj: any): obj is SanityReference => {
  return (
    obj &&
    typeof obj === 'object' &&
    obj._type === SanityType.REFERENCE &&
    typeof obj._ref === 'string'
  )
}

export const isExternalLink = (link: SanityLink): boolean => {
  return link.linkType === LinkType.HREF && Boolean(link.href)
}

export const isPageLink = (link: SanityLink): boolean => {
  return link.linkType === LinkType.PAGE && Boolean(link.page)
}

export const isPostLink = (link: SanityLink): boolean => {
  return link.linkType === LinkType.POST && Boolean(link.post)
}
