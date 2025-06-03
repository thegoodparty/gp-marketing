export interface NavigationLink {
  title: string
  icon: string
  type: 'internal' | 'external'
  page?: {
    _type: 'reference'
    _ref: string
    slug: string
  }
  url?: string
}

export interface NavigationCategory {
  _type: 'category'
  _key: string
  title: string
  links: NavigationLink[]
}

export interface NavigationSingleLink {
  _type: 'link'
  _key: string
  title: string
  icon?: string
  type: 'internal' | 'external'
  page?: {
    _type: 'reference'
    _ref: string
    slug: string
  }
  url?: string
}

export type NavigationItem = NavigationCategory | NavigationSingleLink

export interface NavigationSettings {
  logo: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt: string
  }
  items: NavigationItem[]
  rightSideCTA?: {
    title: string
    url: string
  }
  rightSideSecondaryLink?: {
    title: string
    url: string
  }
}

export interface Settings {
  _id: string
  _type: 'settings'
  _createdAt: string
  _updatedAt: string
  _rev: string
  title: string
  description?: Array<{
    children?: Array<{
      marks?: Array<string>
      text?: string
      _type: 'span'
      _key: string
    }>
    style?: 'normal'
    listItem?: never
    markDefs?: Array<{
      href: string
      _type: 'link'
      _key: string
    }>
    level?: number
    _type: 'block'
    _key: string
  }>
  ogImage?: {
    asset?: {
      _ref: string
      _type: 'reference'
      _weak?: boolean
    }
    hotspot?: {
      x: number
      y: number
      height: number
      width: number
    }
    crop?: {
      top: number
      bottom: number
      left: number
      right: number
    }
    alt?: string
    metadataBase?: string
    _type: 'image'
  }
  navigation: NavigationSettings
}
