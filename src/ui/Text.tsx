import { forwardRef, type ComponentPropsWithRef, type ElementType, type PropsWithChildren, type ReactElement } from 'react';
import { tv } from './_lib/utils.ts';

export const styles = tv({
	slots: {
		base: '',
	},
	variants: {
		hasParagraphs: {
			true: {
				base: '[&>*+*]:mt-[0.75em] [&>:empty]:hidden break-words',
			},
		},
		type: {
			'heading-xl': {
				base: 'text-heading-xl',
			},
			'heading-lg': {
				base: 'text-heading-lg',
			},
			'heading-md': {
				base: 'text-heading-md',
			},
			'heading-sm': {
				base: 'text-heading-sm',
			},
			'heading-xs': {
				base: 'text-heading-xs',
			},
			'subtitle-1': {
				base: 'text-subtitle-1',
			},
			'subtitle-2': {
				base: 'font-secondary text-subtitle-2',
			},
			'body-1': {
				base: 'font-secondary text-body-1 ',
			},
			'body-xl': {
				base: 'font-secondary text-body-xl',
			},
			'body-2': {
				base: 'font-secondary text-body-2',
			},
			'body-large': {
				base: 'font-secondary text-body-large',
			},
			overline: {
				base: 'text-overline',
			},
			caption: {
				base: 'font-secondary text-caption',
			},
			'text-9xl': {
				base: 'text-text-9xl',
			},
			'text-8xl': {
				base: 'text-text-8xl',
			},
			'text-7xl': {
				base: 'text-text-7xl',
			},
			'text-6xl': {
				base: 'text-text-6xl',
			},
			'text-5xl': {
				base: 'text-text-5xl',
			},
			'text-4xl': {
				base: 'text-text-4xl',
			},
			'text-3xl': {
				base: 'text-text-3xl',
			},
			'text-2xl': {
				base: 'text-text-2xl',
			},
			'text-xl': {
				base: 'text-text-xl',
			},
			'text-lg': {
				base: 'text-text-lg',
			},
			'text-md': {
				base: 'text-text-md',
			},
			'text-sm': {
				base: 'text-text-sm',
			},
			'text-xs': {
				base: 'text-text-xs',
			},
			'text-875': {
				base: 'text-text-875',
			},
			'nav-dropdown-item': {
				base: 'font-secondary font-semibold text-[0.875rem]',
			},
			'nav-menu-item': {
				base: 'font-secondary font-medium text-[1rem]',
			},
		},
	},
});

export type StyleTypes = keyof (typeof styles)['variants']['type'];

type OwnProps = PropsWithChildren<{
	className?: string;
	hasParagraphs?: boolean;
	styleType: StyleTypes;
}>;

export type TextProps<E extends ElementType = 'div'> = {
	as?: E;
} & OwnProps &
	Omit<ComponentPropsWithRef<E>, keyof OwnProps | 'as' | 'className' | 'children'>;

type PolymorphicRef<E extends ElementType> = ComponentPropsWithRef<E>['ref'];

export const Text = forwardRef(function TextInner<E extends ElementType = 'div'>(
	{ as, styleType, className, hasParagraphs = false, children, ...props }: TextProps<E>,
	ref: PolymorphicRef<E>,
): ReactElement {
	const El = (as ?? 'div');
	const { base } = styles({ hasParagraphs, type: styleType });

	return (
		<El ref={ref} {...(props as ComponentPropsWithRef<E>)} className={base({ className })}>
			{children}
		</El>
	);
}) as <E extends ElementType = 'div'>(props: TextProps<E> & { ref?: PolymorphicRef<E> }) => ReactElement;
