import { memo } from 'react';
import { cn, tv } from './_lib/utils.ts';
import { ATTRIBUTION_COPY, type AttributionMode } from './_lib/attributionCopy.ts';
import type { SanityImage } from './types.ts';
import { Avatar } from './Avatar.tsx';
import { Text } from './Text.tsx';
import { Anchor } from './Anchor.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';
import { getInitials } from '~/utils/getInitials';

const styles = tv({
	slots: {
		base: [
			'flex flex-col gap-2 p-6 bg-white rounded-xl border transition-shadow duration-normal hover:shadow-md',
			'max-md:min-w-[260px]',
			'md:flex-row md:flex-wrap md:items-center md:gap-6',
		],
		baseStandard: 'border-black/8 hover:bg-[var(--base-muted,#F5F5F5)]',
		baseGoodParty: 'border-bright-yellow-600 hover:bg-bright-yellow-50',
		avatarWrapper: 'relative flex-shrink-0 size-20 md:size-24 overflow-visible',
		rightColumn: 'flex flex-col flex-1 min-w-0 gap-2 md:gap-4',
		contentWrapper: 'flex flex-col gap-1',
		content: 'flex flex-col gap-1',
		name: 'whitespace-nowrap md:whitespace-normal',
		attributionLine: 'text-neutral-500 min-w-0',
		footerWrapper: 'flex flex-col w-full gap-2 md:w-full md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4',
		link: 'flex items-center gap-2 text-nowrap shrink-0',
		badge: 'absolute -bottom-0.5 -right-0.5 w-[50px] h-[35px] flex items-center justify-center',
	},
});

/**
 * What the card may state about GoodParty.org's relationship to the person.
 *
 * Only the affirmative lines, and deliberately: `ATTRIBUTION_COPY` also carries
 * "Has Not Taken…" and "Ineligible…", which the hero renders but a card must not
 * (see `relatedCardAttribution`). Narrowing the union here is what makes that a
 * type error rather than a judgement call at each call site — and widening it is
 * the whole of the change when the pledge data lands.
 */
export type CardAttributionMode = Extract<AttributionMode, 'empowered' | 'pledged' | 'none'>;

export type CandidatesCardProps = {
	className?: string;
	avatar?: SanityImage | string;
	name: string;
	partyAffiliation: string;
	href: string;
	isGoodPartyCandidate?: boolean;
	/**
	 * The line under the party affiliation. Separate from `isGoodPartyCandidate`,
	 * which carries the mark and the yellow frame — the same split ProfileHero
	 * draws between `showBrandMark` and `attribution`: the mark says this is one
	 * of our candidates, the line asserts a fact about the person. They come from
	 * different inputs on `/people` (claim vs pledge), so a pledged person who is
	 * not a GoodParty candidate still gets their line.
	 *
	 * Defaults to the legacy behaviour — `isGoodPartyCandidate` implies
	 * "Empowered by GoodParty.org" — which is what the Sanity claim block's
	 * example card and `/candidate/[...slug]` still mean by it.
	 */
	attribution?: CardAttributionMode;
	_key?: string;
};

export const CandidatesCard = memo(function CandidatesCard(props: CandidatesCardProps) {
	const isGoodParty = props.isGoodPartyCandidate === true;
	const attributionMode: CardAttributionMode = props.attribution ?? (isGoodParty ? 'empowered' : 'none');
	const { base, baseStandard, baseGoodParty, avatarWrapper, rightColumn, contentWrapper, content, name, attributionLine, footerWrapper, link, badge } = styles();

	// Generate initials from name if no avatar
	const initials = props.avatar ? undefined : getInitials(props.name);

	return (
		<article
			className={cn(base(), isGoodParty ? baseGoodParty() : baseStandard(), props.className)}
			data-component='CandidatesCard'
		>
			<div className={avatarWrapper()}>
				{props.avatar ? (
					<Avatar image={props.avatar} className='size-20 md:size-24' />
				) : (
					<div className='flex items-center justify-center size-20 md:size-24 rounded-full bg-gray-200 text-gray-700 font-bold text-2xl'>
						{initials}
					</div>
				)}
				{isGoodParty && (
					<div className={badge()}>
						<Logo width={85} height={24} />
					</div>
				)}
			</div>

			<div className={rightColumn()}>
				<div className={contentWrapper()}>
					<div className={content()}>
						<Text as='h3' styleType='heading-xs' className={name()}>
							{props.name}
						</Text>
						<Text as='p' styleType='body-2' className='text-foreground-secondary'>
							{props.partyAffiliation}
						</Text>
					</div>
				</div>

				<div className={footerWrapper()}>
					{attributionMode !== 'none' ? (
						<Text as='p' styleType='caption' className={attributionLine()}>
							{ATTRIBUTION_COPY[attributionMode]}
						</Text>
					) : (
						<div />
					)}
					<Anchor href={props.href} className={link()}>
						<Text as='span' styleType='body-2' className='font-medium'>
							View profile
						</Text>
						<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />
					</Anchor>
				</div>
			</div>
		</article>
	);
});
