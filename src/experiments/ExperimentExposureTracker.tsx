'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '~/lib/analytics';

export function ExperimentExposureTracker(props: {
	flagKey: string;
	variant: string;
}) {
	const tracked = useRef(false);

	useEffect(() => {
		if (tracked.current) return;
		tracked.current = true;

		window.experiment?.exposure(props.flagKey);

		trackEvent('Experiment Viewed', {
			flag_key: props.flagKey,
			variant: props.variant,
		});
	}, [props.flagKey, props.variant]);

	return null;
}
