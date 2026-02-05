import { memo, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { cn } from '~/ui/_lib/utils';
import { isValidStateCode } from '~/constants/usStateCodes';

const FALLBACK_SRC = '/icons/states/usa.svg';

export type StateIconProps = {
	stateCode: string;
	width?: number | string;
	height?: number | string;
	className?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'>;

export const StateIcon = memo(function StateIcon({ stateCode, width = 24, height = 24, className, ...props }: StateIconProps) {
	const [hasError, setHasError] = useState(false);
	const [imageLoadError, setImageLoadError] = useState(false);

	// Validate state code
	const isValid = isValidStateCode(stateCode);
	const normalizedCode = stateCode?.toLowerCase().trim() ?? '';
	const shouldUseFallback = !isValid || hasError || imageLoadError;

	const src = shouldUseFallback ? FALLBACK_SRC : `/icons/states/${normalizedCode}.svg`;
	const displayCode = stateCode?.toUpperCase() ?? 'Unknown';

	// Handle image load errors
	const handleError = () => {
		if (!shouldUseFallback) {
			setImageLoadError(true);
		}
		props.onError?.(new Event('error') as any);
	};

	return (
		<img
			src={src}
			width={width}
			height={height}
			alt={
				shouldUseFallback
					? `State icon unavailable for ${displayCode} - USA map placeholder`
					: `${displayCode} state icon`
			}
			aria-label={
				shouldUseFallback
					? `Fallback: State icon for ${displayCode} unavailable`
					: `${displayCode} state icon`
			}
			className={cn(className, shouldUseFallback && 'opacity-50 grayscale')}
			onError={handleError}
			{...props}
		/>
	);
});
