export type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'whiteGhost'
  | 'whiteOutline'

/**
 * Default button variant constant
 */
export const DEFAULT_BUTTON_VARIANT: ButtonVariant = 'default'

/**
 * Button variant options for use in forms, schemas, etc.
 */
export const BUTTON_VARIANT_OPTIONS = [
  { title: 'Default', value: 'default' as ButtonVariant },
  { title: 'Secondary', value: 'secondary' as ButtonVariant },
  { title: 'Destructive', value: 'destructive' as ButtonVariant },
  { title: 'Outline', value: 'outline' as ButtonVariant },
  { title: 'Ghost', value: 'ghost' as ButtonVariant },
  { title: 'White Ghost', value: 'whiteGhost' as ButtonVariant },
  { title: 'White Outline', value: 'whiteOutline' as ButtonVariant },
] as const
