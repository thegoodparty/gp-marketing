'use client';

import { type ReactNode, useState } from 'react';

import type { CandidateCard } from '~/ui/CandidatesBlock';
import { CandidatesCard } from '~/ui/CandidatesCard';
import { IconResolver } from '~/ui/IconResolver';
import { Button } from '~/ui/Inputs/Button';

/** How many cards a rail shows before "See more" (Voter Guide frames draw three). */
export const RELATED_PEOPLE_INITIAL_COUNT = 3;

export type RelatedPeopleListProps = {
	cards: CandidateCard[];
	/** Rendered above the first card, e.g. the "What this symbol means" box. */
	callout?: ReactNode;
	initialCount?: number;
};

/**
 * The in-column list of related people (Other Candidates, Nearby Officials): a
 * vertical stack of cards, three at a time, with a "See more" button that
 * reveals the next three until the list is out. Same reveal rule as the
 * Candidates block's Show More, with the frame's label.
 */
export function RelatedPeopleList(props: RelatedPeopleListProps) {
	const step = props.initialCount ?? RELATED_PEOPLE_INITIAL_COUNT;
	const [shown, setShown] = useState(step);
	const visible = props.cards.slice(0, shown);
	const hasMore = shown < props.cards.length;

	return (
		<div className='flex flex-col gap-4' data-component='RelatedPeopleList'>
			{props.callout}
			{visible.map(card => (
				<CandidatesCard key={card._key ?? card.name} {...card} />
			))}
			{hasMore && (
				<div className='flex md:justify-start'>
					<Button
						parent='RelatedPeopleList'
						type='button'
						onClick={() => setShown(count => count + step)}
						styleType='secondary'
						styleSize='md'
						className='max-md:w-full'
						iconRight={<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />}
					>
						See more
					</Button>
				</div>
			)}
		</div>
	);
}
