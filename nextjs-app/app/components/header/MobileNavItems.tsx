'use client';

import { NavigationItem } from '@/app/types/navigation';
import DynamicIcon from '@/app/shared/icons/DynamicIcon';
import Link from 'next/link';
import { BiLinkExternal } from 'react-icons/bi';
import Caption from '@/app/shared/typography/Caption';

interface MobileNavItemsProps {
  items: NavigationItem[];
  onClose: () => void;
}

export default function MobileNavItems({
  items,
  onClose,
}: MobileNavItemsProps) {
  return (
    <>
      {items.map((item: NavigationItem) => {
        if (item._type === 'category') {
          return (
            <div
              key={item._key}
              className="border-b border-indigo-400 pb-3 mb-3"
            >
              <Caption className="py-2">{item.title}</Caption>
              {item.links.map((link) => {
                const href =
                  link.type === 'internal' ? `/${link.page?.slug}` : link.url;
                const isExternal = link.type === 'external';
                return (
                  <Link
                    href={href || '#'}
                    key={link.title}
                    className="block no-underline font-medium py-3 whitespace-nowrap text-base px-2 hover:bg-primary-dark-dark rounded flex items-center justify-between"
                    rel={isExternal ? 'noopener noreferrer nofollow' : ''}
                    target={isExternal ? '_blank' : ''}
                    onClick={onClose}
                  >
                    <div className="flex items-center">
                      {link.icon && (
                        <DynamicIcon
                          iconName={link.icon}
                          className="w-5 h-5 mr-2"
                        />
                      )}
                      <div className="ml-3">{link.title}</div>
                    </div>
                    {isExternal && <BiLinkExternal size={14} />}
                  </Link>
                );
              })}
            </div>
          );
        } else if (item._type === 'link') {
          const href =
            item.type === 'internal' ? `/${item.page?.slug}` : item.url;
          const isExternal = item.type === 'external';
          return (
            <Link
              href={href || '#'}
              key={item._key}
              className="block no-underline font-medium py-3 whitespace-nowrap text-base px-2 hover:bg-primary-dark-dark rounded flex items-center justify-between"
              rel={isExternal ? 'noopener noreferrer nofollow' : ''}
              target={isExternal ? '_blank' : ''}
              onClick={onClose}
            >
              <div className="flex items-center">
                {item.icon && (
                  <DynamicIcon iconName={item.icon} className="w-5 h-5 mr-2" />
                )}
                <div className="ml-3">{item.title}</div>
              </div>
              {isExternal && <BiLinkExternal size={14} />}
            </Link>
          );
        }
        return null;
      })}
    </>
  );
}
