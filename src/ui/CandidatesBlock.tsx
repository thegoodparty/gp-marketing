import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { CandidatesCard1, type CandidatesCard1Props } from './CandidatesCard1.tsx';
import { CandidatesCard2, type CandidatesCard2Props } from './CandidatesCard2.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

const styles = tv({
	slots: {
		base: 'py-[calc(var(--container-padding))]',
		wrapper: 'flex flex-col gap-12 md:gap-20',
		grid: 'grid gap-6 md:grid-cols-2',
		filterPlaceholder: 'p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500',
		paginationPlaceholder: 'p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500',
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

export type CandidateCard = (CandidatesCard1Props | CandidatesCard2Props) & {
	_key?: string;
};

export type CandidatesBlockProps = {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	candidates: CandidateCard[];
	hasFilters?: boolean;
	filters?: {
		// Placeholder for future filter structure
	};
	pagination?: {
		currentPage: number;
		totalPages: number;
		// Placeholder for future pagination structure
	};
	optionalButton?: ComponentButtonProps;
};

export function CandidatesBlock(props: CandidatesBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper, grid, filterPlaceholder, paginationPlaceholder, buttonWrapper } = styles({ backgroundColor });

	return (
		<article className={cn(base(), props.className)} data-component='CandidatesBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} layout={props.header.layout ?? 'left'} />}

					{props.hasFilters && (
						<div className={filterPlaceholder()}>
							{/* TODO: Implement filter UI - Feature deferred for future implementation */}
							<p>Filter UI - To be implemented</p>
						</div>
					)}

					<div className={grid()}>
						{props.candidates.map((candidate, index) => {
							// Determine which card type to use based on isGoodPartyCandidate prop
							const isGoodPartyCard = 'isGoodPartyCandidate' in candidate && candidate.isGoodPartyCandidate;

							return isGoodPartyCard ? (
								<CandidatesCard2 key={candidate._key ?? index} {...(candidate as CandidatesCard2Props)} />
							) : (
								<CandidatesCard1 key={candidate._key ?? index} {...(candidate as CandidatesCard1Props)} />
							);
						})}
					</div>

					{props.hasFilters && props.pagination && (
						<div className={paginationPlaceholder()}>
							{/* TODO: Implement pagination UI - Feature deferred for future implementation */}
							<p>
								Pagination UI - Page {props.pagination.currentPage} of {props.pagination.totalPages}
							</p>
						</div>
					)}

					{!props.hasFilters && props.optionalButton && (
						<div className={buttonWrapper()}>
							<ComponentButton {...props.optionalButton} />
						</div>
					)}
				</div>
			</Container>
		</article>
	);
}
