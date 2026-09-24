/**
 * Which of the position hero's states a race is in. Settled with marketing on
 * 2026-09-23 (see docs/election-redesign-components.md): the state comes from
 * filing dates and results, never from an editor's choice, because tens of
 * thousands of position pages cannot be hand-switched as their elections move.
 *
 * - `filing`: from six months before the filing window opens until the filing
 *   deadline. `filingOpen` is false in the run-up, when the window has not
 *   opened yet.
 * - `midElection`: the deadline has passed and the general election is ahead.
 *   `resultsPending` covers the stretch after election day when no result has
 *   reached us yet: the layout stays, the countdown goes.
 * - `decided`: the election has passed and we know who won. More than six
 *   months before the next filing window opens, the previous cycle's result
 *   keeps the page here too.
 *
 * Dates arrive as ISO strings (date-only or full timestamps) and are compared
 * at day granularity in the server's local zone, the same way the rest of the
 * election pages format them.
 */

export const PRE_FILING_WINDOW_MONTHS = 6;

export type PositionHeroState =
	| { phase: 'filing'; filingOpen: boolean }
	| { phase: 'midElection'; resultsPending: boolean }
	| { phase: 'decided'; multipleWinners: boolean };

export type PositionHeroStateInput = {
	filingDateStart?: string | null;
	filingDateEnd?: string | null;
	/** The general election. A primary's own date must not be passed here. */
	electionDate?: string | null;
	/** Winners of this race. `undefined` means we hold no result data at all. */
	winnerCount?: number | null;
	/** Winners of the previous cycle for this seat, shown until the next window nears. */
	priorWinnerCount?: number | null;
	now?: Date;
};

export function toLocalDay(value: string | null | undefined): Date | null {
	if (!value) return null;
	const dateOnly = value.slice(0, 10);
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
	if (!match) return null;
	const day = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
	return Number.isNaN(day.getTime()) ? null : day;
}

export function startOfLocalDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const MS_PER_DAY = 86_400_000;

/** Whole days from today to `target`, negative once it has passed. */
export function daysUntil(target: string | null | undefined, now: Date = new Date()): number | null {
	const day = toLocalDay(target);
	if (!day) return null;
	return Math.round((day.getTime() - startOfLocalDay(now).getTime()) / MS_PER_DAY);
}

export function resolvePositionHeroState(input: PositionHeroStateInput): PositionHeroState {
	const today = startOfLocalDay(input.now ?? new Date());
	const election = toLocalDay(input.electionDate);
	const filingStart = toLocalDay(input.filingDateStart);
	const filingEnd = toLocalDay(input.filingDateEnd);

	if (election && today > election) {
		if (input.winnerCount && input.winnerCount > 0) {
			return { phase: 'decided', multipleWinners: input.winnerCount > 1 };
		}
		return { phase: 'midElection', resultsPending: true };
	}

	if (filingStart) {
		const year = filingStart.getFullYear();
		const month = filingStart.getMonth() - PRE_FILING_WINDOW_MONTHS;
		// Day 0 of the following month is the last day of the target month, so an
		// Aug 31 start clamps to Feb 28 instead of overflowing into March.
		const lastDay = new Date(year, month + 1, 0).getDate();
		const windowOpens = new Date(year, month, Math.min(filingStart.getDate(), lastDay));
		if (today < windowOpens && input.priorWinnerCount && input.priorWinnerCount > 0) {
			return { phase: 'decided', multipleWinners: input.priorWinnerCount > 1 };
		}
	}

	if (filingEnd && today <= filingEnd) {
		return { phase: 'filing', filingOpen: !filingStart || today >= filingStart };
	}

	if (!filingEnd && filingStart && today < filingStart) {
		return { phase: 'filing', filingOpen: false };
	}

	return { phase: 'midElection', resultsPending: false };
}
