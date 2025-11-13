'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from '~/ui/_lib/utils';
import { type LinkShape } from '~/ui/Anchor';
import { IconResolver } from '~/ui/IconResolver';
import type { NavDropdownState } from '~/ui/Nav/DesktopNav';
import { menuItemStyles, NavGroupItem } from '~/ui/Nav/DesktopNav/NavLink';
import { Text } from '~/ui/Text';

type NavGroup = LinkShape[];

export type NavDropdownProps = {
	label: string;
	group?: NavGroup;
};

export function NavDropdown(
	props: NavDropdownProps & {
		index: number;
		navState: NavDropdownState;
		setNavState: React.Dispatch<React.SetStateAction<NavDropdownState>>;
	},
) {
	// Check if this specific dropdown is active using the index
	const isActive = props.navState.isOpen && props.navState.activeDropdownIndex === props.index;

	const { link } = menuItemStyles();

	// Handle mouse events
	const handleMouseEnter = () => {
		props.setNavState(prev => ({
			isOpen: !prev.isOpen,
			activeDropdownIndex: !prev.isOpen == false ? null : props.index,
		}));
	};

	return (
		<>
			<li key={`nav-link-${props.label}`} onClick={handleMouseEnter}>
				<div className={cn(link(), 'cursor-pointer')}>
					<Text styleType='text-md' className='font-semibold'>
						{props.label}
					</Text>
					<IconResolver
						icon='chevron-down'
						className='ml-2 transition-transform duration-[0.25s] ease-smooth'
						style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' }}
					/>
				</div>

				<NavDropdownContent
					{...props}
					handleMouseEnter={handleMouseEnter}
					navState={props.navState}
					onClick={() => {
						props.setNavState({
							isOpen: false,
							activeDropdownIndex: null,
						});
					}}
				/>
			</li>
			{isActive && (
				<div
					className='absolute top-0 left-0 w-full h-full -z-1'
					onClick={() => props.setNavState({ isOpen: false, activeDropdownIndex: null })}
				/>
			)}
		</>
	);
}

function NavDropdownContent(
	props: NavDropdownProps & {
		handleMouseEnter: () => void;
		onClick: () => void;
		navState: NavDropdownState;
		index: number;
	},
) {
	const dropdownContentRef = useRef<HTMLDivElement>(null);

	const [positionWasSet, setPositionWasSet] = useState(false);

	const isActive = props.navState.isOpen && props.navState.activeDropdownIndex === props.index;

	const state = useRef<{
		position: 'done' | 'pending';
	}>({
		position: 'done',
	}).current;

	useEffect(() => {
		if (isActive && dropdownContentRef.current && !positionWasSet) {
			state.position = 'pending';
			dropdownContentRef.current.style.left = '0';
			dropdownContentRef.current.style.right = 'auto';

			if (dropdownContentRef.current) {
				const leftOffset = getLeftOffset(dropdownContentRef.current);
				const viewportWidth = window.innerWidth;
				const width = dropdownContentRef.current.children?.[0]?.clientWidth ?? 0;

				const rightOffset = viewportWidth - leftOffset - width;

				if (rightOffset < 0) {
					dropdownContentRef.current.style.left = `calc(${rightOffset}px - 40px)`;
					dropdownContentRef.current.style.right = 'auto';
				} else {
					if (leftOffset < 0) {
						dropdownContentRef.current.style.left = 'auto';
						dropdownContentRef.current.style.right = `calc(${leftOffset}px - 40px)`;
					} else {
						dropdownContentRef.current.style.left = '0';
						dropdownContentRef.current.style.right = 'auto';
					}
				}
				setTimeout(() => {
					setPositionWasSet(true);
					state.position = 'done';
				}, 50);
			}
		} else {
			if (!isActive && positionWasSet) setPositionWasSet(false);
		}
	}, [isActive, positionWasSet]);

	return (
		<div
			ref={dropdownContentRef}
			className='relative max-w-[calc(100vw-10rem)]'
			style={{
				opacity: isActive ? 1 : 0,
				pointerEvents: isActive ? 'auto' : 'none',
				transform: isActive ? 'translateY(0)' : 'translateY(-10px)',
				transition: 'opacity 0.1s ease-in-out, transform 0.15s ease-in-out',
			}}
		>
			{props.group && (
				<div className='absolute top-0 left-0 flex flex-col pt-2 min-w-[14rem] z-40'>
					<div className='p-[0.5rem] rounded-[0.5rem] bg-white shadow-xl-duo'>
						{props.group.map((item, index) => (
							<NavGroupItem
								key={`dropdown-item-${item.label?.toString().slice(0, 1)}-${String(index)}`}
								{...item}
								onClick={props.onClick}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * Calculates the left offset of the given HTML element
 * @param element The HTML element to calculate the left offset for
 * @returns The left offset of the element
 */
export function getLeftOffset(element: HTMLElement | null) {
	if (!element) {
		return 0;
	}

	let coords = 0;
	while (element) {
		coords += element.offsetLeft;
		element = element.offsetParent as HTMLElement;
	}
	return coords;
}
