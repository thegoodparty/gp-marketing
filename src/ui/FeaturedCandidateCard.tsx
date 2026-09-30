import { cn, tv } from './_lib/utils.ts';
import { Avatar } from './Avatar.tsx';
import { IconResolver } from './IconResolver.tsx';
import { ButtonLink } from './Inputs/Button.tsx';
import { Text } from './Text.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';
import { getInitials } from '~/utils/getInitials';

const styles = tv({
	slots: {
		// Figma: 308 wide, 24 padding, 32 radius, 24 between photo, text and button.
		base: 'flex w-[19.25rem] shrink-0 flex-col items-center gap-6 rounded-[2rem] bg-white p-6 text-center',
		avatarWrapper: 'relative size-[12.5rem] shrink-0',
		avatar: 'size-[12.5rem]',
		initials: 'flex size-[12.5rem] items-center justify-center rounded-full bg-gray-200 font-primary text-heading-md font-semibold text-gray-700',
		// The Heart & Star badge sits inside the photo's bottom-right corner (78x59 in the frame).
		badge: 'absolute bottom-0 right-0 h-[3.66rem] w-[4.875rem]',
		body: 'flex w-full flex-col gap-0.5',
		name: 'text-black',
		office: 'font-normal text-black',
		location: 'font-primary font-normal text-gray-500',
		button: 'w-full',
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
				<Text as='h3' styleType='heading-xs' className={name()}>
					{props.name}
				</Text>
				{props.office && (
					<Text as='p' styleType='subtitle-1' className={office()}>
						{props.office}
					</Text>
				)}
				{props.location && (
					<Text as='p' styleType='subtitle-2' className={location()}>
						{props.location}
					</Text>
				)}
			</div>
			<ButtonLink
				parent='FeaturedCandidateCard'
				href={props.href}
				styleType='secondary'
				styleSize='md'
				className={button()}
				iconRight={<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />}
			>
				{props.buttonLabel ?? 'View profile'}
			</ButtonLink>
		</article>
	);
}
