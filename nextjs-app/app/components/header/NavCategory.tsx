'use client';

import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import NavLink from './NavLink';
import { NavigationCategory } from '@/app/types/navigation';

interface NavCategoryProps {
  category: NavigationCategory;
}

export default function NavCategory({ category }: NavCategoryProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:ml-2 xl:ml-4 relative cursor-pointer">
      <div onClick={() => setOpen(!open)}>
        <div className="flex items-center">
          <div className="font-medium text-base">{category.title}</div>
          <FaChevronDown className={`ml-2 mt-[2px] transition-all ${open && 'rotate-180'}`} />
        </div>
      </div>

      {open && (
        <>
          <div className="fixed h-screen w-screen top-14 left-0" onClick={() => setOpen(false)} />
          <div className="absolute z-50 top-11 left-0 min-w-[270px] bg-primary-dark text-white rounded-xl shadow-md p-3">
            {category.links.map((link, index) => (
              <NavLink key={index} link={link} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
