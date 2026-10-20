'use client';

import { cn, tv } from './_lib/utils.ts';
import { Avatar } from './Avatar.tsx';
import { IconResolver } from './IconResolver.tsx';
import { ButtonLink } from './Inputs/Button.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';
import { getInitials } from '~/utils/getInitials';
import { trackVoterGuideEvent } from '~/lib/analytics';

const styles = tv({
	slots: {
		// Figma: 24 padding, 32 radius, 24 between photo, text and button. The block's grid sets the width.
		base: 'relative flex w-full flex-col items-center gap-6 rounded-[2rem] bg-white p-6 text-center',
		avatarWrapper: 'relative size-[12.5rem] shrink-0',
		avatar: 'size-[12.5rem]',
		initials: 'flex size-[12.5rem] items-center justify-center rounded-full bg-gray-200 font-primary text-heading-md font-semibold text-gray-700',
		// The Heart & Star badge sits inside the photo's bottom-right corner (78x59 in the frame).
		badge: 'absolute bottom-0 right-0 h-[3.66rem] w-[4.875rem]',
		// Figma: Outfit 24/32 name and office, 20/28 grey location, on both frames; the type tokens ramp, so sizes are explicit.
		body: 'flex w-full grow flex-col gap-0.5',
		name: 'font-primary text-[1.5rem]/[2rem] font-semibold text-black',
		office: 'font-primary text-[1.5rem]/[2rem] font-normal text-black',
		location: 'font-primary text-[1.25rem]/[1.75rem] font-normal text-gray-500',
		// The button's link stretches over the card so a click on the photo or name lands too.
		button: 'w-full after:absolute after:inset-0 after:rounded-[2rem] after:content-[""]',
	},
});

export type FeaturedCandidateCardProps = {
	className?: string;
	name: string;
	/** The office the person is running for or holds. */
	office?: string | null;
	/** "Houston, TX" */
	location?: string | null;
	href: string;
	avatarUrl?: string | null;
	/** Draws the Heart & Star badge over the photo. Only ever true when the person's profile says so. */
	isPledged?: boolean;
	buttonLabel?: string;
	/** The card's place in the block, counted from 0, for the click event. */
	position?: number;
};

export function FeaturedCandidateCard(props: FeaturedCandidateCardProps) {
	const { base, avatarWrapper, avatar, initials, badge, body, name, office, location, button } = styles();

	return (
		<article className={cn(base(), props.className)} data-component='FeaturedCandidateCard'>
			<div className={avatarWrapper()}>
				{props.avatarUrl ? (
					<Avatar image={props.avatarUrl} className={avatar()} />
				) : (
					<div className={initials()} aria-hidden='true'>
						{getInitials(props.name)}
					</div>
				)}
				{props.isPledged && <Logo className={badge()} role='img' aria-label='Has taken the GoodParty.org Pledge' />}
			</div>
			<div className={body()}>
				<h3 className={name()}>{props.name}</h3>
				{props.office && <p className={office()}>{props.office}</p>}
				{props.location && <p className={location()}>{props.location}</p>}
			</div>
			<ButtonLink
				parent='FeaturedCandidateCard'
				href={props.href}
				styleType='secondary'
				styleSize='md'
				className={button()}
				onClick={() =>
					trackVoterGuideEvent('featuredCandidateClick', {
						name: props.name,
						office: props.office ?? null,
						location: props.location ?? null,
						is_pledged: props.isPledged ?? false,
						position: props.position ?? null,
						href: props.href,
					})
				}
				iconRight={<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />}
			>
				{props.buttonLabel ?? 'View profile'}
			</ButtonLink>
		</article>
	);
}
