// Election days are judged on the Pacific calendar, so a race stays upcoming until midnight on the West Coast, after every
// state's polls have closed. The servers run on UTC, where election day ends at 7pm Eastern while polls are still open.
const ELECTION_TIME_ZONE = 'America/Los_Angeles';

const pacificDateFormat = new Intl.DateTimeFormat('en-US', {
	timeZone: ELECTION_TIME_ZONE,
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
});

/** Today's Pacific calendar date as a local midnight, comparable with dates parsed by `toLocalDay`. */
export const startOfElectionDay = (now: Date = new Date()): Date => {
	const parts = pacificDateFormat.formatToParts(now);
	const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(p => p.type === type)?.value);
	return new Date(part('year'), part('month') - 1, part('day'));
};
