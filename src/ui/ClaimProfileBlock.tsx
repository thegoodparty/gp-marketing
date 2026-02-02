import type { ReactNode } from 'react';
import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { CandidatesCard, type CandidatesCardProps } from './CandidatesCard.tsx';

const styles = tv({
	slots: {
		base: 'p-12 border border-bright-yellow-600 rounded-3xl',
		content: 'flex flex-col lg:flex-row gap-8 items-center',
		textSection: 'flex-1 flex flex-col gap-6',
		cardSection: 'flex-1 w-full lg:w-auto',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900 border-midnight-700',
				textSection: 'text-white',
			},
			cream: {
				base: 'bg-goodparty-cream border-bright-yellow-600',
			},
			'bright-yellow': {
				base: 'bg-bright-yellow-100 border-bright-yellow-600',
			},
		},
	},
});

export type ClaimProfileBlockProps = {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number] | 'bright-yellow';
	headline?: string;
	body?: ReactNode;
	claimButton: ComponentButtonProps;
	exampleCard: CandidatesCardProps;
};

export function ClaimProfileBlock(props: ClaimProfileBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, content, textSection, cardSection } = styles({ backgroundColor });

	return (
		<article className={cn(base(), props.className)} data-component='ClaimProfileBlock'>
			<Container size='xl' className='px-0!'>
				<div className={content()}>
					<div className={textSection()}>
						{props.headline && (
							<Text as='h2' styleType='heading-lg'>
								{props.headline}
							</Text>
						)}
						{props.body && <Text styleType='body-1'>{props.body}</Text>}
						<ComponentButton
							{...props.claimButton}
							className={cn('w-fit', props.claimButton.className)}
							buttonProps={{
								...props.claimButton.buttonProps,
								styleSize: props.claimButton.buttonProps?.styleSize ?? 'sm',
								styleType:
									props.claimButton.buttonProps?.styleType ??
									(backgroundColor === 'bright-yellow' ? 'secondary' : 'primary'),
							}}
						/>
					</div>
					<div className={cardSection()}>
						<CandidatesCard {...props.exampleCard} />
					</div>
				</div>
			</Container>
		</article>
	);
}
