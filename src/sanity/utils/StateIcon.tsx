import type { ImgHTMLAttributes } from 'react';

export type StateIconProps = {
	stateCode: string;
	width?: number | string;
	height?: number | string;
	className?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'>;

export function StateIcon({ stateCode, width = 24, height = 24, className, ...props }: StateIconProps) {
	const normalizedCode = stateCode.toLowerCase().trim();
	const src = `/icons/states/${normalizedCode}.svg`;

	return (
		<img
			src={src}
			width={width}
			height={height}
			alt={`${stateCode.toUpperCase()} state icon`}
			className={className}
			{...props}
		/>
	);
}
