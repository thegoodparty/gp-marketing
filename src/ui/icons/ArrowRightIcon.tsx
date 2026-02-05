import type { SVGProps } from 'react';
import { cn } from '../_lib/utils.ts';

export type ArrowRightIconProps = SVGProps<SVGSVGElement> & {
	/**
	 * Size of the icon in pixels. Both width and height will be set to this value.
	 * @default 32
	 */
	size?: number;
};

/**
 * Reusable right-pointing arrow icon component.
 * 
 * Used throughout the application to indicate navigation, links, or forward movement.
 * The icon uses `currentColor` for the fill, allowing easy color customization via CSS classes.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ArrowRightIcon />
 * 
 * // Custom size
 * <ArrowRightIcon size={24} />
 * 
 * // With styling
 * <ArrowRightIcon size={32} className="text-blue-500" />
 * 
 * // In links
 * <Anchor href="/page">
 *   <span>View more</span>
 *   <ArrowRightIcon size={24} className="ml-2" />
 * </Anchor>
 * ```
 */
export function ArrowRightIcon({ size = 32, className, ...props }: ArrowRightIconProps) {
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
			<path
				d="M23.057 9.72256C23.5777 9.20186 24.4217 9.20186 24.9424 9.72256L30.2757 15.0559C30.7964 15.5766 30.7964 16.4206 30.2757 16.9413L24.9424 22.2746C24.4217 22.7953 23.5777 22.7953 23.057 22.2746C22.5363 21.7539 22.5363 20.9099 23.057 20.3892L26.1143 17.3319H2.66634C1.92996 17.3319 1.33301 16.735 1.33301 15.9986C1.33301 15.2622 1.92996 14.6653 2.66634 14.6653H26.1143L23.057 11.608C22.5363 11.0873 22.5363 10.2433 23.057 9.72256Z"
				fill="currentColor"
			/>
		</svg>
	);
}
