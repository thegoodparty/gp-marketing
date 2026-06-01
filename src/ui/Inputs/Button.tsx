'use client';

import {
	type AnchorHTMLAttributes,
	type ButtonHTMLAttributes,
	forwardRef,
	type PropsWithChildren,
	type ReactElement,
	type ReactNode,
} from 'react';

import { APP_SIGN_UP_HREF, isSignUpUrl, trackSignUpClicked } from '~/lib/analytics';
import { LinkTarget } from '~/types/ui';
import { tv } from '../_lib/utils.ts';
import { Anchor, type AnchorProps } from '../Anchor.tsx';
import { IconResolver } from '../IconResolver.tsx';
import type { buttonStyleTypeValues } from '../_lib/designTypesStore.ts';
import { isExternalToEcosystem } from '../_lib/linkBehavior';

function hasReadableText(children: ReactNode): boolean {
	if (children == null) return false;
	if (typeof children === 'string') return children.trim().length > 0;
	if (typeof children === 'number') return true;
	return false;
}

export const btnStyles = tv({
	slots: {
		base: [
			'group/button text-black rounded-full cursor-pointer',
			'inline-flex items-center justify-center',
			'text-[0.875rem] font-semibold',
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
				base: 'text-white! bg-btn-primary-bg hover:bg-btn-primary-bg/80 focus:ring-btn-primary-bg/40',
			},
			secondary: {
				base: 'text-white! bg-midnight-900 hover:bg-btn-secondary-hover-bg focus:ring-midnight-300/50',
			},
			outline: {
				base: 'border border-black hover:bg-black/5 focus:ring-btn-outline-ring/50',
			},
			'outline-inverse': {
				base: 'text-white! border border-white hover:bg-white/10 focus:ring-white/50',
			},
			ghost: {
				base: 'hover:bg-btn-ghost-hover-bg focus:ring-btn-outline-ring/50',
			},
			'ghost-inverse': {
				base: 'text-white! hover:bg-white/10 focus:ring-white/50',
			},
			'min-ghost': {
				base: 'hover:opacity-80 focus:ring-btn-outline-ring/50 p-0! w-fit h-fit! ',
			},
			'min-ghost-inverse': {
				base: 'text-white! hover:opacity-80 focus:ring-white/50 p-0! w-fit h-fit! ',
			},
			'primary-red': {
				base: 'text-white! bg-goodparty-red hover:bg-goodparty-red/80 focus:ring-goodparty-red/40 shadow-[var(--shadow-cta-red)]',
			},
		},
		size: {
			lg: {},
			md: {},
			sm: {},
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
	formId?: string;
	iconOnly?: boolean;
	iconLeft?: ReactElement;
	iconRight?: ReactElement;
	disabled?: boolean;
	isLoading?: boolean;
	styleType?: (typeof buttonStyleTypeValues)[number];
	styleSize?: 'lg' | 'md' | 'sm';
	parent: string;
	onClick?(e: React.MouseEvent<HTMLElement, MouseEvent>): void;
};

export type ButtonTypeProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps;

export type MainButtonProps = {
	styleType?: ButtonProps['styleType'];
	styleSize?: ButtonProps['styleSize'];
};

export type ComponentButtonProps = {
	_key?: string;
	className?: string;
	formId?: string;
	buttonProps?: MainButtonProps;
	label?: ReactNode;
	iconLeft?: ReactElement;
	iconRight?: ReactElement;
	onClick?(e: React.MouseEvent<HTMLElement, MouseEvent>): void;
} & (
	| { buttonType: 'internal'; href: string }
	| { buttonType: 'external'; href: string }
	| { buttonType: 'anchor'; href: string }
	| { buttonType: 'download'; href: string }
	| { buttonType: 'contact'; href: string }
	| { buttonType: 'login' }
	| { buttonType: 'signup' }
	| { buttonType: 'button' }
);

function labelToString(label: ReactNode | undefined): string | null {
	return typeof label === 'string' ? label : null;
}

const EXTERNAL_LINK_ICON_CLASS = 'min-w-3.5 min-h-3.5 w-3.5 h-3.5 max-w-3.5 max-h-3.5';

function defaultExternalLinkIcon() {
	return <IconResolver icon='square-arrow-out-up-right' className={EXTERNAL_LINK_ICON_CLASS} />;
}

export const ComponentButton = (props: ComponentButtonProps) => {
	const isExternalHref = 'href' in props ? isExternalToEcosystem(props.href) : false;

	const linkOnClick =
		'href' in props
			? (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
					if (isSignUpUrl(props.href)) {
						trackSignUpClicked({ href: props.href, label: labelToString(props.label), formId: props.formId ?? null });
					}
					props.onClick?.(e);
				}
			: undefined;

	switch (props.buttonType) {
		case 'internal':
			return (
				<ButtonLink
					parent='ComponentButton'
					className={props.className}
					formId={props.formId}
					href={props.href}
					onClick={linkOnClick}
					iconLeft={props.iconLeft}
					iconRight={props.iconRight ?? undefined}
					{...props.buttonProps}
				>
					{props.label}
				</ButtonLink>
			);
		case 'anchor':
			return (
				<ButtonLink
					parent='ComponentButton'
					className={props.className}
					formId={props.formId}
					href={props.href}
					onClick={linkOnClick}
					iconLeft={props.iconLeft}
					iconRight={props.iconRight ?? (isExternalHref ? defaultExternalLinkIcon() : undefined)}
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
					formId={props.formId}
					href={props.href}
					onClick={linkOnClick}
					iconLeft={props.iconLeft}
					iconRight={props.iconRight ?? (isExternalHref ? defaultExternalLinkIcon() : undefined)}
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
					formId={props.formId}
					href={props.href}
					onClick={linkOnClick}
					target={LinkTarget.BLANK}
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
					formId={props.formId}
					href={props.href}
					onClick={linkOnClick}
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
					formId={props.formId}
					onClick={e => props.onClick?.(e)}
					iconLeft={props.iconLeft}
					iconRight={
						props.iconRight ?? <IconResolver icon='arrow-up-right' className='min-w-4.5 min-h-4.5 w-4.5 h-4.5 max-w-4.5 max-h-4.5' />
					}
					aria-label={props.label ? undefined : 'Login'}
					{...props.buttonProps}
				>
					{props.label ?? 'Login'}
				</Button>
			);
		case 'signup':
			return (
				<Button
					parent='ComponentButton'
					className={props.className}
					formId={props.formId}
					onClick={e => {
						trackSignUpClicked({ href: APP_SIGN_UP_HREF, label: labelToString(props.label), formId: props.formId ?? null });
						props.onClick?.(e);
					}}
					iconLeft={props.iconLeft}
					iconRight={
						props.iconRight ?? <IconResolver icon='arrow-up-right' className='min-w-4.5 min-h-4.5 w-4.5 h-4.5 max-w-4.5 max-h-4.5' />
					}
					aria-label={props.label ? undefined : 'Sign up'}
					{...props.buttonProps}
				>
					{props.label ?? 'Sign up'}
				</Button>
			);
		case 'button':
			return (
				<Button
					parent='ComponentButton'
					className={props.className}
					formId={props.formId}
					onClick={e => props.onClick?.(e)}
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
	const { iconOnly, iconLeft, iconRight, isLoading, styleType, styleSize, formId, ...attr } = props;
	const isIconOnly = !!iconOnly;
	const hasAccessibleName = props['aria-label'] || hasReadableText(props.children);

	const type = styleType ?? 'primary';
	const size = styleSize ?? 'lg';
	const { base, loader } = btnStyles({ type, iconOnly: isIconOnly, size, loading: isLoading });

	return (
		<button
			{...attr}
			data-form-id={formId || undefined}
			disabled={props.disabled}
			ref={ref}
			className={base({ className: props.className })}
			aria-label={attr['aria-label'] ?? (isIconOnly && !hasAccessibleName ? 'Button' : undefined)}
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
	const { iconOnly, parent, iconLeft, iconRight, isLoading, styleType, styleSize, formId, ...attr } = props;
	const isIconOnly = !!iconOnly;
	const hasAccessibleName = attr['aria-label'] || hasReadableText(props.children);
	const type = styleType ?? 'primary';
	const size = styleSize ?? 'lg';
	const { base, loader } = btnStyles({ type, iconOnly: isIconOnly, size });
	return (
		<Anchor
			{...attr}
			data-form-id={formId || undefined}
			className={base({ className: props.className })}
			ref={ref}
			aria-label={attr['aria-label'] ?? (isIconOnly && !hasAccessibleName ? 'Link' : undefined)}
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
