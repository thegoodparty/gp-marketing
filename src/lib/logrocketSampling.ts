/**
 * Share of eligible visits that record a LogRocket session. The election and people
 * pages get roughly 10,000 to 20,000 visits a day (about 40,000 on election eve), and
 * the LogRocket project caps recording at 1,000 sessions a day, counted from midnight
 * UTC. Recording every visit spent that whole allowance in the first hour after the
 * reset (7 to 8pm Eastern), so nothing was recorded the rest of the day. Recording a
 * random 5% spreads the allowance across the day; the daily cap in LogRocket's
 * Recording Settings stays on as a backstop for traffic spikes.
 */
export const LOGROCKET_SAMPLE_RATE = 0.05;

const STORAGE_KEY = 'gp-logrocket-sampled';

/**
 * Whether this visit records. The decision is kept in sessionStorage so it holds for
 * the whole tab session: LogRocket carries a session across full page loads in the
 * same tab, so rolling again on every load would cut sampled visits short and give
 * unsampled visitors a fresh chance on each page, over-representing long visits.
 * Storage can be missing or throw (private windows, blocked site data); the visit is
 * then decided on its own, which is the same odds.
 */
export function isSampledForLogRocket(
	getStorage: () => Pick<Storage, 'getItem' | 'setItem'> = () => window.sessionStorage,
	random: () => number = Math.random,
): boolean {
	try {
		const stored = getStorage().getItem(STORAGE_KEY);
		if (stored === '1') return true;
		if (stored === '0') return false;
	} catch {
		// Storage is blocked; fall through and roll for this page load.
	}
	const sampled = random() < LOGROCKET_SAMPLE_RATE;
	try {
		getStorage().setItem(STORAGE_KEY, sampled ? '1' : '0');
	} catch {
		// Storage is blocked; the next page load rolls again at the same odds.
	}
	return sampled;
}
