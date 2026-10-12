/**
 * Which of the position page's phases a race is in. Settled with marketing on
 * 2026-09-23 and revised on 2026-10-12 (see docs/election-redesign-components.md):
 * the phase comes from filing dates and results, never from an editor's choice,
 * because tens of thousands of position pages cannot be hand-switched as their
 * elections move.
 *
 * - `preFiling`: from far out until the filing window opens. Entered when the
 *   opening date is known and ahead; with no opening date, more than
 *   `FALLBACK_PRE_FILING_MONTHS` before the deadline (or before the election
 *   when there is no deadline either); and after an election that is more than
 *   `RESULTS_PENDING_MONTHS` behind with no result on record, which is how a
 *   race whose next cycle has not been loaded yet reads. This phase never
 *   depends on a winner count.
 * - `filing`: from the opening date until the deadline. With no opening date,
 *   from `FALLBACK_PRE_FILING_MONTHS` before the deadline.
 * - `midElection`: the deadline has passed and the general election is ahead.
 *   `resultsPending` covers the stretch after election day when no result has
 *   reached us yet: the layout stays, the countdown goes.
 * - `decided`: the election has passed and we know who won.
 *
 * With no dates at all the page reads as mid-election with no countdown: the
 * plain heading and no guess at a phase.
 *
 * Dates arrive as ISO strings (date-only or full timestamps) and are compared
 * at day granularity in the server's local zone, the same way the rest of the
 * election pages format them.
 */

/**
 * With no opening date on record, filing is treated as open from this many
 * months before the deadline (or before the election, when there is no deadline
 * either). Earlier than that the page is pre-filing.
 */
export const FALLBACK_PRE_FILING_MONTHS = 9;

/**
 * How long after election day a race with no result on record keeps the
 * results-pending layout. Past this the race is between cycles and the page
 * goes back to pre-filing.
 */
export const RESULTS_PENDING_MONTHS = 3;

export type PositionHeroState =
	| { phase: 'preFiling' }
	| { phase: 'filing' }
	| { phase: 'midElection'; resultsPending: boolean }
	| { phase: 'decided'; multipleWinners: boolean };

export type PositionHeroStateInput = {
	filingDateStart?: string | null;
	filingDateEnd?: string | null;
	/** The general election. A primary's own date must not be passed here. */
	electionDate?: string | null;
	/** Winners of this race. `undefined` means we hold no result data at all. */
	winnerCount?: number | null;
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

/** The same calendar day `months` away, clamped to the end of a shorter month so Aug 31 minus six months is Feb 28, not March 3. */
function addMonths(day: Date, months: number): Date {
	const year = day.getFullYear();
	const month = day.getMonth() + months;
	const lastDay = new Date(year, month + 1, 0).getDate();
	return new Date(year, month, Math.min(day.getDate(), lastDay));
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
		if (today <= addMonths(election, RESULTS_PENDING_MONTHS)) {
			return { phase: 'midElection', resultsPending: true };
		}
		return { phase: 'preFiling' };
	}

	if (filingStart && today < filingStart) {
		return { phase: 'preFiling' };
	}

	if (filingEnd && today <= filingEnd) {
		if (!filingStart && today < addMonths(filingEnd, -FALLBACK_PRE_FILING_MONTHS)) {
			return { phase: 'preFiling' };
		}
		return { phase: 'filing' };
	}

	// With no deadline we cannot tell when filing closes, so a window that has
	// opened stays open until election day rather than reading as mid-election.
	if (!filingEnd && filingStart) {
		return { phase: 'filing' };
	}

	if (!filingEnd && !filingStart && election && today < addMonths(election, -FALLBACK_PRE_FILING_MONTHS)) {
		return { phase: 'preFiling' };
	}

	return { phase: 'midElection', resultsPending: false };
}

/**
 * The page's one H1, and the subject the title and description are built from.
 * Pre-filing leads with the guide ("How to Run for City Council in Bay City, MI",
 * capitalised as Figma 2360:19625 draws it, Emily 2026-10-12); every other phase
 * names the race ("City Council in Bay City, MI"). The hero and the routes' metadata both read this, so the heading
 * can never say one phase while the cards show another.
 */
export function positionHeroHeading(state: PositionHeroState, officeName: string, place?: string | null): string {
	const subject = place ? `${officeName} in ${place}` : officeName;
	return state.phase === 'preFiling' ? `How to Run for ${subject}` : subject;
}

/**
 * The `<title>` and meta description for a position page. `placePhrase` is the
 * place as the route names it in metadata ("Houston, Harris County, Texas"),
 * which is longer than the H1's place and deliberately so. The pre-filing title
 * is capitalised like the heading (Emily, 2026-10-12).
 */
export function positionPageMetadata(
	state: PositionHeroState,
	officeName: string,
	placePhrase: string,
	siteName: string,
): { title: string; description: string } {
	const subject = `${officeName} in ${placePhrase}`;
	if (state.phase === 'preFiling') {
		return {
			title: `How to Run for ${subject} | ${siteName}`,
			description: `Learn how to run for ${subject}: filing dates, election date and who holds the office today.`,
		};
	}
	return {
		title: `${subject} | ${siteName}`,
		description: `Election details and candidates for ${subject}.`,
	};
}
