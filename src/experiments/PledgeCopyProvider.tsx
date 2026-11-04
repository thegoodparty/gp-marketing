'use client';

import { createContext, type ReactNode, useContext, useEffect } from 'react';

import { PLEDGE_COPY_ATTRIBUTE, PLEDGE_COPY_FLAG_KEY, currentPledgeCopyVariant } from '~/experiments/pledgeCopyTest';
import { trackDataLayerEvent, trackEvent, whenAmplitudeReady } from '~/lib/analytics';

const PledgeLocationContext = createContext<string | null>(null);

/** The place the page is about, for the pop-up's "[Location]'s next election" line. Null off the election pages. */
export function usePledgeLocation(): string | null {
	return useContext(PledgeLocationContext);
}

let exposedPath: string | null = null;

/**
 * Records that the visitor saw their arm of the pledge copy test: Amplitude's
 * `$exposure` (which sets the `[Experiment] voter-guide-pledge-copy` user
 * property) and `Experiment Viewed`, as the page experiments send, plus a data
 * layer push for GA4. Once per page, and only for a visitor who is in the test.
 * A page counts when it renders a tested callout or when the pop-up opens.
 */
export function exposePledgeCopy(): void {
	if (typeof window === 'undefined') return;
	const variant = currentPledgeCopyVariant();
	if (!variant) return;
	const path = window.location.pathname;
	if (exposedPath === path) return;
	exposedPath = path;
	const properties = { flag_key: PLEDGE_COPY_FLAG_KEY, variant };
	trackDataLayerEvent('voter_guide_pledge_copy_exposure', { page_path: path, ...properties });
	whenAmplitudeReady(() => {
		trackEvent('$exposure', properties);
		trackEvent('Experiment Viewed', properties);
	});
}

/** Test seam: forget which page was exposed. */
export function resetPledgeCopyExposure(): void {
	exposedPath = null;
}

/**
 * Wraps a voter guide page: hands the pop-up the page's place name and counts
 * the visit as an exposure when a tested callout is on the page.
 */
export function PledgeCopyProvider(props: { location: string | null | undefined; children: ReactNode }) {
	useEffect(() => {
		if (document.querySelector(`[${PLEDGE_COPY_ATTRIBUTE}]`)) exposePledgeCopy();
	}, []);

	return <PledgeLocationContext.Provider value={props.location || null}>{props.children}</PledgeLocationContext.Provider>;
}
