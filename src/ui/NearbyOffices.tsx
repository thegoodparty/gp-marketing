import { cn, tv } from './_lib/utils.ts';

import { Anchor } from './Anchor.tsx';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ArrowRightIcon } from './icons/ArrowRightIcon.tsx';
import type { OfficeItem } from './ListOfOfficesBlock.tsx';
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
		columnHeader: 'hidden md:grid md:grid-cols-[6.5rem_minmax(0,1fr)_8.5rem_1.5rem] md:items-center md:gap-x-12 md:px-6 md:h-8',
		columnHeaderCell: 'font-primary tracking-[0.7px] text-black whitespace-nowrap',
		row: [
			'group grid grid-cols-[minmax(0,1fr)_2rem] gap-y-2 items-center rounded-sm border border-black/12 bg-white px-3 py-3',
			'md:grid-cols-[6.5rem_minmax(0,1fr)_8.5rem_1.5rem] md:gap-x-12 md:gap-y-0 md:px-6 md:py-4',
			'transition-colors',
		],
		rowLink: 'hover:border-goodparty-blue',
		tag: [
			'inline-flex w-fit items-center rounded-xs px-2 py-1 col-span-2 md:col-span-1',
			'bg-blue-900 text-white font-primary text-text-xs leading-4 font-semibold uppercase tracking-[1px] whitespace-nowrap',
		],
		// Figma: 20px medium at every width; subtitle-1 is 20 on phones and subtitle-2 is 20 at 1440.
		position: 'font-medium text-black col-span-2 md:col-span-1 md:truncate md:text-subtitle-2 md:font-medium',
		date: 'text-black whitespace-nowrap',
		arrow: 'justify-self-end text-black',
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
	const { base, wrapper, heading, list, columnHeader, columnHeaderCell, row, rowLink, tag, position, date, arrow } = styles({
		backgroundColor,
	});

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
