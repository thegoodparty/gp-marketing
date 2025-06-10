import { LinkType } from './sanity'

export enum IconContainerColor {
  RED = 'red-200',
  BLUE = 'blue-200',
  BRIGHT_YELLOW = 'brightYellow-200',
  ORANGE = 'orange-200',
  LAVENDER = 'lavender-200',
  WAX_FLOWER = 'waxFlower-200',
  HALO_GREEN = 'haloGreen-200',
  RED_100 = 'red-100',
  BLUE_100 = 'blue-100',
  BRIGHT_YELLOW_100 = 'brightYellow-100',
  ORANGE_100 = 'orange-100',
  LAVENDER_100 = 'lavender-100',
  WAX_FLOWER_100 = 'waxFlower-100',
  HALO_GREEN_100 = 'haloGreen-100',
}

export enum BackgroundTheme {
  DARK = 'dark',
  CREME = 'creme',
  WHITE = 'white',
}

export enum ButtonVariant {
  DEFAULT = 'default',
  SECONDARY = 'secondary',
  DESTRUCTIVE = 'destructive',
  OUTLINE = 'outline',
  GHOST = 'ghost',
  WHITE_GHOST = 'whiteGhost',
  WHITE_OUTLINE = 'whiteOutline',
}

export enum DesignTokens {
  // Icon container colors (-200 variants)
  COLOR_RED_200 = 'var(--color-red-200)',
  COLOR_BLUE_200 = 'var(--color-blue-200)',
  COLOR_BRIGHT_YELLOW_200 = 'var(--color-bright-yellow-200)',
  COLOR_ORANGE_200 = 'var(--color-orange-200)',
  COLOR_LAVENDER_200 = 'var(--color-lavender-200)',
  COLOR_WAXFLOWER_200 = 'var(--color-waxflower-200)',
  COLOR_HALOGREEN_200 = 'var(--color-halogreen-200)',

  // Icon container colors (-100 variants)
  COLOR_RED_100 = 'var(--color-red-100)',
  COLOR_BLUE_100 = 'var(--color-blue-100)',
  COLOR_BRIGHT_YELLOW_100 = 'var(--color-bright-yellow-100)',
  COLOR_ORANGE_100 = 'var(--color-orange-100)',
  COLOR_LAVENDER_100 = 'var(--color-lavender-100)',
  COLOR_WAXFLOWER_100 = 'var(--color-waxflower-100)',
  COLOR_HALOGREEN_100 = 'var(--color-halogreen-100)',

  // Background colors
  COLOR_BRAND_SECONDARY = 'var(--color-brand-secondary)',
  COLOR_GP_CREAM = 'var(--color-gp-cream)',
  COLOR_GRAYSCALE_WHITE = 'var(--color-grayscale-white)',
  COLOR_GRAYSCALE_950 = 'var(--color-grayscale-950)',
}

export const ICON_CONTAINER_COLORS: Record<IconContainerColor, DesignTokens> = {
  [IconContainerColor.RED]: DesignTokens.COLOR_RED_200,
  [IconContainerColor.BLUE]: DesignTokens.COLOR_BLUE_200,
  [IconContainerColor.BRIGHT_YELLOW]: DesignTokens.COLOR_BRIGHT_YELLOW_200,
  [IconContainerColor.ORANGE]: DesignTokens.COLOR_ORANGE_200,
  [IconContainerColor.LAVENDER]: DesignTokens.COLOR_LAVENDER_200,
  [IconContainerColor.WAX_FLOWER]: DesignTokens.COLOR_WAXFLOWER_200,
  [IconContainerColor.HALO_GREEN]: DesignTokens.COLOR_HALOGREEN_200,
  [IconContainerColor.RED_100]: DesignTokens.COLOR_RED_100,
  [IconContainerColor.BLUE_100]: DesignTokens.COLOR_BLUE_100,
  [IconContainerColor.BRIGHT_YELLOW_100]: DesignTokens.COLOR_BRIGHT_YELLOW_100,
  [IconContainerColor.ORANGE_100]: DesignTokens.COLOR_ORANGE_100,
  [IconContainerColor.LAVENDER_100]: DesignTokens.COLOR_LAVENDER_100,
  [IconContainerColor.WAX_FLOWER_100]: DesignTokens.COLOR_WAXFLOWER_100,
  [IconContainerColor.HALO_GREEN_100]: DesignTokens.COLOR_HALOGREEN_100,
}

export const BACKGROUND_COLOR_MAP: Record<BackgroundTheme, DesignTokens> = {
  [BackgroundTheme.DARK]: DesignTokens.COLOR_BRAND_SECONDARY,
  [BackgroundTheme.CREME]: DesignTokens.COLOR_GP_CREAM,
  [BackgroundTheme.WHITE]: DesignTokens.COLOR_GRAYSCALE_WHITE,
}

export const TEXT_COLOR_MAP: Record<BackgroundTheme, DesignTokens> = {
  [BackgroundTheme.DARK]: DesignTokens.COLOR_GRAYSCALE_WHITE,
  [BackgroundTheme.CREME]: DesignTokens.COLOR_GRAYSCALE_950,
  [BackgroundTheme.WHITE]: DesignTokens.COLOR_GRAYSCALE_950,
}

export const BUTTON_VARIANT_OPTIONS = [
  { title: 'Default', value: ButtonVariant.DEFAULT },
  { title: 'Secondary', value: ButtonVariant.SECONDARY },
  { title: 'Destructive', value: ButtonVariant.DESTRUCTIVE },
  { title: 'Outline', value: ButtonVariant.OUTLINE },
  { title: 'Ghost', value: ButtonVariant.GHOST },
  { title: 'White Ghost', value: ButtonVariant.WHITE_GHOST },
  { title: 'White Outline', value: ButtonVariant.WHITE_OUTLINE },
] as const

export const ICON_CONTAINER_COLOR_OPTIONS = [
  { title: 'Red', value: IconContainerColor.RED },
  { title: 'Blue', value: IconContainerColor.BLUE },
  { title: 'Bright Yellow', value: IconContainerColor.BRIGHT_YELLOW },
  { title: 'Orange', value: IconContainerColor.ORANGE },
  { title: 'Lavender', value: IconContainerColor.LAVENDER },
  { title: 'Wax Flower', value: IconContainerColor.WAX_FLOWER },
  { title: 'Halo Green', value: IconContainerColor.HALO_GREEN },
] as const

export const BACKGROUND_THEME_OPTIONS = [
  { title: 'Dark', value: BackgroundTheme.DARK },
  { title: 'Creme', value: BackgroundTheme.CREME },
  { title: 'White', value: BackgroundTheme.WHITE },
] as const

export const ICON_CONTAINER_COLOR_HEX: Record<IconContainerColor, string> = {
  [IconContainerColor.RED]: '#FCB5B5',
  [IconContainerColor.BLUE]: '#B3D9FF',
  [IconContainerColor.BRIGHT_YELLOW]: '#FFE385',
  [IconContainerColor.ORANGE]: '#FFD700',
  [IconContainerColor.LAVENDER]: '#E6CCFF',
  [IconContainerColor.WAX_FLOWER]: '#FFF1C9',
  [IconContainerColor.HALO_GREEN]: '#A8E6B8',
  [IconContainerColor.RED_100]: '#FDCDCD',
  [IconContainerColor.BLUE_100]: '#D1E7FE',
  [IconContainerColor.BRIGHT_YELLOW_100]: '#FFEEB7',
  [IconContainerColor.ORANGE_100]: '#FDE19A',
  [IconContainerColor.LAVENDER_100]: '#F1E5FF',
  [IconContainerColor.WAX_FLOWER_100]: '#FFF1C9',
  [IconContainerColor.HALO_GREEN_100]: '#CCEADD',
}

export const LIGHT_BACKGROUND_COLOR_OPTIONS = [
  { title: 'Red', value: IconContainerColor.RED_100 },
  { title: 'Blue', value: IconContainerColor.BLUE_100 },
  { title: 'Bright Yellow', value: IconContainerColor.BRIGHT_YELLOW_100 },
  { title: 'Orange', value: IconContainerColor.ORANGE_100 },
  { title: 'Lavender', value: IconContainerColor.LAVENDER_100 },
  { title: 'Wax Flower', value: IconContainerColor.WAX_FLOWER_100 },
  { title: 'Halo Green', value: IconContainerColor.HALO_GREEN_100 },
] as const

export enum CtaVariant {
  TEXT_IMAGE = 'textImage',
  CENTERED = 'centered',
}

export const CTA_VARIANT_OPTIONS = [
  { title: 'Text + Image', value: CtaVariant.TEXT_IMAGE },
  { title: 'Centered Content', value: CtaVariant.CENTERED },
] as const

export const LINK_TYPE_OPTIONS = [
  { title: 'URL', value: LinkType.HREF },
  { title: 'Page', value: LinkType.PAGE },
  { title: 'Post', value: LinkType.POST },
] as const
