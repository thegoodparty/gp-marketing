'use client';

import {
	type AnchorHTMLAttributes,
	type ButtonHTMLAttributes,
	forwardRef,
	type PropsWithChildren,
	type ReactElement,
	type ReactNode,
} from 'react';

import { cn, tv } from '../_lib/utils.ts';
import { Anchor, type AnchorProps } from '../Anchor.tsx';
import { IconResolver } from '../IconResolver.tsx';
import type { buttonStyleTypeValues } from '../_lib/designTypesStore.ts';

export const btnStyles = tv({
	slots: {
		base: [
			'group/button text-black rounded-full cursor-pointer',
			'inline-flex items-center justify-center',
			'focus:ring-4',
			'disabled:opacity-50 disabled:cursor-not-allowed',
			'transition-all duration-normal ease-smooth',
			'[&_*]:font-secondary',
		],
		loader: 'w-4 h-4 border-2 border-t-transparent rounded-full animate-spin',
	},
	variants: {
		loading: {
			true: 'opacity-50',
		},
		type: {
			primary: {
				base: 'text-white! bg-[#2563EB] hover:bg-[#2563EB]/80 focus:ring-[#2563EB]/40',
			},
			secondary: {
				base: 'text-white! bg-midnight-900 hover:bg-[#3C4454] focus:ring-midnight-300/50',
			},
			outline: {
				base: 'border border-black hover:bg-[#F5F5F5] focus:ring-[#A3A3A3]/50',
			},
			'outline-inverse': {
				base: 'text-white! border border-white hover:bg-white/10 focus:ring-white/50',
			},
			ghost: {
				base: 'hover:bg-[#F5F5F5] focus:ring-[#A3A3A3]/50',
			},
			'ghost-inverse': {
				base: 'text-white! hover:bg-white/10 focus:ring-white/50',
			},
			'min-ghost': {
				base: 'hover:opacity-80 focus:ring-[#A3A3A3]/50 p-0! w-fit h-fit! ',
			},
			'min-ghost-inverse': {
				base: 'text-white! hover:opacity-80 focus:ring-white/50 p-0! w-fit h-fit! ',
			},
		},
		size: {
			lg: {
				base: 'text-[0.875rem] font-semibold',
			},
			md: {
				base: 'text-[0.875rem] font-semibold',
			},
			sm: {
				base: 'text-[0.875rem] font-semibold',
			},
		},
		iconOnly: {
			true: {
				base: 'overflow-hidden w-9 h-9',
			},
			false: {
				base: 'gap-2',
			},
		},
	},
	compoundVariants: [
		{
			size: 'lg',
			iconOnly: false,
			className: 'px-8 py-3.5 h-12',
		},
		{
			size: 'md',
			iconOnly: false,
			className: 'px-6 py-2.5 h-10',
		},
		{
			size: 'sm',
			iconOnly: false,
			className: 'px-4 py-2 h-8',
		},
	],
});

export type ButtonProps = {
	animation?: 'down';
	className?: string;
	iconOnly?: boolean;
	iconLeft?: ReactElement;
	iconRight?: ReactElement;
	disabled?: boolean;
	isLoading?: boolean;
	styleType?: (typeof buttonStyleTypeValues)[number];
	styleSize?: 'lg' | 'md' | 'sm';
	parent: string;
	onClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
};

export type ButtonTypeProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps;

export type MainButtonProps = {
	styleType?: ButtonProps['styleType'];
	styleSize?: ButtonProps['styleSize'];
};

export type ComponentButtonProps = {
	_key?: string;
	className?: string;
	buttonProps?: MainButtonProps;
	label?: ReactNode;
	iconLeft?: ReactElement;
	iconRight?: ReactElement;
} & (
	| { buttonType: 'internal'; href: string }
	| { buttonType: 'external'; href: string }
	| { buttonType: 'anchor'; href: string }
	| { buttonType: 'download'; href: string }
	| { buttonType: 'contact'; href: string }
	| { buttonType: 'login' }
	| { buttonType: 'signup' }
	| { buttonType: 'button'; onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void }
);

export const ComponentButton = (props: ComponentButtonProps) => {
	switch (props.buttonType) {
		case 'internal':
		case 'anchor':
			return (
				<ButtonLink
					parent='ComponentButton'
					className={props.className}
					href={props.href}
					iconLeft={props.iconLeft}
					iconRight={
						props.iconRight ?? <IconResolver icon='arrow-up-right' className='min-w-4.5 min-h-4.5 w-4.5 h-4.5 max-w-4.5 max-h-4.5' />
					}
					{...props.buttonProps}
				>
					{props.label}
				</ButtonLink>
			);
		case 'external':
			return (
				<ButtonLink
					parent='ComponentButton'
					className={props.className}
					href={props.href}
					iconLeft={props.iconLeft}
					iconRight={
						props.iconRight ?? (
							<IconResolver icon='square-arrow-out-up-right' className='min-w-3.5 min-h-3.5 w-3.5 h-3.5 max-w-3.5 max-h-3.5' />
						)
					}
					{...props.buttonProps}
				>
					{props.label}
				</ButtonLink>
			);
		case 'download':
			return (
				<ButtonLink
					parent='ComponentButton'
					className={props.className}
					href={props.href}
					target='_blank'
					iconLeft={props.iconLeft}
					iconRight={props.iconRight ?? <IconResolver icon='download' className='min-w-3.5 min-h-3.5 w-3.5 h-3.5 max-w-3.5 max-h-3.5' />}
					{...props.buttonProps}
				>
					{props.label}
				</ButtonLink>
			);
		case 'contact':
			return (
				<ButtonLink
					parent='ComponentButton'
					className={props.className}
					href={props.href}
					iconLeft={props.iconLeft ?? <IconResolver icon='user-round' className='min-w-3.5 min-h-3.5 w-3.5 h-3.5 max-w-3.5 max-h-3.5' />}
					iconRight={props.iconRight}
					{...props.buttonProps}
				>
					{props.label}
				</ButtonLink>
			);
		case 'login':
			return (
				<Button
					parent='ComponentButton'
					className={props.className}
					iconLeft={props.iconLeft}
					iconRight={props.iconRight}
					{...props.buttonProps}
				>
					{props.label}
				</Button>
			);
		case 'signup':
			return (
				<Button
					parent='ComponentButton'
					className={props.className}
					iconLeft={props.iconLeft}
					iconRight={props.iconRight}
					{...props.buttonProps}
				>
					{props.label}
				</Button>
			);
		case 'button':
			return (
				<Button
					parent='ComponentButton'
					className={props.className}
					onClick={props.onClick}
					iconLeft={props.iconLeft}
					iconRight={props.iconRight}
					{...props.buttonProps}
				>
					{props.label}
				</Button>
			);

		default:
			return null;
	}
};

export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonTypeProps>>(function Button(props, ref) {
	const { iconOnly, iconLeft, iconRight, isLoading, styleType, styleSize, ...attr } = props;
	const isIconOnly = !!iconOnly;

	const type = styleType ?? 'primary';
	const size = styleSize ?? 'lg';
	const { base, loader } = btnStyles({ type, iconOnly: isIconOnly, size, loading: isLoading });

	return (
		<button
			{...attr}
			disabled={props.disabled}
			ref={ref}
			className={base({ className: props.className })}
			onClick={e => {
				props.onClick && props.onClick(e);
			}}
		>
			{iconLeft}
			{isLoading ? (
				<>
					<div className={loader()} />
					Loading
				</>
			) : (
				<>
					<div>{props.children}</div>
				</>
			)}
			{iconRight}
		</button>
	);
});

export type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
	href: AnchorProps['href'];
	parent: string;
} & ButtonProps;

export const ButtonLink = forwardRef<HTMLAnchorElement, PropsWithChildren<ButtonLinkProps>>(function ButtonLink(props, ref) {
	const { iconOnly, parent, iconLeft, iconRight, isLoading, styleType, styleSize, ...attr } = props;
	const isIconOnly = !!iconOnly;
	const type = styleType ?? 'primary';
	const size = styleSize ?? 'lg';
	const { base, loader } = btnStyles({ type, iconOnly: isIconOnly, size });
	return (
		<Anchor
			{...attr}
			className={base({ className: props.className })}
			ref={ref}
			onClick={e => {
				props.onClick && props.onClick(e);
			}}
			/* eslint-disable-next-line react/no-children-prop */
			children={
				<>
					{iconLeft}
					{isLoading ? (
						<>
							<div className={loader()} />
							Loading
						</>
					) : (
						<div>{props.children}</div>
					)}
					{iconRight}
				</>
			}
		/>
	);
});
