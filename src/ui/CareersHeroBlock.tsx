import type { ReactNode } from 'react';

import { tv } from './_lib/utils.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';

import { Container } from './Container.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Media } from './Media.tsx';
import { Text } from './Text.tsx';
import type { SanityImage } from './types.ts';

const styles = tv({
	slots: {
		base: 'bg-white overflow-hidden',
		content: 'flex flex-col items-center text-center gap-6 py-20 md:py-32',
		heading: 'max-w-[16ch]',
		body: 'max-w-[40ch] text-neutral-600',
		buttons: 'flex flex-wrap justify-center gap-4',
		imageStrip: 'flex w-full',
		imageItem: 'flex-1 min-w-0 aspect-square overflow-hidden',
	},
});

export type CareersHeroBlockProps = {
	title?: string;
	copy?: ReactNode;
	buttons?: ComponentButtonProps[];
	images?: SanityImage[];
	className?: string;
};

export function CareersHeroBlock(props: CareersHeroBlockProps) {
	const { base, content, heading, body, buttons, imageStrip, imageItem } = styles();

	return (
		<article className={base()} data-component='CareersHeroBlock'>
			<Container size='xl'>
				<div className={content()}>
					{props.title && (
						<Text as='h1' styleType='heading-xl' className={heading()}>
							{props.title}
						</Text>
					)}
					{isValidRichText(props.copy) && (
						<Text styleType='body-xl' className={body()}>
							{props.copy}
						</Text>
					)}
					{props.buttons && props.buttons.length > 0 && (
						<div className={buttons()}>
							{props.buttons.map((item, index) => (
								<ComponentButton
									key={index}
									{...item}
									buttonProps={{ ...(item.buttonProps ?? {}), styleType: item.buttonProps?.styleType ?? 'secondary' }}
								/>
							))}
						</div>
					)}
				</div>
			</Container>
			{props.images && props.images.length > 0 && (
				<div className={imageStrip()}>
					{props.images.map((image, index) => (
						<div key={index} className={imageItem()}>
							<Media aspectRatio='1:1' image={image} />
						</div>
					))}
				</div>
			)}
		</article>
	);
}
