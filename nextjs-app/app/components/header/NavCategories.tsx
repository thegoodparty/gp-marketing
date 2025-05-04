'use client';

import NavCategory from './NavCategory';
import NavLink from './NavLink';
import { Settings, NavigationItem } from '@/app/types/navigation';

interface NavCategoriesProps {
  settings: Settings;
}

export default function NavCategories({ settings }: NavCategoriesProps) {
  const items = settings?.navigation?.items;
  if (!items) return null;

  return (
    <div className="items-center hidden lg:flex">
      {items.map((item: NavigationItem) => {
        if (item._type === 'category') {
          return <NavCategory key={item._key} category={item} />;
        } else if (item._type === 'link') {
          return <NavLink key={item._key} link={item} />;
        }
        return null;
      })}
    </div>
  );
}
