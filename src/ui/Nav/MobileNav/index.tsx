'use client';
import { AnimatePresence, cubicBezier, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { useState } from 'react';
import { cn } from '~/ui/_lib/utils.ts';
import { Anchor } from '~/ui/Anchor';
import { IconResolver } from '~/ui/IconResolver';
import { ComponentButton } from '~/ui/Inputs/Button';
import type { NavProps } from '~/ui/Nav';
import { NavGroupItem } from '~/ui/Nav/DesktopNav/NavLink';
import { Text } from '~/ui/Text';

export function MobileNav(props: NavProps) {
	const pathname = usePathname();

	const [navOpen, setNavOpen] = useState<boolean>(false);

	return (
		<div className='lg:hidden block relative z-30 max-h-screen pointer-events-auto'>
			<div className='relative flex flex-row justify-between items-center h-[5rem] px-[1rem]'>
				<Anchor
					aria-label='Go to home page'
					className='inline-flex flex-row items-center justify-center px-[0.3rem] py-[0.15rem] w-[3rem]'
					href={pathname === '/' ? '#top' : '/'}
					onClick={() => {
						setNavOpen(false);
					}}
				>
					<IconResolver
						icon='goodparty-logo'
						className='min-w-[2.4rem] min-h-[2.7rem] w-[2.4rem] h-[2.7rem] max-w-[2.4rem] max-h-[2.7rem]'
					/>
				</Anchor>
				<div className='flex flex-row gap-[1rem] items-center justify-center w-fit'>
					{props.secondaryCTA && (
						<ComponentButton
							{...props.secondaryCTA}
							buttonProps={{ styleType: 'outline-inverse', styleSize: 'md' }}
							className={cn(props.secondaryCTA?.className, 'max-[400px]:[&>*:last-child]:hidden')}
						/>
					)}
					{props.primaryCTA && (
						<ComponentButton
							{...props.primaryCTA}
							buttonProps={{ styleType: 'primary', styleSize: 'md' }}
							className={cn(props.primaryCTA?.className, 'max-[400px]:[&>*:last-child]:hidden')}
						/>
					)}

					<button
						type='button'
						className='w-[2.25rem] h-[2.25rem] flex items-center justify-center bg-white rounded-full text-black'
						onClick={e => {
							e.preventDefault();
							setNavOpen(prev => !prev);
						}}
					>
						{navOpen ? (
							<IconResolver icon='x' className='w-[1rem] h-[1rem] min-w-[1rem] min-h-[1rem] max-w-[1rem] max-h-[1rem]' />
						) : (
							<IconResolver icon='menu' className='w-[1rem] h-[1rem] min-w-[1rem] min-h-[1rem] max-w-[1rem] max-h-[1rem]' />
						)}
					</button>
				</div>
			</div>
			<AnimatePresence mode='wait'>
				{navOpen && (
					<motion.ul
						key='menu-list'
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.25, ease: 'easeInOut' }}
						className='flex flex-col overflow-y-auto w-full h-[calc(100dvh-5rem)] bg-white text-black px-[1.25rem]'
					>
						{props.nav?.map((link, i) => (
							<Fragment key={`nav-mobile-button-menu-list-${String(i)}`}>
								{'group' in link && link.group ? (
									<>
										<div className='py-[0.75rem] px-[0.625rem]'>
											<Text styleType='nav-dropdown-item'>{link.label}</Text>
										</div>
										{link.group.map((item, index) => (
											<NavGroupItem
												{...item}
												key={`nav-mobile-button-menu-list-${String(index)}`}
												onClick={() => {
													setNavOpen(false);
												}}
											/>
										))}
									</>
								) : (
									<NavGroupItem
										{...link}
										className={i == 0 ? 'mt-[1.25rem]' : ''}
										onClick={() => {
											setNavOpen(false);
										}}
									/>
								)}
								<hr className='text-[#D4D4D4] my-[1.25rem]' />
							</Fragment>
						))}
					</motion.ul>
				)}
			</AnimatePresence>
		</div>
	);
}
