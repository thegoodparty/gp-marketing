'use client'

import { useState } from 'react'
import NavCategory from './NavCategory'
import NavLink from './NavLink'
import { Settings, NavigationItem } from '@/app/types/navigation'

interface NavCategoriesProps {
  settings: Settings
}

export default function NavCategories({ settings }: NavCategoriesProps) {
  const [openCategoryKey, setOpenCategoryKey] = useState<string | null>(null)
  const items = settings?.navigation?.items
  if (!items) return null

  const handleCategoryToggle = (key: string) => {
    setOpenCategoryKey(openCategoryKey === key ? null : key)
  }

  return (
    <div className="items-center hidden lg:flex">
      {items.map((item: NavigationItem) => {
        if (item._type === 'category') {
          return (
            <NavCategory
              key={item._key}
              category={item}
              isOpen={openCategoryKey === item._key}
              onToggle={() => handleCategoryToggle(item._key)}
            />
          )
        } else if (item._type === 'link') {
          return <NavLink key={item._key} link={item} />
        }
        return null
      })}
    </div>
  )
}
