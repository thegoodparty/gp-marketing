'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Anchor } from '~/ui/Anchor';
import { IconResolver } from '~/ui/IconResolver';
import { ComponentButton } from '~/ui/Inputs/Button';
import type { NavProps } from '~/ui/Nav';
import { NavDropdown } from '~/ui/Nav/DesktopNav/NavDropdown';
import { NavLink } from '~/ui/Nav/DesktopNav/NavLink';

export type Position = {
	left?: number | undefined;
	right?: number | undefined;
};

export type NavDropdownState = {
	isOpen: boolean;
	activeDropdownIndex: number | null;
};

export function DesktopNav(props: NavProps) {
	const pathname = usePathname();
	const [navState, setNavState] = useState<NavDropdownState>({ isOpen: false, activeDropdownIndex: null });

	return (
		<div className={'hidden md:flex flex-row items-center w-full pointer-events-auto h-[5rem]'}>
			<div className='flex flex-row items-center justify-between px-[1.5rem] w-full'>
				<div className='flex flex-row items-center justify-center gap-[1rem]'>
					<Anchor
						aria-label='Go to home page'
						className='inline-flex flex-row items-center justify-center px-[0.3rem] py-[0.15rem] w-[3rem]'
						href={pathname === '/' ? '#top' : '/'}
						onClick={() => {
							setNavState({
								isOpen: false,
								activeDropdownIndex: null,
							});
						}}
					>
						<IconResolver
							icon='goodparty-logo'
							className='min-w-[2.4rem] min-h-[2.7rem] w-[2.4rem] h-[2.7rem] max-w-[2.4rem] max-h-[2.7rem]'
						/>
					</Anchor>

					<ul className={'flex flex-row gap-[1.5rem]'}>
						{props.nav?.map((item, i) =>
							'group' in item && item.group ? (
								<NavDropdown key={`nav-desktop-button-${String(i)}.${item.label?.toString().slice(0, 10)}`} {...item} index={i} navState={navState} setNavState={setNavState} />
							) : (
								<li key={`nav-desktop-button-${String(i)}.${item.label?.toString().slice(0, 10)}`}>
									<NavLink
										{...item}
										onClick={() => {
											setNavState({
												isOpen: false,
												activeDropdownIndex: null,
											});
										}}
									/>
								</li>
							),
						)}
					</ul>
					{navState.isOpen && (
						<div
							className='fixed inset-0 z-30'
							onClick={() => setNavState({ isOpen: false, activeDropdownIndex: null })}
						/>
					)}
				</div>
				<div className='flex flex-row gap-[1rem] items-center justify-center w-fit '>
					{props.secondaryCTA && <ComponentButton {...props.secondaryCTA} buttonProps={{ styleType: 'outline-inverse' }} />}
					{props.primaryCTA && <ComponentButton {...props.primaryCTA} buttonProps={{ styleType: 'primary' }} />}
				</div>
			</div>
		</div>
	);
}
