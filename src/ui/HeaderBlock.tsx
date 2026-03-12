import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import { resolveTextSize, type ResolvedTextSize } from './_lib/resolveTextSize.ts';

import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'flex',
		content: 'flex flex-col gap-6 w-full',
		overline: 'text-neutral-500',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
			},
			midnight: {
				base: 'bg-midnight-900 text-white',
				overline: 'text-neutral-400',
			},
			white: {
				base: 'bg-white',
			},
		},
		layout: {
			center: {
				base: 'justify-center text-center',
				content: 'items-center max-w-[50rem] mx-auto',
			},
			left: {
				base: '',
			},
		right: {
			base: 'justify-end text-right',
			content: 'items-end',
		},
		},
	},
});

export type HeaderBlockProps = {
	buttons?: ComponentButtonProps[];
	className?: string;
	copy?: ReactNode;
	label?: string;
	title?: string;
	layout?: 'left' | 'right' | 'center';
	backgroundColor?: 'cream' | 'midnight' | 'white';
	caption?: string;
	textSize?: ResolvedTextSize;
};

export function HeaderBlock(props: HeaderBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const layout = props.layout ?? 'center';
	const textSize = props.textSize ?? resolveTextSize('Medium');

	const { base, content, overline } = styles({ backgroundColor, layout });

	return (
		<div className={cn(base(), props.className)} data-component='HeaderBlock'>
			<div className={content()}>
				<div className='flex flex-col gap-3 md:gap-4'>
					{props.label && (
						<span className={overline()}>
							<Text as='span' styleType='overline'>
								{props.label}
							</Text>
						</span>
					)}
					{props.title && (
						<Text as='h2' styleType={textSize.heading}>
							{props.title}
						</Text>
					)}
					{isValidRichText(props.copy) && <Text styleType={textSize.body}>{props.copy}</Text>}
				</div>
				{props.buttons && props.buttons.length > 0 && (
					<div className={`flex flex-wrap gap-4 max-sm:w-full w-fit`}>
						{props.buttons.map((item, index) => {
							const resolvedStyle = resolveButtonStyleType(item?.buttonProps?.styleType ?? 'primary', backgroundColor);

							return (
								<ComponentButton
									key={index}
									className='max-sm:w-full'
									{...item}
									buttonProps={{ ...(item.buttonProps ?? {}), styleType: resolvedStyle }}
								/>
							);
						})}
					</div>
				)}
				{props.caption && <Text styleType='caption'>{props.caption}</Text>}
			</div>
		</div>
	);
}
