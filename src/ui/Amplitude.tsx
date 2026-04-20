'use client';

import { useEffect } from 'react';

const AMPLITUDE_API_KEY = process.env['NEXT_PUBLIC_AMPLITUDE_API_KEY'];
const EXPERIMENT_DEPLOYMENT_KEY = process.env['NEXT_PUBLIC_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY'];

function boot() {
	if (typeof window === 'undefined' || !window.amplitude || !AMPLITUDE_API_KEY) return;

	if (window.sessionReplay?.plugin) {
		window.amplitude.add?.(window.sessionReplay.plugin({ sampleRate: 1 }));
	}
	window.amplitude.init(AMPLITUDE_API_KEY, {
		fetchRemoteConfig: true,
		autocapture: true,
		transport: 'beacon',
	});

	if (EXPERIMENT_DEPLOYMENT_KEY) {
		import('@amplitude/experiment-js-client')
			.then(({ Experiment }) => {
				const experiment = Experiment.initializeWithAmplitudeAnalytics(
					EXPERIMENT_DEPLOYMENT_KEY,
				);
				window.experiment = experiment;
				void experiment.fetch().finally(() => {
					window.dispatchEvent(new Event('experiment:ready'));
				});
			})
			.catch((err: unknown) => {
				console.warn('[Amplitude] Experiment SDK failed to load', err);
				window.dispatchEvent(new Event('experiment:ready'));
			});
	}
}

export function Amplitude() {
	useEffect(() => {
		if (!AMPLITUDE_API_KEY) return;

		// GTM (or another tag) already loaded the Amplitude snippet — skip injecting a second script.
		if (window.amplitude) {
			boot();
			return;
		}

		const script = document.createElement('script');
		script.src = `https://cdn.amplitude.com/script/${AMPLITUDE_API_KEY}.js`;
		script.async = true;
		script.onload = boot;
		document.head.appendChild(script);
	}, []);

	return null;
}
