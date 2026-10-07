'use client';

import { cn, tv } from './_lib/utils.ts';
import { Avatar, type AvatarProps } from './Avatar.tsx';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ElectionsNearYouSearch } from './ElectionsNearYouSearch.tsx';

const styles = tv({
	slots: {
		base: 'relative',
		card: 'relative',
		content: 'relative flex flex-col items-center gap-6 text-center',
		textContainer: 'flex flex-col gap-4 max-w-[50rem] mx-auto',
		socialProof: 'flex items-center gap-2 text-left md:mt-4',
		socialProofAvatars: 'flex -space-x-1',
		socialProofAvatar: 'size-8 outline outline-[1.5px] outline-white',
	},
	variants: {
		// Contained paints the card and clips the glow to its rounded corners;
		// full width paints the section so the glow bleeds past the container.
		layout: {
			contained: {
				base: 'py-5 md:py-6',
				card: 'overflow-hidden rounded-3xl px-6 py-10 md:px-16 md:py-[7.5rem]',
			},
			fullWidth: {
				card: 'mx-auto max-w-[50rem] py-8 md:py-20',
			},
		},
		backgroundColor: {
			cream: {
				content: 'text-black',
			},
			midnight: {
				content: 'text-white',
			},
		},
	},
	compoundVariants: [
		{ layout: 'contained', backgroundColor: 'cream', class: { card: 'bg-goodparty-cream' } },
		{ layout: 'contained', backgroundColor: 'midnight', class: { card: 'bg-midnight-900' } },
		{ layout: 'fullWidth', backgroundColor: 'cream', class: { base: 'bg-goodparty-cream' } },
		{ layout: 'fullWidth', backgroundColor: 'midnight', class: { base: 'bg-midnight-900' } },
	],
});

// The Figma card's top-center blue glow (node 3096:3858), expressed as the
// artboard's radial gradient normalized to percentages so it scales with the
// card. The full-width frame (node 3093:3901) draws the same gradient at the
// same percentages, so one definition serves both layouts. Inline style rather
// than an arbitrary Tailwind class so tailwind-merge can never drop it against
// the variant's bg color.
const MIDNIGHT_GLOW =
	'radial-gradient(80% 160% at 50% -80%, #2d6eeb 0%, #2558bb 25%, #1c428a 50%, #142b5a 75%, #0f2041 87.5%, #0b1529 100%)';

export type ElectionsNearYouBlockProps = {
	className?: string;
	heading?: string;
	body?: string;
	buttonLabel?: string;
	backgroundColor?: 'cream' | 'midnight';
	layout?: 'contained' | 'fullWidth';
	showSocialProof?: boolean;
	socialProofText?: string;
	socialProofAvatars?: AvatarProps[];
};

// No CMS field distinguishes where a page places this block yet, so Phase 1
// hardcodes the one value the Viewed event needs today rather than adding a
// schema field a real second placement hasn't asked for.
const BLOCK_PLACEMENT = 'elections_near_you_block';

export function ElectionsNearYouBlock(props: ElectionsNearYouBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'midnight';
	// Documents saved before the layout field existed have no value, so the
	// default has to be the contained card they already render as.
	const layout = props.layout ?? 'contained';
	const { base, card, content, textContainer, socialProof, socialProofAvatars, socialProofAvatar } = styles({ backgroundColor, layout });

	const glowStyle = backgroundColor === 'midnight' ? { backgroundImage: MIDNIGHT_GLOW } : undefined;
	const avatars = props.socialProofAvatars ?? [];
	const showSocialProof = Boolean(props.showSocialProof && (props.socialProofText || avatars.length > 0));

	return (
		<section
			className={cn(base(), props.className)}
			data-component='ElectionsNearYouBlock'
			data-layout={layout}
			style={layout === 'fullWidth' ? glowStyle : undefined}
		>
			<Container>
				<div className={card()} style={layout === 'contained' ? glowStyle : undefined}>
					<div className={content()}>
						<div className={textContainer()}>
							{props.heading && (
								<Text as='h2' styleType='heading-xl'>
									{props.heading}
								</Text>
							)}
							{props.body && <Text styleType='body-1'>{props.body}</Text>}
						</div>
						<ElectionsNearYouSearch
							parent='ElectionsNearYouBlock'
							placement={BLOCK_PLACEMENT}
							buttonLabel={props.buttonLabel}
							layout='inline'
							appearance='pill'
						/>
						{showSocialProof && (
							<div className={socialProof()}>
								{avatars.length > 0 && (
									<div className={socialProofAvatars()}>
										{avatars.map(avatar => (
											<Avatar key={avatar._key} {...avatar} className={socialProofAvatar()} />
										))}
									</div>
								)}
								{props.socialProofText && <Text styleType='body-2'>{props.socialProofText}</Text>}
							</div>
						)}
					</div>
				</div>
			</Container>
		</section>
	);
}
