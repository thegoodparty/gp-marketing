import type { SVGProps } from 'react';
import { cn } from '../_lib/utils.ts';

export type ArrowShortIconProps = SVGProps<SVGSVGElement> & {
	/**
	 * Size of the icon in pixels. Both width and height will be set to this value.
	 * @default 32
	 */
	size?: number;
	/**
	 * Additional class applied to the inner group (the arrow path).
	 * Use with group-hover:animate-slide-in-right on the parent for hover animation.
	 */
	innerClassName?: string;
};

/**
 * Compact right-pointing arrow icon.
 * Uses currentColor for fill, allowing easy color customization via CSS classes.
 */
export function ArrowShortIcon({ size = 32, className, innerClassName, ...props }: ArrowShortIconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn(className)}
			{...props}
		>
			<g className={cn(innerClassName)}>
				<path
					d="M15.9997 5.33203L14.1197 7.21203L21.5597 14.6654H5.33301V17.332H21.5597L14.1197 24.7854L15.9997 26.6654L26.6663 15.9987L15.9997 5.33203Z"
					fill="currentColor"
				/>
			</g>
		</svg>
	);
}
