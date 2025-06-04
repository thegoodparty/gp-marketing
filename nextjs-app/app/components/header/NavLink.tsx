import Link from 'next/link'
import { NavigationLink, NavigationSingleLink } from '@/app/types/navigation'
import DynamicIcon from '../../shared/icons/DynamicIcon'
import { BiLinkExternal } from 'react-icons/bi'

interface NavLinkProps {
  link: NavigationLink | NavigationSingleLink
}

export default function NavLink({ link }: NavLinkProps) {
  const isExternal = link.type === 'external'
  const href = link.type === 'internal' ? `/${link.page?.slug}` : link.url

  return (
    <Link
      href={href || '#'}
      className="no-underline font-medium py-3 whitespace-nowrap text-base px-4 hover:bg-primary-dark-dark rounded flex items-center justify-between"
      rel={isExternal ? 'noopener noreferrer nofollow' : ''}
      target={isExternal ? '_blank' : ''}
    >
      <div className="flex items-center">
        {link.icon && (
          <DynamicIcon iconName={link.icon} className="w-5 h-5 mr-2" />
        )}
        <div className="ml-3 outfit">{link.title}</div>
      </div>
      {isExternal && <BiLinkExternal />}
    </Link>
  )
}
