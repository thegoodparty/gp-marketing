import { cn, tv } from './_lib/utils.ts';

import { Anchor } from './Anchor.tsx';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ArrowRightIcon } from './icons/ArrowRightIcon.tsx';
import type { OfficeItem } from './ListOfOfficesBlock.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';
import { formatElectionDateShortFromApi } from '~/lib/electionsHelpers';

/** Marketing's cap for the block (Emily, 2026-09-24). The data helper applies it too. */
export const NEARBY_OFFICES_LIMIT = 8;

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		wrapper: 'flex flex-col gap-4 md:gap-8',
		// Figma: 32px at every width; heading-sm reaches 32 only at 1440, heading-md starts there.
		heading: 'text-black max-md:text-heading-md',
		list: 'flex flex-col gap-4',
		// The header mirrors the row grid so each label sits over its own column.
		// The count column is the frame's: type 123, position and count sharing the
		// middle at 1.25:1, date 180, arrow 24, with 16px gaps and a 14px inset.
		columnHeader: 'hidden md:grid md:grid-cols-[7.6875rem_1.25fr_1fr_11.25rem_1.5rem] md:items-center md:gap-x-4 md:px-3.5 md:h-8',
		columnHeaderCell: 'font-primary tracking-[0.7px] text-black whitespace-nowrap',
		// Every desktop cell names its column: the count cell is left out of a row
		// without a count, and auto-placement would otherwise slide the date into
		// its track. 60px is the row's floor; a long position name wraps and grows it.
		row: [
			'group grid grid-cols-[minmax(0,1fr)_2rem] gap-y-2 items-center rounded-sm border border-black/12 bg-white px-3 py-3',
			'md:min-h-15 md:grid-cols-[7.6875rem_1.25fr_1fr_11.25rem_1.5rem] md:gap-x-4 md:gap-y-0 md:px-3.5 md:py-3',
			'transition-colors',
		],
		rowLink: 'hover:border-goodparty-blue',
		tag: [
			'inline-flex w-fit items-center rounded-xs px-2 py-1 col-span-2 md:col-span-1 md:col-start-1 md:row-start-1',
			'bg-blue-900 text-white font-primary text-text-xs leading-4 font-semibold uppercase tracking-[1px] whitespace-nowrap',
		],
		// Figma: 20px medium at every width; subtitle-1 is 20 on phones and subtitle-2 is 20 at 1440.
		position: 'font-medium text-black col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:truncate md:text-subtitle-2 md:font-medium',
		// The badge leads the sentence on the phone card and trails the bare number
		// on the desktop row, so the DOM order (number, badge) is reversed below md.
		count: [
			'col-span-2 flex flex-row-reverse items-center justify-end gap-0.5 text-black',
			'md:col-span-1 md:col-start-3 md:row-start-1 md:flex-row md:justify-start md:gap-2',
		],
		countBadge: 'h-6 w-8 shrink-0',
		date: 'text-black whitespace-nowrap md:col-start-4 md:row-start-1',
		arrow: 'justify-self-end text-black md:col-start-5 md:row-start-1',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
			},
			midnight: {
				base: 'bg-midnight-900',
				heading: 'text-white',
				columnHeaderCell: 'text-white',
			},
		},
	},
});

export type NearbyOfficesProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	heading?: string;
	/** Already selected and ordered by the page; anything past the cap is dropped here as well. */
	offices: OfficeItem[];
};

/**
 * Renders nothing without offices. On a page whose route does not feed the
 * block (today: everything but the position pages) an empty list would
 * otherwise publish a heading over nothing, which no boundary catches.
 */
export const NearbyOffices = (props: NearbyOfficesProps) => {
	const offices = props.offices.slice(0, NEARBY_OFFICES_LIMIT);
	if (offices.length === 0) return null;

	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper, heading, list, columnHeader, columnHeaderCell, row, rowLink, tag, position, count, countBadge, date, arrow } =
		styles({ backgroundColor });

	return (
		<article className={cn(base(), props.className)} data-component='NearbyOffices'>
			<Container size='xl'>
				<div className={wrapper()}>
					<Text as='h2' styleType='heading-sm' className={heading()}>
						{props.heading || 'Nearby offices'}
					</Text>
					<div className={list()}>
						<div className={columnHeader()} aria-hidden='true'>
							<Text as='span' styleType='subtitle-2' className={columnHeaderCell()}>
								Type
							</Text>
							<Text as='span' styleType='subtitle-2' className={columnHeaderCell()}>
								Position
							</Text>
							<Text as='span' styleType='subtitle-2' className={columnHeaderCell()}>
								# of independents running
							</Text>
							<Text as='span' styleType='subtitle-2' className={columnHeaderCell()}>
								Election date
							</Text>
							<span />
						</div>
						{offices.map(office => {
							const content = (
								<>
									<span className={tag()}>{office.type}</span>
									<Text as='span' styleType='subtitle-1' className={position()}>
										{office.position}
									</Text>
									{office.pledgedCount ? (
										<Text as='span' styleType='body-2' className={count()}>
											<span>
												{office.pledgedCount}
												<span className='md:sr-only'>{office.pledgedCount === 1 ? ' independent running' : ' independents running'}</span>
											</span>
											<Logo className={countBadge()} aria-hidden='true' />
										</Text>
									) : null}
									<Text as='span' styleType='body-2' className={date()}>
										{formatElectionDateShortFromApi(office.nextElectionDate)}
									</Text>
									<span className={arrow()}>
										{office.href && (
											<>
												<ArrowRightIcon size={32} className='md:hidden' innerClassName='group-hover:animate-slide-in-right' />
												<ArrowRightIcon size={24} className='hidden md:block' innerClassName='group-hover:animate-slide-in-right' />
											</>
										)}
									</span>
								</>
							);

							return office.href ? (
								<Anchor key={office.id} href={office.href} className={cn(row(), rowLink())}>
									{content}
								</Anchor>
							) : (
								<div key={office.id} className={row()}>
									{content}
								</div>
							);
						})}
					</div>
				</div>
			</Container>
		</article>
	);
};
