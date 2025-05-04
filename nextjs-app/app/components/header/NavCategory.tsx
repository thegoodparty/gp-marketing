'use client';

import { FaChevronDown } from 'react-icons/fa';
import NavLink from './NavLink';
import { NavigationCategory } from '@/app/types/navigation';

interface NavCategoryProps {
  category: NavigationCategory;
  isOpen: boolean;
  onToggle: () => void;
}

export default function NavCategory({ category, isOpen, onToggle }: NavCategoryProps) {
  return (
    <div className="lg:ml-2 xl:ml-4 mr-8 relative cursor-pointer">
      <div onClick={onToggle}>
        <div className="flex items-center">
          <div className="font-medium text-base outfit">{category.title}</div>
          <FaChevronDown className={`ml-2 mt-[2px] transition-all ${isOpen && 'rotate-180'}`} />
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed h-screen w-screen top-14 left-0" onClick={onToggle} />
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
