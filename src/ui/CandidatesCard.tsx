import { cn, tv } from './_lib/utils.ts';
import { Text } from './Text.tsx';
import { Anchor } from './Anchor.tsx';

const styles = tv({
	slots: {
		base: 'flex items-center gap-4 p-6 bg-white rounded-2xl',
		avatarContainer: 'relative flex-shrink-0',
		avatar: 'w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden',
		badge: 'absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm',
		content: 'flex-1 flex flex-col gap-1',
	},
});

export type CandidatesCardProps = {
	className?: string;
	name: string;
	partyAffiliation?: string;
	secondaryText?: string;
	avatarUrl?: string;
	href?: string;
	showBadge?: boolean;
};

export function CandidatesCard(props: CandidatesCardProps) {
	const { base, avatarContainer, avatar, badge, content } = styles();

	const cardContent = (
		<>
			<div className={avatarContainer()}>
				<div className={avatar()}>
					{props.avatarUrl ? (
						<img src={props.avatarUrl} alt={props.name} className='w-full h-full object-cover' />
					) : (
						<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M16 16C19.3137 16 22 13.3137 22 10C22 6.68629 19.3137 4 16 4C12.6863 4 10 6.68629 10 10C10 13.3137 12.6863 16 16 16Z'
								fill='#9CA3AF'
							/>
							<path
								d='M16 18C10.4772 18 6 22.4772 6 28H26C26 22.4772 21.5228 18 16 18Z'
								fill='#9CA3AF'
							/>
						</svg>
					)}
				</div>
				{props.showBadge && (
					<div className={badge()}>
						<svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M7 1.16667L8.855 4.91667L13 5.54167L10 8.45833L10.71 12.5833L7 10.6417L3.29 12.5833L4 8.45833L1 5.54167L5.145 4.91667L7 1.16667Z'
								fill='#EF4444'
								stroke='#EF4444'
								strokeWidth='1.5'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</div>
				)}
			</div>
			<div className={content()}>
				<Text as='h3' styleType='heading-xs'>
					{props.name}
				</Text>
				{props.partyAffiliation && (
					<Text as='span' styleType='body-2'>
						{props.partyAffiliation}
					</Text>
				)}
				{props.secondaryText && (
					<Text as='span' styleType='caption'>
						{props.secondaryText}
					</Text>
				)}
			</div>
		</>
	);

	if (props.href) {
		return (
			<Anchor href={props.href} className={cn(base(), props.className)} data-component='CandidatesCard'>
				{cardContent}
			</Anchor>
		);
	}

	return (
		<article className={cn(base(), props.className)} data-component='CandidatesCard'>
			{cardContent}
		</article>
	);
}
