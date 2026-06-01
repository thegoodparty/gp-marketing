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
		activeTriggerRef?: React.RefObject<HTMLButtonElement | null>;
	},
) {
	// Check if this specific dropdown is active using the index
	const isActive = props.navState.isOpen && props.navState.activeDropdownIndex === props.index;

	const { link } = menuItemStyles();

	const handleClick = () => {
		props.setNavState(prev => {
			if (prev.isOpen && prev.activeDropdownIndex === props.index) {
				return { isOpen: false, activeDropdownIndex: null };
			}
			return { isOpen: true, activeDropdownIndex: props.index };
		});
	};

	return (
		<li>
			<button
				type='button'
				className={cn(link(), 'cursor-pointer bg-transparent border-0 p-0')}
				onClick={handleClick}
				ref={(el) => {
					if (isActive && props.activeTriggerRef) props.activeTriggerRef.current = el;
				}}
			>
				<Text styleType='text-md' className='font-semibold'>
					{props.label}
				</Text>
				<IconResolver
					icon='chevron-down'
					className='ml-2 transition-transform duration-[0.25s] ease-smooth'
					style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' }}
				/>
			</button>

			<NavDropdownContent
				{...props}
				navState={props.navState}
				onClick={() => {
					props.setNavState({
						isOpen: false,
						activeDropdownIndex: null,
					});
				}}
			/>
		</li>
	);
}

function NavDropdownContent(
	props: NavDropdownProps & {
		onClick(): void;
		navState: NavDropdownState;
		index: number;
	},
) {
	const dropdownContentRef = useRef<HTMLDivElement>(null);

	const [positionWasSet, setPositionWasSet] = useState(false);

	const isActive = props.navState.isOpen && props.navState.activeDropdownIndex === props.index;

	useEffect(() => {
		if (isActive && dropdownContentRef.current && !positionWasSet) {
			dropdownContentRef.current.style.left = '0';
			dropdownContentRef.current.style.right = 'auto';

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
			requestAnimationFrame(() => {
				setPositionWasSet(true);
			});
		} else {
			if (!isActive && positionWasSet) setPositionWasSet(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- dropdownContentRef is stable; getLeftOffset is pure
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
								onClick={() => {
									props.onClick();
								}}
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
