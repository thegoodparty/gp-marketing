'use client';

import { type ReactNode, useState } from 'react';

import { trackVoterGuideEvent } from '~/lib/analytics';
import { cn, tv } from './_lib/utils.ts';

import { Container } from './Container.tsx';
import { FeaturedCandidateCard, type FeaturedCandidateCardProps } from './FeaturedCandidateCard.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Button } from './Inputs/Button.tsx';
import { PledgeModal } from './PledgeModal.tsx';
import { Text } from './Text.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';

/** The phone frame stacks three cards and hides the rest behind "See more". */
export const FEATURED_CANDIDATES_MOBILE_INITIAL_COUNT = 3;

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		content: 'flex flex-col gap-12 md:gap-20',
		// Figma: the heading and the callout share a 1064px column on desktop.
		header: 'flex max-w-[66.5rem] flex-col gap-6',
		intro: 'flex flex-col gap-3 md:gap-4',
		// Figma: 48px on desktop, 32px on mobile; heading-lg ramps 40 → 48, so the phone end is pulled down.
		heading: 'text-black max-md:text-heading-md',
		bodyCopy: 'text-black',
		// Figma: midnight/50 fill, midnight/200 hairline, 12px radius. From md the
		// heart gets a 117px column with a divider; on the phone it stacks on top.
		callout: 'flex flex-col gap-3 rounded-md border border-midnight-200 bg-midnight-50 p-4 text-black md:flex-row md:gap-0 md:p-0',
		calloutIconCell: 'flex shrink-0 items-start md:w-[7.3125rem] md:items-center md:justify-center md:border-r md:border-midnight-200',
		calloutIcon: 'h-12 w-14 shrink-0 md:h-[3.6875rem] md:w-[4.5rem]',
		calloutBody: 'flex min-w-0 flex-col gap-1 md:px-8 md:py-[1.1875rem]',
		// Figma: Outfit 20/28 on both frames, which no ramping token gives.
		calloutTitle: 'font-primary text-[1.25rem]/[1.75rem] font-semibold text-black',
		calloutText: 'font-secondary text-[1rem]/[1.5rem] text-black [&_a]:text-info-500 [&_a]:underline md:[&_p]:inline',
		calloutLink:
			'flex w-fit items-center gap-1 font-secondary text-[1rem]/[1.5rem] font-semibold text-info-500 underline max-md:mt-1 md:ml-1 md:inline-flex',
		// Figma: four across at 1440 with 16px between columns and 24px between rows. A short last row
		// keeps the column width and sits at the left, which a grid does on its own.
		grid: 'grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
		cell: 'flex',
		// Figma: a white pill across the column, 40px high, no border.
		showMore: 'w-full border-transparent bg-white md:hidden',
	},
	variants: {
		backgroundColor: {
			cream: { base: 'bg-goodparty-cream' },
			midnight: {
				base: 'bg-midnight-900',
				heading: 'text-white',
				bodyCopy: 'text-white',
			},
		},
	},
});

export type FeaturedCandidatesCalloutProps = {
	/** Defaults to "What this symbol means". */
	title?: string;
	body: ReactNode;
	/** The link at the end of the copy that opens the pledge pop-up. Nothing here means no link. */
	pledgeLinkLabel?: string;
};

export type FeaturedCandidatesBlockProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	heading?: string;
	/** The paragraph under the heading. Nothing here means no paragraph. */
	bodyCopy?: string;
	/** The badge explainer. Nothing here means no callout box at all. */
	callout?: FeaturedCandidatesCalloutProps;
	/** Already filtered to pledged people, ranked and capped by the page (see `selectFeaturedPeople`). */
	people: Array<FeaturedCandidateCardProps & { key?: string }>;
};

/**
 * Renders nothing without people. On a page whose route does not feed the
 * block (today: everything but the location pages) an empty grid would
 * otherwise publish a heading over nothing, which no boundary catches.
 */
export function FeaturedCandidatesBlock(props: FeaturedCandidatesBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const s = styles({ backgroundColor });
	const [expanded, setExpanded] = useState(false);

	if (props.people.length === 0) return null;

	const hiddenOnPhone = expanded ? 0 : Math.max(0, props.people.length - FEATURED_CANDIDATES_MOBILE_INITIAL_COUNT);

	return (
		<article className={cn(s.base(), props.className)} data-component='FeaturedCandidatesBlock'>
			<Container size='xl' className={s.content()}>
				<div className={s.header()}>
					<div className={s.intro()}>
						<Text as='h2' styleType='heading-lg' className={s.heading()}>
							{props.heading || 'Candidates and officials who took the People First Pledge'}
						</Text>
						{props.bodyCopy && (
							<Text as='p' styleType='body-large' className={s.bodyCopy()}>
								{props.bodyCopy}
							</Text>
						)}
					</div>
					{props.callout && (
						<div className={s.callout()} data-component='FeaturedCandidatesCallout'>
							<div className={s.calloutIconCell()}>
								<Logo className={s.calloutIcon()} aria-hidden='true' />
							</div>
							<div className={s.calloutBody()}>
								<h3 className={s.calloutTitle()}>{props.callout.title || 'What this symbol means'}</h3>
								<div className={s.calloutText()}>
									{props.callout.body}
									{props.callout.pledgeLinkLabel && (
										<PledgeModal source='featured_candidates'>
											<button type='button' className={s.calloutLink()}>
												{props.callout.pledgeLinkLabel}
												<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />
											</button>
										</PledgeModal>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
				<div className='flex flex-col gap-6'>
					<ul className={s.grid()}>
						{props.people.map(({ key, ...person }, index) => (
							<li
								key={key ?? person.href}
								className={cn(s.cell(), hiddenOnPhone > 0 && index >= FEATURED_CANDIDATES_MOBILE_INITIAL_COUNT && 'max-md:hidden')}
							>
								<FeaturedCandidateCard {...person} position={index} />
							</li>
						))}
					</ul>
					{hiddenOnPhone > 0 && (
						<Button
							parent='FeaturedCandidatesBlock'
							styleType='outline'
							styleSize='md'
							className={s.showMore()}
							onClick={() => {
								trackVoterGuideEvent('showMoreClick', { list: 'featured_candidates', hidden_count: hiddenOnPhone });
								setExpanded(true);
							}}
							iconRight={<IconResolver icon='circle-chevron-down' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />}
						>
							See more candidates and officials
						</Button>
					)}
				</div>
			</Container>
		</article>
	);
}
