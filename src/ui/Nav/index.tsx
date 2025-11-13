import type { ComponentButtonProps } from '~/ui/Inputs/Button';
import { DesktopNav } from '~/ui/Nav/DesktopNav';
import type { NavDropdownProps } from '~/ui/Nav/DesktopNav/NavDropdown';
import type { NavLinkProps } from '~/ui/Nav/DesktopNav/NavLink';
import { MobileNav } from '~/ui/Nav/MobileNav';

export type NavProps = {
	nav?: (NavDropdownProps | NavLinkProps)[];
	primaryCTA?: ComponentButtonProps;
	secondaryCTA?: ComponentButtonProps;
};

export function Nav(props: NavProps) {
	return (
		<div className='h-[5rem] bg-midnight-900 text-white [&_*]:font-secondary!'>
			<DesktopNav {...props} />
			<MobileNav {...props} />
		</div>
	);
}
