import { cn, tv } from './_lib/utils.ts';
import type { SanityImage } from './types.ts';
import { Avatar } from './Avatar.tsx';
import { Text } from './Text.tsx';
import { Anchor } from './Anchor.tsx';
import { IconResolver } from './IconResolver.tsx';

const styles = tv({
	slots: {
		base: 'flex items-center gap-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-600 transition-shadow duration-normal hover:shadow-md',
		content: 'flex flex-col gap-1 flex-1 min-w-0',
		empowered: 'text-indigo-600',
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
	const { base, content, empowered, link } = styles();

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
			{props.avatar ? (
				<Avatar image={props.avatar} size='lg' />
			) : (
				<div className='flex items-center justify-center size-20 rounded-full bg-indigo-100 text-indigo-600 font-bold text-text-xl'>
					{initials}
				</div>
			)}

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
