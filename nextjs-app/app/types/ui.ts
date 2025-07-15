export enum Alignment {
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center',
}

export enum IconPosition {
  LEFT = 'left',
  RIGHT = 'right',
}

export enum LinkTarget {
  BLANK = '_blank',
  SELF = '_self',
}

export enum TextSize {
  SM = 'sm',
  BASE = 'base',
  LG = 'lg',
  XL = 'xl',
}

export enum FontWeight {
  REGULAR = 'regular',
  MEDIUM = 'medium',
  SEMIBOLD = 'semibold',
}

export enum HeroLayout {
  HEADER_ONLY = 'headerOnly',
  TWO_COLUMN_IMAGE_LEFT = 'twoColumnImageLeft',
  TWO_COLUMN_IMAGE_RIGHT = 'twoColumnImageRight',
  IMAGE_FULL_WIDTH = 'imageFullWidth',
  IMAGE_CONTAINED = 'imageContained',
}

export const HERO_LAYOUT_OPTIONS = [
  { title: 'Header Only', value: HeroLayout.HEADER_ONLY },
  { title: 'Two Column - Image Left', value: HeroLayout.TWO_COLUMN_IMAGE_LEFT },
  {
    title: 'Two Column - Image Right',
    value: HeroLayout.TWO_COLUMN_IMAGE_RIGHT,
  },
  { title: 'Image Full Width', value: HeroLayout.IMAGE_FULL_WIDTH },
  { title: 'Image Contained', value: HeroLayout.IMAGE_CONTAINED },
] as const

export enum EmbedVariant {
  FULL_WIDTH = 'fullWidth',
  CONTAINED = 'contained',
}

export const EMBED_VARIANT_OPTIONS = [
  { title: 'Full Width', value: EmbedVariant.FULL_WIDTH },
  { title: 'Contained', value: EmbedVariant.CONTAINED },
] as const
