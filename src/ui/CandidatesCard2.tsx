import { memo } from 'react';
import { cn, tv } from './_lib/utils.ts';
import type { SanityImage } from './types.ts';
import { Avatar } from './Avatar.tsx';
import { Text } from './Text.tsx';
import { Anchor } from './Anchor.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';
import { getInitials } from '~/utils/getInitials';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-4 p-4 bg-white rounded-xl border border-bright-yellow-600 transition-[shadow,background-color] duration-normal hover:shadow-md hover:bg-bright-yellow-50 md:flex-row md:items-center md:p-6',
		avatarWrapper: 'relative flex-shrink-0 size-24 overflow-visible',
		badge: 'absolute bottom-0 right-0 w-[50px] h-[35px] flex items-center justify-center',
		contentWrapper: 'flex flex-col flex-1 min-w-0 gap-4 md:justify-between',
		content: 'flex flex-col gap-1',
		empowered: 'text-goodparty-blue',
		link: 'flex items-center gap-2 text-nowrap shrink-0',
	},
});

export type CandidatesCard2Props = {
	className?: string;
	avatar?: SanityImage | string;
	name: string;
	partyAffiliation: string;
	href: string;
	isGoodPartyCandidate?: boolean;
};

export const CandidatesCard2 = memo(function CandidatesCard2(props: CandidatesCard2Props) {
	const { base, avatarWrapper, badge, contentWrapper, content, empowered, link } = styles();

	// Generate initials from name if no avatar
	const initials = props.avatar ? undefined : getInitials(props.name);

	return (
		<article className={cn(base(), props.className)} data-component='CandidatesCard2'>
			<div className={avatarWrapper()}>
				{props.avatar ? (
					<Avatar image={props.avatar} size='xl' />
				) : (
					<div className='flex items-center justify-center size-24 rounded-full bg-gray-200 text-gray-700 font-bold text-2xl'>
						{initials}
					</div>
				)}
				<div className={badge()}>
					<Logo width={100} height={75} />
				</div>
			</div>

			<div className={contentWrapper()}>
				<div className={content()}>
					<Text as='h3' styleType='heading-xs'>
						{props.name}
					</Text>
					<Text as='p' styleType='body-2' className='text-foreground-secondary'>
						{props.partyAffiliation}
					</Text>
					<Text as='p' styleType='caption' className={empowered()}>
						Empowered by goodparty.org
					</Text>
				</div>

				<Anchor href={props.href} className={link()}>
					<Text as='span' styleType='body-2' className='font-medium'>
						View profile
					</Text>
					<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />
				</Anchor>
			</div>
		</article>
	);
});
