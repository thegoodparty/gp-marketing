'use client';

import { useState } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { CandidatesCard, type CandidatesCardProps } from './CandidatesCard.tsx';
import { Text } from './Text.tsx';
import { Button, ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { IconResolver } from './IconResolver.tsx';
import { resolveButtonStyleType } from './_lib/resolveButtonStyleType.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

const styles = tv({
	slots: {
		base: 'py-[calc(var(--container-padding))]',
		wrapper: 'flex flex-col gap-12 md:gap-20',
		grid: 'grid gap-6 md:grid-cols-2',
		emptyState: 'text-center py-8',
		buttonWrapper: 'flex justify-center mt-8',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
});

export type CandidateCard = CandidatesCardProps & {
	_key?: string;
};

export type CandidatesBlockProps = {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	candidates: CandidateCard[];
	enablePagination?: boolean;
	initialDisplayCount?: number;
	showMoreLabel?: string;
	optionalButton?: ComponentButtonProps;
};

export function CandidatesBlock(props: CandidatesBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const initialDisplayCount = props.initialDisplayCount ?? 6;
	const { base, wrapper, grid, emptyState, buttonWrapper } = styles({ backgroundColor });

	const [displayCount, setDisplayCount] = useState(initialDisplayCount);

	const displayedCandidates = props.enablePagination
		? props.candidates.slice(0, displayCount)
		: props.candidates;
	const hasMore = props.enablePagination && displayCount < props.candidates.length;

	const handleShowMore = () => {
		setDisplayCount(prev => prev + initialDisplayCount);
	};

	const resolvedButtonStyle = resolveButtonStyleType('primary', backgroundColor);

	const showShowMoreButton = props.enablePagination && hasMore;
	const showOptionalButton =
		(props.enablePagination && !hasMore && props.optionalButton) ||
		(!props.enablePagination && props.optionalButton);

	return (
		<article className={cn(base(), props.className)} data-component='CandidatesBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && (
						<HeaderBlock
							{...props.header}
							backgroundColor={backgroundColor}
							layout={props.header.layout ?? 'left'}
						/>
					)}

					{displayedCandidates.length > 0 ? (
						<div className={grid()}>
							{displayedCandidates.map((candidate, index) => (
								<CandidatesCard key={candidate._key ?? index} {...candidate} />
							))}
						</div>
					) : (
						<div className={emptyState()}>
							<Text styleType="body-1">No candidates found</Text>
						</div>
					)}

					{(showShowMoreButton || showOptionalButton) && (
						<div className={buttonWrapper()}>
							{showShowMoreButton ? (
								<Button
									parent='CandidatesBlock'
									type='button'
									onClick={handleShowMore}
									styleType={resolvedButtonStyle}
									iconRight={
										<IconResolver
											icon='arrow-up-right'
											className='min-w-4.5 min-h-4.5 w-4.5 h-4.5 max-w-4.5 max-h-4.5'
										/>
									}
								>
									{props.showMoreLabel ?? 'Show more candidates'}
								</Button>
							) : (
								props.optionalButton && <ComponentButton {...props.optionalButton} />
							)}
						</div>
					)}
				</div>
			</Container>
		</article>
	);
}
