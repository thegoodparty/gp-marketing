import type { SVGProps } from 'react';
import Link from 'next/link';
import type { PartyClass } from '~/lib/party';
import { daysUntil, startOfLocalDay, toLocalDay, type PositionHeroState } from '~/lib/positionHeroState';
import { Logo } from '~/sanity/utils/Logo.tsx';
import { cn, tv } from './_lib/utils.ts';
import { Avatar } from './Avatar.tsx';
import { Container } from './Container.tsx';
import { ComponentButton } from './Inputs/Button.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'py-16',
		layout: 'flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10',
		intro: 'flex flex-col gap-2 lg:max-w-[33rem]',
		cards: 'grid gap-4 md:grid-cols-2 lg:shrink-0 lg:grid-cols-[19.25rem_19.25rem]',
		card: 'flex min-h-[19.375rem] flex-col gap-4 rounded-lg border border-midnight-600 bg-midnight-800 p-6 text-white',
		cardCompact: 'min-h-0 gap-6',
		cardLabel: 'text-midnight-300',
		countdown: 'flex flex-wrap gap-4',
		countdownBox: 'flex h-[3.875rem] w-[4.1875rem] items-center justify-center rounded-md border border-midnight-600 bg-midnight-900',
		rows: 'flex flex-col gap-3',
		row: 'flex items-center gap-1.5',
		rowMark: 'flex w-[1.625rem] shrink-0 items-center justify-center',
		dot: 'size-2 rounded-full',
		party: 'ml-auto shrink-0 text-midnight-300',
		track: 'relative mx-1.5 h-1.5 rounded-full bg-midnight-900',
		trackFill: 'absolute inset-y-0 left-0 rounded-full bg-goodparty-blue',
		trackPoint: 'absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2',
		trackMarker: 'absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-goodparty-blue',
		trackLabels: 'relative h-9 text-midnight-200',
		button: 'mt-auto w-full',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900 text-white',
			},
			cream: {
				base: 'bg-goodparty-cream text-midnight-900',
			},
		},
	},
});

export type ElectionsPositionHeroCandidate = {
	key?: string;
	name: string;
	party: string;
	partyClass: PartyClass | null;
	/** Took the GoodParty.org Pledge, by the same rule the candidate cards use. */
	isPledged?: boolean;
	href?: string;
	isWinner?: boolean;
	avatar?: string;
};

export type ElectionsPositionHeroWinner = {
	key?: string;
	name: string;
	party?: string;
	avatar?: string;
	/** Rendered after "Current term", e.g. "2027 to 2031". */
	term?: string;
	/** The office or seat the winner takes, e.g. "City Council, Seat 2". */
	seatLabel?: string;
	isPledged?: boolean;
	href?: string;
};

export type ElectionsPositionHeroProps = {
	className?: string;
	backgroundColor?: 'cream' | 'midnight';
	officeName: string;
	stateName: string;
	countyName?: string;
	cityName?: string;
	/** The sentence under the location; the section wrapper picks it per state. */
	intro?: string;
	state: PositionHeroState;
	/** ISO dates. The election date is the general election. */
	electionDate?: string | null;
	filingDateStart?: string | null;
	filingDateEnd?: string | null;
	/**
	 * Everyone on the ballot. `undefined` means we hold no candidate data for
	 * this race and the ballot card is not shown; an empty list is a real zero.
	 */
	candidates?: ElectionsPositionHeroCandidate[];
	/** Who won. Empty or missing until results reach us. */
	winners?: ElectionsPositionHeroWinner[];
	/** Seats up in this race, from BallotReady. Labels the multi-winner button. */
	seatCount?: number | null;
	candidatesHref?: string;
	resultsHref?: string;
	/** Injected by stories and tests so the countdowns are deterministic. */
	now?: Date;
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };

function formatDay(value: string | null | undefined): string | null {
	const day = toLocalDay(value);
	return day ? day.toLocaleDateString('en-US', DATE_FORMAT) : null;
}

function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase() ?? '')
		.join('');
}

function ArrowDownIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg width={16} height={16} viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden {...props}>
			<path d='M8 3v10m0 0 4-4m-4 4-4-4' stroke='currentColor' strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg width={20} height={20} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' aria-label='Winner' role='img' {...props}>
			<path d='m4 10.5 4 4 8-9' stroke='currentColor' strokeWidth={1.75} strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
}

function PartyMark({ candidate, className }: { candidate: ElectionsPositionHeroCandidate; className: string }) {
	if (candidate.isPledged) {
		return <Logo width={27} height={20} aria-label='Took the GoodParty.org Pledge' role='img' />;
	}
	const color =
		candidate.partyClass === 'democrat' ? 'bg-goodparty-blue' : candidate.partyClass === 'republican' ? 'bg-goodparty-red' : 'bg-midnight-300';
	return <span className={cn(className, color)} aria-hidden />;
}

function CardButton({ href, label, className }: { href?: string; label: string; className: string }) {
	if (!href) return null;
	return (
		<div className={className}>
			<ComponentButton
				buttonType={href.startsWith('#') ? 'anchor' : 'internal'}
				href={href}
				label={label}
				iconRight={<ArrowDownIcon />}
				className='w-full'
				buttonProps={{ styleType: 'outline-inverse', styleSize: 'md' }}
			/>
		</div>
	);
}

export function ElectionsPositionHero(props: ElectionsPositionHeroProps) {
	const backgroundColor = props.backgroundColor ?? 'midnight';
	const s = styles({ backgroundColor });
	const now = props.now ?? new Date();
	const { state } = props;

	const location = [props.cityName, props.countyName, props.stateName].filter(Boolean).join(', ');

	const electionDay = formatDay(props.electionDate);
	const filingOpens = formatDay(props.filingDateStart);
	const filingDeadline = formatDay(props.filingDateEnd);
	const daysToElection = daysUntil(props.electionDate, now);
	const daysToFile = daysUntil(state.phase === 'filing' && !state.filingOpen ? props.filingDateStart : props.filingDateEnd, now);

	const candidates = props.candidates;
	const winners = props.winners ?? [];
	const showBallotCard = candidates !== undefined && !(state.phase === 'midElection' && state.resultsPending);

	const renderCountdown = (value: number | null, label: string) =>
		value === null || value < 0 ? null : (
			<div className='flex flex-col gap-1'>
				<div className={s.countdownBox()}>
					<Text as='span' styleType='text-3xl' className='font-medium'>
						{value}
					</Text>
				</div>
				<Text as='span' styleType='text-md'>
					{label}
				</Text>
			</div>
		);

	const renderDate = (label: string, value: string | null) =>
		value === null ? null : (
			<div>
				<Text as='dt' styleType='overline' className={s.cardLabel()}>
					{label}
				</Text>
				<Text as='dd' styleType='body-1'>
					{value}
				</Text>
			</div>
		);

	// The three anchors sit at fixed thirds rather than at their real dates, so
	// the labels stay legible however late in the cycle a filing window closes.
	// Progress is interpolated within each leg, so "today" still moves honestly.
	const renderTimeline = () => {
		const start = toLocalDay(props.filingDateStart);
		const deadline = toLocalDay(props.filingDateEnd);
		const end = toLocalDay(props.electionDate);
		const legs = [start, deadline, end].filter((day): day is Date => day !== null);
		const ordered = legs.every((day, i) => i === 0 || day > (legs[i - 1] ?? new Date(0)));
		if (!end || legs.length < 2 || !ordered) return null;
		const pending = state.phase === 'midElection' && state.resultsPending;
		const today = startOfLocalDay(now).getTime();
		const anchorAt = (index: number) => index / (legs.length - 1);
		const progress = (() => {
			if (pending || today >= end.getTime()) return 1;
			for (let i = 0; i < legs.length - 1; i++) {
				const from = legs[i]?.getTime();
				const to = legs[i + 1]?.getTime();
				if (from === undefined || to === undefined) continue;
				if (today <= to) return today <= from ? anchorAt(i) : anchorAt(i) + ((today - from) / (to - from)) * (anchorAt(i + 1) - anchorAt(i));
			}
			return 1;
		})();
		const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
		const labels = [start ? 'Filing opens' : null, deadline ? 'Filing deadline' : null, 'Election day'].filter((label): label is string => label !== null);
		return (
			<div className='mt-auto flex flex-col gap-2.5' data-testid='position-hero-timeline'>
				<div className={s.track()}>
					<div className={s.trackFill()} style={{ width: pct(progress) }} />
					{legs.map((day, index) => (
						<span
							key={day.toISOString()}
							className={cn(
								s.trackPoint(),
								progress >= anchorAt(index) ? 'border-goodparty-blue bg-goodparty-blue' : 'border-midnight-600 bg-midnight-900',
							)}
							style={{ left: pct(anchorAt(index)) }}
							aria-hidden
						/>
					))}
					{progress < 1 && <span className={s.trackMarker()} style={{ left: pct(progress) }} aria-hidden />}
				</div>
				<div className={s.trackLabels()}>
					{labels.map((label, index) => (
						<Text
							key={label}
							as='span'
							styleType='caption'
							className={cn(
								'absolute top-0 w-16',
								index === 0 ? 'left-0 text-left' : index === labels.length - 1 ? 'right-0 text-right' : '-translate-x-1/2 text-center',
							)}
							style={index === 0 || index === labels.length - 1 ? undefined : { left: pct(anchorAt(index)) }}
						>
							{label}
						</Text>
					))}
				</div>
			</div>
		);
	};

	const renderTimingCard = () => {
		if (state.phase === 'decided') {
			const winner = winners[0];
			if (!winner) return null;
			const others = winners.slice(1);
			const metaLine = [winner.party, winner.term ? `Current term ${winner.term}` : null].filter(Boolean).join(' · ');
			const large = !state.multipleWinners;
			return (
				<div className={s.card()} data-testid='position-hero-winner-card'>
					<Text as='h2' styleType='overline' className={s.cardLabel()}>
						Race winner
					</Text>
					<div className='relative w-fit'>
						{winner.avatar ? (
							<Avatar image={winner.avatar} className={large ? 'size-24' : 'size-[4.5rem]'} />
						) : (
							<div
								className={cn(
									'flex items-center justify-center rounded-full bg-midnight-600 font-semibold text-white',
									large ? 'size-24 text-2xl' : 'size-[4.5rem] text-xl',
								)}
							>
								{initials(winner.name)}
							</div>
						)}
						{winner.isPledged && (
							<span className='absolute -bottom-1 -right-2' aria-label='Took the GoodParty.org Pledge' role='img'>
								<Logo width={large ? 43 : 32} height={large ? 32 : 24} />
							</span>
						)}
					</div>
					<div className='flex flex-col gap-0.5'>
						<Text as='h3' styleType='subtitle-1'>
							{winner.href ? (
								<Link href={winner.href} className='hover:underline'>
									{winner.name}
								</Link>
							) : (
								winner.name
							)}
						</Text>
						{metaLine && <Text styleType='text-sm'>{metaLine}</Text>}
						{winner.seatLabel && <Text styleType='text-sm'>{winner.seatLabel}</Text>}
						{winner.isPledged && (
							<Text styleType='text-sm' className='text-neutral-400'>
								Has taken the GoodParty.org Pledge
							</Text>
						)}
					</div>
					{others.length > 0 && (
						<div className='mt-auto flex items-center gap-2'>
							<div className='flex'>
								{others.slice(0, 3).map((other, index) => (
									<span key={other.key ?? other.name} className={cn('rounded-full ring-1 ring-white', index > 0 && '-ml-1')}>
										{other.avatar ? (
											<Avatar image={other.avatar} className='size-6' />
										) : (
											<span className='flex size-6 items-center justify-center rounded-full bg-midnight-600 text-[0.5rem] font-semibold'>
												{initials(other.name)}
											</span>
										)}
									</span>
								))}
							</div>
							<Text as='span' styleType='caption'>
								+{others.length} other {others.length === 1 ? 'winner' : 'winners'}
							</Text>
						</div>
					)}
				</div>
			);
		}

		if (state.phase === 'filing') {
			return (
				<div className={s.card()} data-testid='position-hero-dates-card'>
					<dl className='flex flex-col gap-4'>
						{state.filingOpen ? renderDate('Filing deadline', filingDeadline) : renderDate('Filing opens', filingOpens)}
						{renderDate('Election date', electionDay)}
					</dl>
					<div className={cn(s.countdown(), 'mt-auto')}>
						{renderCountdown(daysToFile, state.filingOpen ? 'Days to file' : 'Days until filing opens')}
						{renderCountdown(daysToElection, 'Days until election')}
					</div>
				</div>
			);
		}

		return (
			<div className={cn(s.card(), state.resultsPending && s.cardCompact())} data-testid='position-hero-election-card'>
				<dl>{renderDate('Election date', electionDay)}</dl>
				{!state.resultsPending && <div className={s.countdown()}>{renderCountdown(daysToElection, 'Days until election')}</div>}
				{renderTimeline()}
			</div>
		);
	};

	const renderBallotCard = () => {
		if (!showBallotCard || candidates === undefined) return null;
		const decided = state.phase === 'decided';
		const count = candidates.length;
		const winnerCount = winners.length;
		const buttonLabel = decided
			? state.multipleWinners
				? `View all ${props.seatCount ?? winnerCount} winners`
				: 'View full results'
			: 'View all candidates';
		return (
			<div className={s.card()} data-testid='position-hero-ballot-card'>
				<Text as='h2' styleType='overline' className={s.cardLabel()}>
					{decided ? 'Final results' : 'On the ballot'}
				</Text>
				<Text styleType='body-1'>
					<strong>{count}</strong> {count === 1 ? 'candidate' : 'candidates'} {decided ? 'ran' : 'filed so far'}
				</Text>
				{count > 0 && (
					<ul className={s.rows()}>
						{candidates.slice(0, 4).map(candidate => (
							<li key={candidate.key ?? candidate.name} className={s.row()}>
								<span className={s.rowMark()}>
									<PartyMark candidate={candidate} className={s.dot()} />
								</span>
								<Text as='span' styleType='text-sm' className='flex min-w-0 items-center gap-1.5'>
									{candidate.href ? (
										<Link href={candidate.href} className='truncate hover:underline'>
											{candidate.name}
										</Link>
									) : (
										<span className='truncate'>{candidate.name}</span>
									)}
									{decided && candidate.isWinner && <CheckIcon className='shrink-0 text-halo-green-400' />}
								</Text>
								<Text as='span' styleType='text-sm' className={s.party()}>
									{candidate.party}
								</Text>
							</li>
						))}
					</ul>
				)}
				<CardButton href={decided ? (props.resultsHref ?? props.candidatesHref) : props.candidatesHref} label={buttonLabel} className={s.button()} />
			</div>
		);
	};

	return (
		<section className={cn(s.base(), props.className)} data-component='ElectionsPositionHero' data-phase={state.phase}>
			<Container size='xl'>
				<div className={s.layout()}>
					<div className={s.intro()}>
						<Text as='h1' styleType='heading-xl'>
							{props.officeName}
						</Text>
						{location && (
							<Text as='p' styleType='text-3xl'>
								{location}
							</Text>
						)}
						{props.intro && <Text styleType='body-1'>{props.intro}</Text>}
					</div>
					<div className={s.cards()}>
						{renderTimingCard()}
						{renderBallotCard()}
					</div>
				</div>
			</Container>
		</section>
	);
}
