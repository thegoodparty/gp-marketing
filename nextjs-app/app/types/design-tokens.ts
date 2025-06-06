export enum IconContainerColor {
  RED = 'red-200',
  BLUE = 'blue-200',
  BRIGHT_YELLOW = 'brightYellow-200',
  ORANGE = 'orange-200',
  LAVENDER = 'lavender-200',
  WAX_FLOWER = 'waxFlower-200',
  HALO_GREEN = 'haloGreen-200',
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
  // Icon container colors
  COLOR_RED_200 = 'var(--color-red-200)',
  COLOR_BLUE_200 = 'var(--color-blue-200)',
  COLOR_BRIGHT_YELLOW_200 = 'var(--color-bright-yellow-200)',
  COLOR_ORANGE_200 = 'var(--color-orange-200)',
  COLOR_LAVENDER_200 = 'var(--color-lavender-200)',
  COLOR_WAXFLOWER_200 = 'var(--color-waxflower-200)',
  COLOR_HALOGREEN_200 = 'var(--color-halogreen-200)',

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
