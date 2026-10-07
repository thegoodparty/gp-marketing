'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '~/lib/analytics';

/**
 * Fires the exposure for a server-resolved experiment variant.
 *
 * Two things have to hold for Amplitude to count an exposure, and neither did
 * before this version:
 *
 * 1. The event has to be Amplitude's manual exposure event: `$exposure` with
 *    `flag_key` and `variant`. The analytics SDK hands it to Experiment, which
 *    sets the `[Experiment] <flag>` user property the experiment analysis
 *    engine keys on. `window.experiment` is the experiment-only SDK namespace
 *    that `~/ui/Amplitude.tsx` injects asynchronously, not an initialized
 *    client, so `window.experiment.exposure()` never sent anything and every
 *    marketing-site experiment showed "unknown user property" in Amplitude.
 * 2. The SDK has to be loaded when we track. `trackEvent` is a bare
 *    `window.amplitude?.track` with no queue, and this effect usually runs
 *    before the async SDK script has finished, so the custom `Experiment
 *    Viewed` event was dropped for most visitors (it reached 13% to 41% of
 *    page viewers depending on the page, measured October 2026).
 *    `~/ui/Amplitude.tsx` dispatches `experiment:ready` once the SDK is
 *    initialized or known to be unavailable, so wait for that when the global
 *    is not there yet.
 *
 * `Experiment Viewed` stays: existing charts and the experiments agent read it.
 */
export function ExperimentExposureTracker(props: {
	flagKey: string;
	variant: string;
}) {
	const tracked = useRef(false);

	useEffect(() => {
		const send = () => {
			if (tracked.current) return;
			tracked.current = true;
			const properties = { flag_key: props.flagKey, variant: props.variant };
			trackEvent('$exposure', properties);
			trackEvent('Experiment Viewed', properties);
		};

		if (window.amplitude) {
			send();
			return;
		}
		window.addEventListener('experiment:ready', send, { once: true });
		return () => window.removeEventListener('experiment:ready', send);
	}, [props.flagKey, props.variant]);

	return null;
}
