import type { ComponentPropsWithRef, ElementType, ReactNode, Ref } from 'react';
import { tv } from 'tailwind-variants';

const styles = tv({
	slots: {
		base: 'mx-auto px-(--container-padding) w-full max-w-screen',
	},
	variants: {
		size: {
			xl: {
				base: 'max-w-max-xl!',
			},
			lg: {
				base: 'max-w-max-lg!',
			},
			md: {
				base: 'max-w-max-md!',
			},
			sm: {
				base: 'max-w-max-sm!',
			},
			xs: {
				base: 'max-w-max-xs!',
			},
			'2xs': {
				base: 'max-w-max-2xs!',
			},
			'editorial-widest': {
				base: 'max-w-max-editorial-widest!',
			},
			'editorial-wide': {
				base: 'max-w-max-editorial-wide!',
			},
			'editorial-narrow': {
				base: 'max-w-max-editorial-narrow!',
			},
			unset: {
				base: '[--container-padding:0]!',
			},
		},
	},
});

type AsProp<E extends ElementType> = { as?: E };

type ContainerOwnProps = {
	className?: string;
	size?: keyof typeof styles.variants.size;
	children?: ReactNode;
};

type PropsToOmit<E extends ElementType> = keyof AsProp<E> | keyof ContainerOwnProps;

export type ContainerProps<E extends ElementType = 'div'> = AsProp<E> & Omit<ComponentPropsWithRef<E>, PropsToOmit<E>> & ContainerOwnProps;

export function Container<E extends ElementType = 'div'>({ as, size = 'xl', className, children, ref, ...rest }: ContainerProps<E>) {
	const El = (as ?? 'div');
	const { base } = styles({ size });
	return (
		<El ref={ref as Ref<any>} {...rest} className={`${base()} ${className ?? ''}`}>
			{children}
		</El>
	);
}
