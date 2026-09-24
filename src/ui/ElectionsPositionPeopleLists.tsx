'use client';

import { useId, useState } from 'react';
import Link from 'next/link';

import { Logo } from '~/sanity/utils/Logo.tsx';
import { getInitials } from '~/utils/getInitials';
import { ATTRIBUTION_COPY } from './_lib/attributionCopy.ts';
import { cn, tv } from './_lib/utils.ts';
import { Avatar } from './Avatar.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Button } from './Inputs/Button.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		section: 'flex flex-col gap-4',
		heading: 'text-midnight-900 max-md:text-heading-md',
		list: 'flex flex-col gap-4',
		card: [
			'group/row relative flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 text-midnight-900 transition-[border-color,box-shadow] duration-fast ease-smooth',
			'lg:flex-row lg:items-center',
		],
		cardLinked: 'hover:border-lavender-200 hover:shadow-[0_0_15px_0_rgba(215,178,255,0.4),0_0_6px_0_rgba(220,188,255,0.1)]',
		rowMain: 'flex min-w-0 items-start gap-4 lg:flex-1 lg:items-center',
		avatarWrap: 'relative size-16 shrink-0',
		initials: 'flex size-16 items-center justify-center rounded-full bg-neutral-400 font-primary text-xl font-semibold text-white',
		mark: 'absolute -bottom-0.5 -right-1',
		text: 'flex min-w-0 flex-1 flex-col gap-0.5',
		nameRow: 'flex flex-wrap items-center gap-2',
		name: 'font-secondary font-semibold',
		tag: 'inline-flex items-center rounded-sm bg-bright-yellow-100 px-2 py-1 font-primary text-[0.75rem] font-semibold uppercase leading-4 tracking-[1px] text-bright-yellow-900',
		meta: 'font-secondary text-midnight-900',
		pledge: 'font-secondary text-neutral-500',
		arrow: 'hidden size-6 shrink-0 text-midnight-900 lg:block',
		mobileCta:
			'flex h-8 w-full items-center justify-center gap-2 rounded-full border border-midnight-900 px-4 font-secondary text-midnight-900 lg:hidden',
		filter: 'relative w-fit max-w-full',
		select: [
			'h-10 max-w-full appearance-none rounded-full border border-midnight-900 bg-white py-2.5 pl-6 pr-12 font-secondary font-semibold text-midnight-900',
			'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-goodparty-blue',
		],
		chevron: 'pointer-events-none absolute right-6 top-1/2 size-4 -translate-y-1/2 text-midnight-900',
		more: 'flex justify-center',
	},
});

export type ElectionsPositionPerson = {
	key: string;
	name: string;
	href?: string;
	avatar?: string;
	/** As the ballot or the office spine names it, e.g. "Independent" or "Democratic". */
	party?: string;
	/** Took the GoodParty.org Pledge, by the same rule the candidate cards use. */
	isPledged?: boolean;
	/** Won this race. Only meaningful once the race is decided. */
	isWinner?: boolean;
	/** Officeholders: "2023 to 2027". */
	term?: string;
	/** Officeholders: the seat held, e.g. "District 3". */
	seatLabel?: string;
	/** The seat or district this row belongs to, matched against the seat filter. */
	seatValue?: string;
	/** What the sub-area is called for this office ("District", "Ward"); names the filter and its options. */
	seatName?: string;
};

export type ElectionsPositionSeatFilter = {
	/** The button label, e.g. "Filter by District". */
	label: string;
	options: { label: string; value: string }[];
};

export type ElectionsPositionPeopleListsProps = {
	candidates?: ElectionsPositionPerson[];
	officeholders?: ElectionsPositionPerson[];
	seatFilter?: ElectionsPositionSeatFilter;
	candidatesHeading: string;
	officeholdersHeading: string;
	showMoreLabel: string;
	/** Marks winners and switches the candidates list into results mode. */
	decided: boolean;
	initialCount?: number;
	candidatesId: string;
	officeholdersId: string;
};

const DEFAULT_INITIAL_COUNT = 4;

function PersonRow({ person, decided }: { person: ElectionsPositionPerson; decided: boolean }) {
	const s = styles();
	const meta =
		decided || !person.term
			? person.party
			: [person.party, person.term ? `Current term ${person.term}` : null, person.seatLabel].filter(Boolean).join(' · ');
	const body = (
		<>
			<div className={s.rowMain()}>
				<div className={s.avatarWrap()}>
					{person.avatar ? (
						<Avatar image={person.avatar} className='size-16' />
					) : (
						<span className={s.initials()} aria-hidden>
							{getInitials(person.name)}
						</span>
					)}
					{person.isPledged && (
						<span className={s.mark()} role='img' aria-label='Took the GoodParty.org Pledge'>
							<Logo width={28} height={21} />
						</span>
					)}
				</div>
				<div className={s.text()}>
					<div className={s.nameRow()}>
						<Text as='span' styleType='text-md' className={s.name()}>
							{person.name}
						</Text>
						{decided && person.isWinner && <span className={s.tag()}>Elected</span>}
					</div>
					{meta && (
						<Text as='span' styleType='text-sm' className={s.meta()}>
							{meta}
						</Text>
					)}
					{person.isPledged && (
						<Text as='span' styleType='text-sm' className={s.pledge()}>
							{ATTRIBUTION_COPY.pledged}
						</Text>
					)}
				</div>
				{person.href && <IconResolver icon='arrow-right' className={s.arrow()} aria-hidden />}
			</div>
			{person.href && (
				<span className={s.mobileCta()}>
					<Text as='span' styleType='text-sm' className='font-semibold'>
						View profile
					</Text>
					<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />
				</span>
			)}
		</>
	);
	return (
		<li>
			{person.href ? (
				<Link href={person.href} className={cn(s.card(), s.cardLinked())} data-testid='position-person-row'>
					{body}
				</Link>
			) : (
				<div className={s.card()} data-testid='position-person-row'>
					{body}
				</div>
			)}
		</li>
	);
}

/**
 * The seat filter and the two people lists on a position page. They live in
 * one client component because the filter narrows both lists at once.
 */
export function ElectionsPositionPeopleLists(props: ElectionsPositionPeopleListsProps) {
	const s = styles();
	const filterId = useId();
	const [seat, setSeat] = useState('');
	const [expanded, setExpanded] = useState(false);
	const initialCount = props.initialCount ?? DEFAULT_INITIAL_COUNT;

	const applyFilter = (people: ElectionsPositionPerson[]) => (seat ? people.filter(person => person.seatValue === seat) : people);

	const candidates = props.candidates && props.candidates.length > 0 ? applyFilter(props.candidates) : undefined;
	const officeholders = props.officeholders && props.officeholders.length > 0 ? applyFilter(props.officeholders) : undefined;
	const visibleCandidates = candidates && !expanded ? candidates.slice(0, initialCount) : candidates;
	const hasMore = candidates !== undefined && !expanded && candidates.length > initialCount;
	const showFilter = props.seatFilter !== undefined && props.seatFilter.options.length > 1;

	return (
		<>
			{showFilter && props.seatFilter && (
				<div className={s.filter()}>
					<label htmlFor={filterId} className='sr-only'>
						{props.seatFilter.label}
					</label>
					<select id={filterId} value={seat} onChange={event => setSeat(event.target.value)} className={cn(s.select(), 'text-text-md')}>
						<option value=''>{props.seatFilter.label}</option>
						{props.seatFilter.options.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<IconResolver icon='chevron-down' className={s.chevron()} aria-hidden />
				</div>
			)}
			{candidates && visibleCandidates && (
				<section
					id={props.candidatesId}
					className={s.section()}
					data-testid='position-candidates'
					aria-labelledby={`${props.candidatesId}-heading`}
				>
					<Text as='h2' id={`${props.candidatesId}-heading`} styleType='heading-sm' className={s.heading()}>
						{props.candidatesHeading}
					</Text>
					{visibleCandidates.length > 0 ? (
						<ul className={s.list()}>
							{visibleCandidates.map(person => (
								<PersonRow key={person.key} person={person} decided={props.decided} />
							))}
						</ul>
					) : (
						<Text styleType='body-2'>No results for this filter.</Text>
					)}
					{hasMore && (
						<div className={s.more()}>
							<Button
								parent='ElectionsPositionPeopleLists'
								styleType='outline'
								styleSize='md'
								className='border-transparent bg-white'
								onClick={() => setExpanded(true)}
								iconRight={<IconResolver icon='circle-chevron-down' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />}
							>
								{props.showMoreLabel}
							</Button>
						</div>
					)}
				</section>
			)}
			{officeholders && (
				<section
					id={props.officeholdersId}
					className={s.section()}
					data-testid='position-officeholders'
					aria-labelledby={`${props.officeholdersId}-heading`}
				>
					<Text as='h2' id={`${props.officeholdersId}-heading`} styleType='heading-sm' className={s.heading()}>
						{props.officeholdersHeading}
					</Text>
					{officeholders.length > 0 ? (
						<ul className={s.list()}>
							{officeholders.map(person => (
								<PersonRow key={person.key} person={person} decided={false} />
							))}
						</ul>
					) : (
						<Text styleType='body-2'>No results for this filter.</Text>
					)}
				</section>
			)}
		</>
	);
}
