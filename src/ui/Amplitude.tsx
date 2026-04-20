'use client';

import { useEffect } from 'react';

const AMPLITUDE_API_KEY = process.env['NEXT_PUBLIC_AMPLITUDE_API_KEY'];
const EXPERIMENT_DEPLOYMENT_KEY = process.env['NEXT_PUBLIC_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY'];

/** Prevents double `init` on Strict Mode remount or duplicate script `load` handlers. */
let amplitudeClientBooted = false;

function boot() {
	if (typeof window === 'undefined' || !window.amplitude || !AMPLITUDE_API_KEY) return;
	if (amplitudeClientBooted) return;
	amplitudeClientBooted = true;

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

function findInjectedAmplitudeScript(apiKey: string) {
	const suffix = `/script/${apiKey}.js`;
	return [...document.scripts].find((s) => s.src.endsWith(suffix));
}

export function Amplitude() {
	useEffect(() => {
		if (!AMPLITUDE_API_KEY) return;

		// GTM (or another tag) already loaded the Amplitude snippet — skip injecting a second script.
		if (window.amplitude) {
			boot();
			return;
		}

		// Strict Mode runs effects twice before `window.amplitude` exists; reuse the first script tag.
		const existing = findInjectedAmplitudeScript(AMPLITUDE_API_KEY);
		if (existing) {
			existing.addEventListener('load', boot, { once: true });
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
