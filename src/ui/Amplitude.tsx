'use client';

import Script from 'next/script';

const AMPLITUDE_API_KEY = process.env['NEXT_PUBLIC_AMPLITUDE_API_KEY'];
const EXPERIMENT_DEPLOYMENT_KEY = process.env['NEXT_PUBLIC_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY'];

export function Amplitude() {
	if (!AMPLITUDE_API_KEY) return null;

	return (
		<Script
			id='amplitude-sdk'
			src={`https://cdn.amplitude.com/script/${AMPLITUDE_API_KEY}.js`}
			strategy='afterInteractive'
			onLoad={() => {
				if (typeof window !== 'undefined' && window.amplitude) {
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
								const experiment = Experiment.initialize(EXPERIMENT_DEPLOYMENT_KEY);
								window.experiment = experiment;
								void experiment.fetch().finally(() => {
									window.dispatchEvent(new Event('experiment:ready'));
								});
							})
							.catch(() => {
								window.dispatchEvent(new Event('experiment:ready'));
							});
					}
				}
			}}
		/>
	);
}
