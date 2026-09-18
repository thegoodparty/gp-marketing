'use client';

import { useState, useMemo, useEffect } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { secondaryButtonStyleType } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { Anchor } from './Anchor.tsx';
import { IconResolver } from './IconResolver.tsx';
import { ArrowRightIcon } from './icons/ArrowRightIcon.tsx';
import { Button } from './Inputs/Button.tsx';
import { DEFAULT_YEAR_OFFSET } from '~/constants/display';
import { formatElectionDateFromApi, getYearFromDateString, resolveDefaultElectionYear } from '~/lib/electionsHelpers';

/**
 * Text colour is set once on `base` and inherited, and never written as a
 * `text-<colour>` next to a `text-<size>` in the same slot.
 *
 * tailwind-merge (inside `tv`) cannot tell this design system's font-size names
 * from colour names, so it reads `text-subtitle-1 text-black` as two colours and
 * keeps only the last — silently dropping the size. That is how the whole block
 * came to render at 16px while looking deliberate: heading 32px because it was
 * the one slot with no colour beside it, everything else collapsed. The few
 * colours that must differ from the inherited one use the arbitrary-property
 * form, which sits in its own group and cannot collide with a size.
 */
const styles = tv({
	slots: {
		base: 'py-(--container-padding) bg-goodparty-cream text-black',
		wrapper: 'flex flex-col gap-8',
		headerRow: 'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
		heading: 'font-primary text-section-heading',
		filters: 'flex items-end gap-6',
		filter: 'flex flex-col gap-1',
		filterLabel: 'font-secondary text-text-875',
		selectShell: 'relative',
		select: [
			'h-10 w-[6.6875rem] appearance-none rounded-full border border-black/15 bg-white pl-4 pr-9',
			'cursor-pointer font-secondary text-text-875',
			'focus:border-goodparty-blue focus:outline-none focus:ring-2 focus:ring-goodparty-blue/30',
		],
		selectIcon: 'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2',
		list: 'flex flex-col gap-4',
		// Mirrors the row grid so the labels sit over their own columns.
		listHeader: 'hidden md:grid md:grid-cols-[7.6875rem_1fr_auto_2.5rem] md:items-center md:gap-x-4 md:px-3.5',
		listHeaderCell: 'font-secondary text-text-875 font-semibold',
		headerDateCell: 'text-right',
		row: [
			'group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-lg border border-black/10 bg-white p-3',
			'transition-colors hover:border-goodparty-blue',
			'md:h-15 md:grid-cols-[7.6875rem_1fr_auto_2.5rem] md:gap-y-0 md:px-3.5 md:py-0',
		],
		tagCell: 'col-span-2 md:col-span-1 md:col-start-1 md:row-start-1',
		// The tag is white on navy in both variants, so it sets its own colour.
		tag: 'inline-block w-fit rounded-sm bg-blue-900 px-2 py-1 font-primary text-caption font-medium tracking-[0.0625rem] [color:white] uppercase',
		positionCell: 'col-span-2 font-primary text-row-title md:col-span-1 md:col-start-2 md:row-start-1',
		dateCell: 'font-secondary text-row-meta md:col-start-3 md:row-start-1 md:text-right',
		arrowCell: 'justify-self-end md:col-start-4 md:row-start-1',
		empty: 'py-8 text-center font-secondary text-body-2 [color:var(--color-neutral-500)]',
		showMoreWrapper: 'flex justify-center pt-2',
	},
	variants: {
		backgroundColor: {
			// Everything that is plain white on midnight inherits it from `base`.
			midnight: {
				base: 'bg-midnight-900 text-white',
				select: 'border-white/20 bg-midnight-800 focus:border-lavender-400',
				row: 'border-white/10 bg-midnight-800 hover:border-lavender-400',
				dateCell: '[color:var(--color-neutral-300)]',
				empty: '[color:var(--color-neutral-300)]',
			},
			cream: {},
		},
	},
});

/** Which Level view an office belongs to. */
export type OfficeLevel = 'local' | 'county' | 'state';

export interface OfficeItem {
	id: string;
	type: string;
	position: string;
	nextElectionDate: string;
	href?: string;
	/**
	 * Which Level view this office appears under. Offices without one are treated
	 * as belonging to the page's own level, which is every office on a page whose
	 * route does not yet supply the overlapping levels.
	 */
	level?: OfficeLevel;
}

const LEVEL_LABELS: Record<OfficeLevel, string> = {
	local: 'Local',
	county: 'County',
	state: 'State',
};

/**
 * The levels a page can show, in menu order. A voter in a city also votes in
 * that city's county and state races, so a city page can look *up*; the reverse
 * is not a ballot relationship (and a state's every municipal race is far too
 * many rows), so nothing looks down. See docs/election-redesign-components.md.
 */
const LEVELS_BY_PAGE: Record<OfficeLevel, OfficeLevel[]> = {
	local: ['local', 'county', 'state'],
	county: ['county', 'state'],
	state: ['state'],
};

export interface ListOfOfficesBlockProps {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	/** The section heading, e.g. "Local elections in Austin". */
	heading?: string;
	defaultYear?: number;
	availableYears?: number[];
	pageSize?: number;
	offices: OfficeItem[];
	/**
	 * The level the page itself represents. Sets the Level dropdown's default and
	 * which levels it offers. A state page offers only its own, so it gets no
	 * dropdown at all rather than one with a single choice.
	 */
	pageLevel?: OfficeLevel;
	/** When true and there are no offices, show "Loading…" instead of "No offices found". */
	isLoading?: boolean;
	/** When set, filter offices by position name (case-insensitive substring). */
	searchQuery?: string;
	onYearChange?(year: number): void;
	onLevelChange?(level: OfficeLevel): void;
	onOfficeClick?(office: OfficeItem): void;
}

export function ListOfOfficesBlock(props: ListOfOfficesBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const defaultYear = props.defaultYear ?? new Date().getFullYear() + DEFAULT_YEAR_OFFSET;
	const availableYears = props.availableYears ?? [defaultYear];
	const pageSize = props.pageSize ?? 10;
	const pageLevel = props.pageLevel ?? 'state';

	const [selectedYear, setSelectedYear] = useState(defaultYear);
	const [selectedLevel, setSelectedLevel] = useState<OfficeLevel>(pageLevel);
	const [visibleCount, setVisibleCount] = useState(pageSize);

	const {
		base,
		wrapper,
		headerRow,
		heading: headingStyle,
		filters,
		filter,
		filterLabel,
		selectShell,
		select,
		selectIcon,
		list,
		listHeader,
		listHeaderCell,
		headerDateCell,
		row,
		tagCell,
		tag,
		positionCell,
		dateCell,
		arrowCell,
		empty,
		showMoreWrapper,
	} = styles({ backgroundColor });

	/**
	 * Only offer a level the page actually has offices for. A city whose county
	 * has no races should not get a County option that leads to an empty list.
	 */
	const levelOptions = useMemo(() => {
		const present = new Set(props.offices.map(office => office.level ?? pageLevel));
		return LEVELS_BY_PAGE[pageLevel].filter(level => level === pageLevel || present.has(level));
	}, [props.offices, pageLevel]);

	const filteredOffices = useMemo(() => {
		let matches = props.offices.filter(office => {
			if ((office.level ?? pageLevel) !== selectedLevel) return false;
			const dateYear = getYearFromDateString(office.nextElectionDate);
			return !Number.isNaN(dateYear) && dateYear === selectedYear;
		});
		const q = props.searchQuery?.trim();
		if (q) {
			const lower = q.toLowerCase();
			matches = matches.filter(office => office.position.toLowerCase().includes(lower));
		}
		return matches;
	}, [props.offices, pageLevel, selectedYear, selectedLevel, props.searchQuery]);

	/**
	 * Every office stays in the markup and the ones outside the current view are
	 * hidden, rather than being left out of it. A crawler only follows links that
	 * are in the HTML, and filtering the array meant a location page linked just
	 * the first page of the default year: 5 of Harris County's 20 positions,
	 * 3 of Texas's 15. The rows the filters exclude carry no visible weight.
	 */
	const visibleIds = useMemo(
		() => new Set(filteredOffices.slice(0, visibleCount).map(office => office.id)),
		[filteredOffices, visibleCount],
	);
	const hasMore = visibleCount < filteredOffices.length;

	useEffect(() => {
		setVisibleCount(pageSize);
	}, [pageSize]);

	const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const year = parseInt(e.target.value, 10);
		setSelectedYear(year);
		setVisibleCount(pageSize);
		props.onYearChange?.(year);
	};

	/**
	 * Switching level moves the year too when the current one has nothing at that
	 * level. Levels genuinely run on different cycles — municipal races are often
	 * odd-year where county and state races are even-year — so holding the year
	 * would drop a visitor on "No offices found" for most of the switches they
	 * make, with the races they asked for sitting one year away.
	 */
	const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const level = e.target.value as OfficeLevel;
		setSelectedLevel(level);
		setVisibleCount(pageSize);

		const yearsAtLevel = [
			...new Set(
				props.offices
					.filter(office => (office.level ?? pageLevel) === level)
					.map(office => getYearFromDateString(office.nextElectionDate))
					.filter(year => !Number.isNaN(year)),
			),
		];
		if (yearsAtLevel.length > 0 && !yearsAtLevel.includes(selectedYear)) {
			const nextYear = resolveDefaultElectionYear(yearsAtLevel);
			setSelectedYear(nextYear);
			props.onYearChange?.(nextYear);
		}

		props.onLevelChange?.(level);
	};

	return (
		<article className={cn(base(), props.className)} data-component='ListOfOfficesBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					<div className={headerRow()}>
						{props.heading && (
							<Text as='h2' styleType='section-heading' className={headingStyle()}>
								{props.heading}
							</Text>
						)}
						<div className={filters()}>
							{levelOptions.length > 1 && (
								<div className={filter()}>
									<Text as='label' styleType='text-875' className={filterLabel()} htmlFor='offices-level-select'>
										Level
									</Text>
									<div className={selectShell()}>
										<select
											id='offices-level-select'
											className={select()}
											value={selectedLevel}
											onChange={handleLevelChange}
											aria-label='Filter offices by level of government'
										>
											{levelOptions.map(level => (
												<option key={level} value={level}>
													{LEVEL_LABELS[level]}
												</option>
											))}
										</select>
										<IconResolver icon='chevron-down' className={selectIcon()} />
									</div>
								</div>
							)}
							<div className={filter()}>
								<Text as='label' styleType='text-875' className={filterLabel()} htmlFor='offices-year-select'>
									Year
								</Text>
								<div className={selectShell()}>
									<select
										id='offices-year-select'
										className={select()}
										value={selectedYear}
										onChange={handleYearChange}
										aria-label='Filter offices by election year'
									>
										{availableYears.map(year => (
											<option key={year} value={year}>
												{year}
											</option>
										))}
									</select>
									<IconResolver icon='chevron-down' className={selectIcon()} />
								</div>
							</div>
						</div>
					</div>

					{filteredOffices.length === 0 && (
						<Text styleType='body-2' className={empty()}>
							{props.searchQuery?.trim()
								? 'No positions match your search'
								: props.isLoading
									? 'Loading…'
									: `No offices found for ${selectedYear}`}
						</Text>
					)}

					<div className={list()}>
						{filteredOffices.length > 0 && (
							<div className={listHeader()}>
								<div className={listHeaderCell()}>Type</div>
								<div className={listHeaderCell()}>Position</div>
								<div className={cn(listHeaderCell(), headerDateCell())}>Election date</div>
								<div aria-hidden='true' />
							</div>
						)}

						{props.offices.map(office => {
							const RowContent = (
								<>
									<div className={tagCell()}>
										<span className={tag()}>{office.type}</span>
									</div>
									<div className={positionCell()}>{office.position}</div>
									<div className={dateCell()}>{formatElectionDateFromApi(office.nextElectionDate)}</div>
									<div className={arrowCell()}>
										{office.href && (
											<ArrowRightIcon size={24} innerClassName='group-hover:animate-slide-in-right' />
										)}
									</div>
								</>
							);

							// The wrapper carries the hidden attribute because it has no display
							// class of its own; putting it on the row itself loses to `grid`.
							return (
								<div key={office.id} hidden={!visibleIds.has(office.id)}>
									{office.href ? (
										<Anchor href={office.href} className={cn(row(), 'cursor-pointer')} onClick={() => props.onOfficeClick?.(office)}>
											{RowContent}
										</Anchor>
									) : (
										<div className={row()}>{RowContent}</div>
									)}
								</div>
							);
						})}
					</div>

					{hasMore && (
						<div className={showMoreWrapper()}>
							<Button
								parent='ListOfOfficesBlock'
								styleType={secondaryButtonStyleType}
								onClick={() => setVisibleCount(prev => prev + pageSize)}
							>
								Show More
							</Button>
						</div>
					)}
				</div>
			</Container>
		</article>
	);
}
