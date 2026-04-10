import { type ComponentProps, type PropsWithChildren } from 'react';
import { cn, tv } from './_lib/utils.ts';
import { styles as textStyles, type StyleTypes } from './Text.tsx';

const proseShared =
	"[&_:empty:not([class]):not(use):not(path)]:hidden [&>:first-child]:!mt-0 [&>:last-child]:!mb-0 [&>h1]:text-heading-xl! [&>h2]:text-heading-lg! [&>h3]:text-heading-md! [&>h4]:text-heading-sm! [&>h5]:text-heading-xs! [&>h6]:text-subtitle-1! quote [&_blockquote:not([class])>div]:before:content-(--quote-open) [&_blockquote:not([class])>div]:after:content-(--quote-close) [&_blockquote:not([class])>div]:border-l [&_blockquote:not([class])>div]:border-border-primary [&_blockquote:not([class])>div]:pl-7 [&_ul:not([class])]:pl-[calc(var(--container-padding)+1.125rem)] [&_ul:not([class])]:list-disc [&_ul:not([class])_ul]:mt-2 [&_ul:not([class])_li]:mb-[0.5em] [&_ol:not([class])]:list-none [&_ol:not([class])]:[counter-reset:section] [&_ol:not([class])_ol]:pl-8 [&_ol:not([class])_ol]:mt-2 [&_ol:not([class])_li]:mb-[0.5em] [&_ol:not([class])_li]:[counter-increment:section] [&_ol:not([class])_li]:before:[content:counters(section,'.')] [&_ol:not([class])_li]:before:mr-3 [&_ol:not([class])_li]:before:font-medium [&_p:not([class])]:break-words [&_a:not([class])]:underline [&_a:not([class])]:decoration-1 [&_a:not([class])]:underline-offset-4 [&_a:not([class])]:hover:no-underline";

const styles = tv({
	slots: {
		base: '',
	},
	variants: {
		stackSpacing: {
			default: {
				base: `${proseShared} [&>*+*]:mt-12`,
			},
			editorial: {
				base: `${proseShared} [&>*+*]:mt-6 [&>h2+p]:mt-4 [&>h3+p]:mt-4`,
			},
		},
		type: textStyles.variants.type,
	},
	defaultVariants: {
		stackSpacing: 'default',
	},
});

export type TypographyStackSpacing = 'default' | 'editorial';

export type TypographyProps = ComponentProps<any> & {
	as: keyof JSX.IntrinsicElements;
	className?: string;
	styleType?: 'default' | StyleTypes;
	stackSpacing?: TypographyStackSpacing;
};

export function Typography({
	as: El = 'div',
	styleType = 'default',
	stackSpacing = 'default',
	className,
	...props
}: PropsWithChildren<TypographyProps>) {
	const { base } = styles({ type: styleType, stackSpacing });

	return (
		<El {...props} className={cn(base(), className)}>
			{props.children}
		</El>
	);
}
