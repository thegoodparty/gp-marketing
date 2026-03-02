'use client';

import Script from 'next/script';

export function Amplitude() {
	return (
		<Script
			id='amplitude-sdk'
			src='https://cdn.amplitude.com/script/5a7af08e3a00d6fd2486d1c1313740f2.js'
			strategy='afterInteractive'
			onLoad={() => {
				if (typeof window !== 'undefined' && window.amplitude) {
					if (window.sessionReplay?.plugin) {
						window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
					}
					window.amplitude.init('5a7af08e3a00d6fd2486d1c1313740f2', {
						fetchRemoteConfig: true,
						autocapture: true,
					});
				}
			}}
		/>
	);
}
