'use client';

import { type ReactNode, useId, useState } from 'react';
import Link from 'next/link';

import { Logo } from '~/sanity/utils/Logo.tsx';
import { getInitials } from '~/utils/getInitials';
import { ATTRIBUTION_COPY } from './_lib/attributionCopy.ts';
import { cn, tv } from './_lib/utils.ts';
import { Avatar } from './Avatar.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Button } from './Inputs/Button.tsx';
import { PledgeModal } from './PledgeModal.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		section: 'flex flex-col gap-4',
		// Figma: the heading and the seat filter share a row on desktop; on the phone the
		// filter drops below the intro sentence at full width.
		header: 'grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-x-4 md:gap-y-4',
		heading: 'text-midnight-900 max-md:text-heading-md md:col-start-1 md:row-start-1',
		intro: 'text-midnight-900 md:col-span-2 md:row-start-2',
		filter: 'relative max-md:order-last max-md:mt-1 md:col-start-2 md:row-start-1 md:w-fit md:max-w-full',
		select: [
			'h-10 w-full max-w-full appearance-none rounded-full border border-midnight-900 bg-white py-2.5 pl-6 pr-12 font-secondary font-semibold text-midnight-900 max-md:text-center',
			'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-goodparty-blue',
		],
		chevron: 'pointer-events-none absolute right-6 top-1/2 size-4 -translate-y-1/2 text-midnight-900',
		// Figma: midnight/50 fill, midnight/200 hairline, 12px radius. From md the heart
		// gets a 112px column with a divider; on the phone it stacks on top.
		explainer: 'flex flex-col gap-3 rounded-md border border-midnight-200 bg-midnight-50 p-4 text-black md:flex-row md:gap-0 md:p-0',
		explainerIconCell: 'flex shrink-0 items-start md:w-28 md:items-center md:justify-center md:border-r md:border-midnight-200',
		explainerIcon: 'h-12 w-14 shrink-0 md:h-[3.25rem] md:w-16',
		explainerBody: 'flex min-w-0 flex-col gap-1 md:px-6 md:py-4',
		// Figma: Outfit 20/28 on the phone and 18/28 on desktop; Open Sans 16/24 and 14/20.
		explainerTitle: 'font-primary text-[1.25rem]/[1.75rem] font-semibold text-black md:text-[1.125rem]/[1.75rem]',
		explainerText: 'font-secondary text-[1rem]/[1.5rem] text-black md:text-[0.875rem]/[1.25rem] md:[&_p]:inline',
		explainerLink: 'flex w-fit items-center gap-1 font-secondary font-semibold text-info-500 underline max-md:mt-1 md:ml-1 md:inline-flex',
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
		nameRow: 'flex flex-wrap items-center gap-2 max-lg:justify-between',
		name: 'font-secondary font-semibold',
		// Figma "Tagline": a white 28px chip with a 6px radius and a neutral hairline, 14px on desktop and 12px on the phone.
		seat: 'inline-flex h-7 items-center rounded-[6px] border border-neutral-300 bg-white px-2.5 font-secondary text-[0.875rem] font-medium leading-5 text-midnight-900 max-md:text-[0.75rem] max-md:leading-4',
		tag: 'inline-flex items-center rounded-sm bg-bright-yellow-100 px-2 py-1 font-primary text-[0.75rem] font-semibold uppercase leading-4 tracking-[1px] text-bright-yellow-900',
		meta: 'font-secondary text-midnight-900',
		pledge: 'font-secondary text-neutral-500',
		arrow: 'hidden size-6 shrink-0 text-midnight-900 lg:block',
		mobileCta:
			'flex h-8 w-full items-center justify-center gap-2 rounded-full border border-midnight-900 px-4 font-secondary text-midnight-900 lg:hidden',
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
	/** The seat held or sought, drawn as a chip next to the name, e.g. "District 3". */
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

export type ElectionsPositionPledgeExplainer = {
	title: string;
	body: ReactNode;
	/** The link at the end of the copy that opens the pledge pop-up. Nothing here means no link. */
	linkLabel?: string;
};

export type ElectionsPositionPeopleListsProps = {
	candidates?: ElectionsPositionPerson[];
	officeholders?: ElectionsPositionPerson[];
	seatFilter?: ElectionsPositionSeatFilter;
	candidatesHeading: string;
	candidatesIntro?: string;
	officeholdersHeading: string;
	officeholdersIntro?: string;
	/** Drawn at the top of each list, because it explains the mark on the rows below it. */
	explainer?: ElectionsPositionPledgeExplainer;
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
	const meta = decided || !person.term ? person.party : [person.party, `Current term ${person.term}`].filter(Boolean).join(' · ');
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
						{person.seatLabel && (
							<span className={s.seat()} data-testid='position-person-seat'>
								{person.seatLabel}
							</span>
						)}
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

/** The heart and star explainer, in the shape the featured candidates block settled on. */
function PledgeExplainer({ explainer }: { explainer: ElectionsPositionPledgeExplainer }) {
	const s = styles();
	return (
		<div className={s.explainer()} data-testid='position-pledge-explainer'>
			<div className={s.explainerIconCell()}>
				<Logo className={s.explainerIcon()} aria-hidden='true' />
			</div>
			<div className={s.explainerBody()}>
				<h3 className={s.explainerTitle()}>{explainer.title}</h3>
				<div className={s.explainerText()}>
					{explainer.body}
					{explainer.linkLabel && (
						<PledgeModal>
							<button type='button' className={s.explainerLink()}>
								{explainer.linkLabel}
								<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />
							</button>
						</PledgeModal>
					)}
				</div>
			</div>
		</div>
	);
}

/**
 * The seat filter and the two people lists on a position page. They live in
 * one client component because the filter narrows both lists at once. The
 * filter sits in the heading row of the first list that renders.
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

	const filter =
		showFilter && props.seatFilter ? (
			<div className={s.filter()}>
				<label htmlFor={filterId} className='sr-only'>
					{props.seatFilter.label}
				</label>
				<select
					id={filterId}
					value={seat}
					onChange={event => {
						setSeat(event.target.value);
						setExpanded(false);
					}}
					className={cn(s.select(), 'text-text-md')}
				>
					<option value=''>{props.seatFilter.label}</option>
					{props.seatFilter.options.map(option => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<IconResolver icon='chevron-down' className={s.chevron()} aria-hidden />
			</div>
		) : null;

	return (
		<>
			{candidates && visibleCandidates && (
				<section
					id={props.candidatesId}
					className={s.section()}
					data-testid='position-candidates'
					aria-labelledby={`${props.candidatesId}-heading`}
				>
					<div className={s.header()}>
						<Text as='h2' id={`${props.candidatesId}-heading`} styleType='heading-sm' className={s.heading()}>
							{props.candidatesHeading}
						</Text>
						{filter}
						{props.candidatesIntro && (
							<Text as='p' styleType='body-2' className={s.intro()}>
								{props.candidatesIntro}
							</Text>
						)}
					</div>
					{props.explainer && <PledgeExplainer explainer={props.explainer} />}
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
								className='border-transparent bg-white max-md:w-full'
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
					<div className={s.header()}>
						<Text as='h2' id={`${props.officeholdersId}-heading`} styleType='heading-sm' className={s.heading()}>
							{props.officeholdersHeading}
						</Text>
						{!candidates && filter}
						{props.officeholdersIntro && (
							<Text as='p' styleType='body-2' className={s.intro()}>
								{props.officeholdersIntro}
							</Text>
						)}
					</div>
					{props.explainer && <PledgeExplainer explainer={props.explainer} />}
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
