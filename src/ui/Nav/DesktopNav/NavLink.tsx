'use client';

import { tv } from 'tailwind-variants';
import { isSignUpUrl, trackSignUpClicked } from '~/lib/analytics';
import { cn } from '~/ui/_lib/utils';
import type { LinkShape } from '~/ui/Anchor';
import { Anchor } from '~/ui/Anchor';
import { IconResolver, type IconType } from '~/ui/IconResolver';
import type { NavDropdownProps } from '~/ui/Nav/DesktopNav/NavDropdown';
import { Text, type StyleTypes } from '~/ui/Text';

export const menuItemStyles = tv({
	slots: {
		link: 'relative w-fit flex items-center pointer-events-auto z-10 **:font-medium',
	},
});

export type NavLinkProps = LinkShape & {
	textStyleType?: StyleTypes;
	iconLeft?: IconType;
	iconRight?: IconType;
	className?: string;
	onClick?(): void;
};

export function NavLink(item: NavLinkProps) {
	const { link } = menuItemStyles();

	return (
		<>
			{item.link?.href ? (
				<Anchor
					className={cn(link(), item.className)}
					href={item.link?.href}
					onClick={() => {
						const href = item.link?.href;
						if (href && isSignUpUrl(href)) {
							trackSignUpClicked({
								href,
								...(item.label ? { label: item.label } : {}),
							});
						}
						// eslint-disable-next-line @typescript-eslint/unbound-method -- optional handler, not a method on `item`
						item.onClick?.();
					}}
				>
					<Text styleType={item.textStyleType ?? 'nav-menu-item'}>{item.label}</Text>
				</Anchor>
			) : (
				<Text styleType={item.textStyleType ?? 'nav-menu-item'} className={cn(link(), item.className)}>
					{item.label}
				</Text>
			)}
		</>
	);
}

export function NavGroupItem(props: NonNullable<NavDropdownProps['group']>[number] & { className?: string; onClick?(): void }) {
	return (
		<Text
			as='div'
			styleType='nav-dropdown-item'
			className={cn(
				'relative group w-full flex flex-row items-center gap-[0.5rem] py-[0.75rem] px-[0.625rem] text-black hover:bg-midnight-100 transition-colors duration-normal ease-smooth rounded-[0.375rem] font-semibold whitespace-nowrap',
				props.className,
			)}
			onClick={() => {
				// eslint-disable-next-line @typescript-eslint/unbound-method -- invoke optional handler without `this`
				props.onClick?.();
			}}
		>
			{props.icon && (
				<IconResolver
					icon={props.icon}
					className='min-w-[1.38rem] min-h-[1.38rem] w-[1.38rem] h-[1.38rem] max-w-[1.38rem] max-h-[1.38rem] md:min-w-[1.5rem] md:min-h-[1.5rem] md:w-[1.5rem] md:h-[1.5rem] md:max-w-[1.5rem] md:max-h-[1.5rem]'
				/>
			)}
			<>
				{props.link?.href ? (
					<Anchor
						className="before:content-[''] before:absolute before:inset-0"
						key={props.label?.toString()}
						href={props.link.href}
						onClick={() => {
							if (isSignUpUrl(props.link?.href)) {
								trackSignUpClicked({
									href: props.link.href,
									...(typeof props.label === 'string' ? { label: props.label } : {}),
								});
							}
						}}
					>
						{props.label}
					</Anchor>
				) : (
					<span>{props.label}</span>
				)}
			</>

			{props.link?._type === 'externalLinkWithIcon' && (
				<IconResolver
					icon='square-arrow-out-up-right'
					className='min-w-[1.125rem] min-h-[1.125rem] w-[1.125rem] h-[1.125rem] max-w-[1.125rem] max-h-[1.125rem] md:min-w-[1.25rem] md:min-h-[1.25rem] md:w-[1.25rem] md:h-[1.25rem] md:max-w-[1.25rem] md:max-h-[1.25rem] ml-auto'
				/>
			)}
		</Text>
	);
}
