import {
  IconContainerColor,
  ICON_CONTAINER_COLORS,
} from '../types/design-tokens'

/**
 * Maps Sanity color string values to design token colors
 * This is the single source of truth for color mapping in components
 */
export const mapSanityColorToDesignToken = (sanityColor: string): string => {
  const colorMap: Record<string, IconContainerColor> = {
    'red-200': IconContainerColor.RED,
    'blue-200': IconContainerColor.BLUE,
    'brightYellow-200': IconContainerColor.BRIGHT_YELLOW,
    'orange-200': IconContainerColor.ORANGE,
    'lavender-200': IconContainerColor.LAVENDER,
    'waxFlower-200': IconContainerColor.WAX_FLOWER,
    'haloGreen-200': IconContainerColor.HALO_GREEN,
  }

  const colorKey = colorMap[sanityColor] || IconContainerColor.BLUE
  return ICON_CONTAINER_COLORS[colorKey]
}
