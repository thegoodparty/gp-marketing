import type { ReactNode } from 'react';
import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { CandidatesCard, type CandidatesCardProps } from './CandidatesCard.tsx';
import { IconResolver } from './IconResolver.tsx';
import { ProfileRequestModal, type ProfileRequestModalProps } from './ProfileRequestModal.tsx';

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
		// (2677:13892 desktop / 2686:20489 phone, Nov 2026). Both frames draw a
		// radial glow from the top edge, wider than it is tall on desktop.
		insetBase: [
			'flex flex-col gap-4 rounded-3xl px-4 py-6 text-left text-black md:p-12',
			'bg-[radial-gradient(ellipse_120%_111%_at_50%_-11%,var(--color-white)_0%,var(--color-red-100)_50%,var(--color-blue-200)_100%)]',
			'md:bg-[radial-gradient(ellipse_139%_115%_at_50%_0%,var(--color-white)_0%,var(--color-red-100)_50%,var(--color-blue-200)_100%)]',
		],
		insetTextSection: 'flex flex-col gap-4',
		insetBody: 'font-secondary text-[1rem]/[1.5rem]',
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
	/**
	 * `inset` only: the button opens a pop-up with the claim button for the
	 * candidate and a request form for voters, instead of going to sign-up.
	 */
	requestModal?: Omit<ProfileRequestModalProps, 'triggerLabel' | 'claimButton'>;
};

function labelText(label: ReactNode): string | undefined {
	return typeof label === 'string' && label.trim() !== '' ? label : undefined;
}

export function ClaimProfileBlock(props: ClaimProfileBlockProps) {
	const layout = props.layout ?? 'card';
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, content, textSection, cardSection, bannerBase, bannerContent, bannerTextSection, insetBase, insetTextSection, insetBody } = styles({
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
					{props.body && <p className={insetBody()}>{props.body}</p>}
				</div>
				{props.requestModal ? (
					<ProfileRequestModal
						{...props.requestModal}
						triggerLabel={labelText(props.claimButton.label) ?? 'Get started'}
						claimButton={claimButtonProps}
					/>
				) : (
					<ComponentButton
						{...claimButtonProps}
						className={cn('w-full md:w-fit', props.claimButton.className)}
						// Studio's Sign Up action arrives as a plain link to the app, which
						// carries no icon; the frames draw the arrow on this button.
						iconRight={props.claimButton.iconRight ?? <IconResolver icon='arrow-up-right' className='size-4 min-w-4' />}
						buttonProps={{ ...claimButtonProps.buttonProps, styleType: 'secondary', styleSize: 'lg' }}
					/>
				)}
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
