import * as LucideIcons from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

export const getIconFromModule = <T extends Record<string, unknown>>(
  iconModule: T,
  iconName: string,
): LucideIcon | undefined => {
  return iconModule[iconName] as LucideIcon | undefined
}

export const getLucideIcon = (iconName: string): LucideIcon => {
  const IconComponent = getIconFromModule(LucideIcons, iconName)
  return IconComponent || LucideIcons.HelpCircle
}
