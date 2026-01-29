import { cn, tv } from './_lib/utils.ts';
import type { SanityImage } from './types.ts';
import { Avatar } from './Avatar.tsx';
import { Text } from './Text.tsx';
import { Anchor } from './Anchor.tsx';
import { IconResolver } from './IconResolver.tsx';

const styles = tv({
	slots: {
		base: 'flex items-end justify-between gap-4 p-6 bg-white rounded-xl border border-bright-yellow-600 transition-shadow duration-normal hover:shadow-md',
		avatarWrapper: 'relative',
		badge: 'absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm',
		content: 'flex flex-col gap-1 flex-1 min-w-0',
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

export function CandidatesCard2(props: CandidatesCard2Props) {
	const { base, avatarWrapper, badge, content, empowered, link } = styles();

	// Generate initials from name if no avatar
	const initials = props.avatar
		? undefined
		: props.name
				.split(' ')
				.map(n => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2);

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
					<svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
						<path
							d='M7 1.16667L8.855 4.91667L13 5.54167L10 8.45833L10.71 12.5833L7 10.6417L3.29 12.5833L4 8.45833L1 5.54167L5.145 4.91667L7 1.16667Z'
							fill='currentColor'
							className='text-goodparty-red'
							stroke='currentColor'
							strokeWidth='1.5'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</div>
			</div>

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
		</article>
	);
}
