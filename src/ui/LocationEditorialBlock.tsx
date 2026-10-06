import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';

import { Container } from './Container.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'flex flex-col gap-6',
		heading: 'max-md:text-heading-md',
		card: 'bg-white rounded-xl p-6 md:p-10',
		// gap-7 is the blank line between paragraphs in the Figma frames (28px,
		// one line of body-large), which the rich text itself does not carry.
		copy: 'flex flex-col gap-7 border-l-4 border-lavender-200 pl-5 md:pl-7',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
				heading: 'max-md:text-heading-md text-white',
				card: 'text-midnight-900',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
});

export type LocationEditorialBlockProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	heading?: string;
	copy?: ReactNode;
};

export function LocationEditorialBlock(props: LocationEditorialBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper, heading, card, copy } = styles({ backgroundColor });

	if (!isValidRichText(props.copy)) {
		return null;
	}

	return (
		<article className={cn(base(), props.className)} data-component='LocationEditorialBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.heading && (
						<Text as='h2' styleType='heading-lg' className={heading()}>
							{props.heading}
						</Text>
					)}
					<div className={card()}>
						<Text styleType='body-large' className={copy()}>
							{props.copy}
						</Text>
					</div>
				</div>
			</Container>
		</article>
	);
}
