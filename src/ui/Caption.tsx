import type { PropsWithChildren } from 'react';

import { cn } from './_lib/utils.ts';

import { Text } from './Text.tsx';

export type CaptionProps = {
	className?: string;
};

export function Caption(props: PropsWithChildren<CaptionProps>) {
	return (
		<Text as='figcaption' className={cn('font-secondary!', props.className)} data-component='Caption' styleType='text-xs'>
			{props.children}
		</Text>
	);
}
