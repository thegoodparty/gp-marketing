import type { ReactNode } from 'react';
import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { CandidatesCard, type CandidatesCardProps } from './CandidatesCard.tsx';
import { IconResolver } from './IconResolver.tsx';

const styles = tv({
	slots: {
		base: 'p-6 md:p-12 border border-bright-yellow-600 rounded-3xl',
		content: 'flex flex-col lg:flex-row gap-8 items-center',
		textSection: 'flex-1 flex flex-col gap-6',
		cardSection: 'flex-1 w-full lg:w-auto',
		bannerBase: 'w-full border-0 rounded-none py-5 md:py-6',
		bannerContent: 'flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6',
		bannerTextSection: 'min-w-0 flex-1 flex flex-col gap-2 md:gap-3',
		// The person profile's claim card, first in the profile content column
		// (Voter Guide round, 2626:120137 desktop / 2626:128927 phone). The frames
		// draw the glow as a top-down ramp on the phone and a radial one from the
		// top edge on desktop.
		insetBase: [
			'flex flex-col gap-6 rounded-3xl border border-gray-200 p-6 text-center text-black md:px-10 md:py-12',
			'bg-[linear-gradient(180deg,var(--color-white)_25%,var(--color-blue-100)_55%,var(--color-red-100)_100%)]',
			'md:bg-[radial-gradient(ellipse_100%_100%_at_50%_0%,var(--color-white)_25%,var(--color-blue-100)_65%,var(--color-red-100)_100%)]',
		],
		insetTextSection: 'flex flex-col gap-3 md:gap-4',
	},
	variants: {
		layout: {
			card: {},
			banner: {
				base: '',
			},
			inset: {},
		},
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900 border-midnight-700',
				textSection: 'text-white',
				bannerTextSection: 'text-white',
			},
			cream: {
				base: 'bg-goodparty-cream border-bright-yellow-600',
				bannerBase: 'bg-goodparty-cream',
			},
			'bright-yellow': {
				base: 'bg-bright-yellow-100 border-bright-yellow-600',
				bannerBase: 'bg-bright-yellow-100',
			},
		},
	},
	compoundVariants: [
		{
			layout: 'banner',
			backgroundColor: 'cream',
			class: {
				base: 'bg-goodparty-cream border-0',
			},
		},
		{
			layout: 'banner',
			backgroundColor: 'midnight',
			class: {
				base: 'bg-midnight-900 border-0',
			},
		},
		{
			layout: 'banner',
			backgroundColor: 'bright-yellow',
			class: {
				base: 'bg-bright-yellow-100 border-0',
			},
		},
	],
});

export type ClaimProfileBlockProps = {
	className?: string;
	/**
	 * `inset` is the person profile's claim card inside the profile content column:
	 * centred, its own gradient, so `backgroundColor` does not apply to it.
	 */
	layout?: 'card' | 'banner' | 'inset';
	backgroundColor?: 'cream' | 'midnight' | 'bright-yellow';
	headline?: string;
	body?: ReactNode;
	claimButton: ComponentButtonProps;
	exampleCard?: CandidatesCardProps;
};

export function ClaimProfileBlock(props: ClaimProfileBlockProps) {
	const layout = props.layout ?? 'card';
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, content, textSection, cardSection, bannerBase, bannerContent, bannerTextSection, insetBase, insetTextSection } = styles({
		backgroundColor,
		layout,
	});

	const claimButtonProps = {
		...props.claimButton,
		analytics: { event: 'claimProfileClick' as const, properties: { source: 'claim_block', layout } },
		className: cn(layout === 'banner' ? 'w-fit shrink-0' : 'w-fit p-8', props.claimButton.className),
		buttonProps: {
			...props.claimButton.buttonProps,
			styleSize: props.claimButton.buttonProps?.styleSize ?? 'sm',
			styleType: props.claimButton.buttonProps?.styleType ?? (backgroundColor === 'bright-yellow' ? 'secondary' : 'primary'),
		},
	};

	if (layout === 'inset') {
		return (
			<article className={cn(insetBase(), props.className)} data-component='ClaimProfileBlock' data-layout='inset'>
				<div className={insetTextSection()}>
					{props.headline && (
						<Text as='h2' styleType='section-heading'>
							{props.headline}
						</Text>
					)}
					{props.body && <Text styleType='body-1'>{props.body}</Text>}
				</div>
				<ComponentButton
					{...claimButtonProps}
					className={cn('w-full md:w-fit md:self-center', props.claimButton.className)}
					// Studio's Sign Up action arrives as a plain link to the app, which
					// carries no icon; the frames draw the arrow on this button.
					iconRight={props.claimButton.iconRight ?? <IconResolver icon='arrow-up-right' className='size-4 min-w-4' />}
					buttonProps={{ ...claimButtonProps.buttonProps, styleType: 'secondary', styleSize: 'lg' }}
				/>
			</article>
		);
	}

	if (layout === 'banner') {
		return (
			<article className={cn(bannerBase(), props.className)} data-component='ClaimProfileBlock' data-layout='banner'>
				<Container size='xl'>
					<div className={bannerContent()}>
						<div className={bannerTextSection()}>
							{props.headline && (
								<Text as='h2' styleType='subtitle-1'>
									{props.headline}
								</Text>
							)}
							{props.body && <Text styleType='body-2'>{props.body}</Text>}
						</div>
						<ComponentButton {...claimButtonProps} />
					</div>
				</Container>
			</article>
		);
	}

	return (
		<article className={cn(base(), props.className)} data-component='ClaimProfileBlock' data-layout='card'>
			<Container size='xl' className='px-0!'>
				<div className={content()}>
					<div className={textSection()}>
						{props.headline && (
							<Text as='h2' styleType='heading-md'>
								{props.headline}
							</Text>
						)}
						{props.body && <Text styleType='body-1'>{props.body}</Text>}
						<ComponentButton {...claimButtonProps} />
					</div>
					{props.exampleCard && (
						<div className={cardSection()}>
							<CandidatesCard {...props.exampleCard} />
						</div>
					)}
				</div>
			</Container>
		</article>
	);
}
