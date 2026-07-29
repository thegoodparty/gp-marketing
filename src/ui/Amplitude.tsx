'use client';

import { useEffect } from 'react';

const AMPLITUDE_API_KEY = process.env['NEXT_PUBLIC_AMPLITUDE_API_KEY'];
const EXTERNAL_AMPLITUDE_WAIT_MS = 1_500;
const AMPLITUDE_CDN_WAIT_MS = 10_000;

// Never load the all-in-one cdn.amplitude.com/script/<key>.js build: it bundles the session
// replay plugin, whose sample rate is remote-controlled (overriding any local sampleRate) and
// burned the entire monthly replay quota on anonymous marketing sessions (ENG-10831). The plain
// SDK plus the experiment-only build below cover everything this site uses, with no replay.
const AMPLITUDE_SDK_SRC = 'https://cdn.amplitude.com/libs/analytics-browser-2.42.4-min.js.gz';

function getAmplitudeState() {
	if (typeof window === 'undefined') return undefined;
	window.__goodpartyAmplitude ??= { clientInitialized: false, scriptInjected: false };
	return window.__goodpartyAmplitude;
}

function markAmplitudeReady() {
	window.dispatchEvent(new Event('experiment:ready'));
}

function markAmplitudeUnavailable(message: string) {
	const state = getAmplitudeState();
	if (state) state.scriptInjected = false;
	console.warn(message);
	markAmplitudeReady();
}

function adoptExternalAmplitude() {
	// Externally-owned Amplitude (GTM/Segment) also needs cookieOptions.domain: '.goodparty.org' at its source to stitch across subdomains.
	const state = getAmplitudeState();
	if (!state || state.clientInitialized) return;
	state.clientInitialized = true;
	markAmplitudeReady();
}

function bootAppAmplitude() {
	if (typeof window === 'undefined' || !window.amplitude || !AMPLITUDE_API_KEY) return;
	const state = getAmplitudeState();
	if (!state || state.clientInitialized) return;
	state.clientInitialized = true;

	const host = window.location.hostname;
	const onGoodPartyDomain = host === 'goodparty.org' || host.endsWith('.goodparty.org');

	window.amplitude.init(AMPLITUDE_API_KEY, {
		fetchRemoteConfig: false,
		autocapture: {
			attribution: {
				resetSessionOnNewCampaign: false,
				excludeReferrers: [/goodparty\.org$/],
			},
		},
		transport: 'beacon',
		...(onGoodPartyDomain ? { cookieOptions: { domain: '.goodparty.org' } } : {}),
	});
	markAmplitudeReady();
}

function findInjectedAmplitudeScript(apiKey: string) {
	// GTM may inject either the legacy all-in-one build or the plain SDK.
	const legacySuffix = `/script/${apiKey}.js`;
	return [...document.scripts].find((s) => s.src.endsWith(legacySuffix) || s.src === AMPLITUDE_SDK_SRC);
}

// window.experiment used to come from the all-in-one build; with the plain SDK it needs the
// experiment-only build, which contains no session replay code.
function ensureExperimentScript() {
	if (window.experiment || !AMPLITUDE_API_KEY) return;
	const src = `https://cdn.amplitude.com/script/${AMPLITUDE_API_KEY}.experiment.js`;
	if ([...document.scripts].some((s) => s.src === src)) return;
	const script = document.createElement('script');
	script.src = src;
	script.async = true;
	document.head.appendChild(script);
}

/**
 * When the script is already in the DOM (Strict Mode remount or cache), `load` may have
 * fired before we attach a listener. Poll briefly after `load` + microtask/rAF.
 */
function whenAmplitudeScriptProvidesGlobal(
	script: HTMLScriptElement,
	onReady: () => void,
	onUnavailable: (message: string) => void,
): (() => void) | undefined {
	if (window.amplitude) {
		onReady();
		return undefined;
	}

	let completed = false;

	const cleanup = () => {
		script.removeEventListener('load', handleLoad);
		script.removeEventListener('error', handleError);
		window.clearInterval(pollId);
	};

	const tryBoot = () => {
		if (completed) return true;
		if (!window.amplitude) return false;
		completed = true;
		cleanup();
		onReady();
		return true;
	};

	function handleLoad() {
		void tryBoot();
	}

	function handleError() {
		if (completed) return;
		completed = true;
		cleanup();
		script.remove();
		onUnavailable('[Amplitude] CDN script failed to load');
	}

	script.addEventListener('load', handleLoad);
	script.addEventListener('error', handleError);
	void queueMicrotask(handleLoad);
	requestAnimationFrame(handleLoad);

	const started = performance.now();
	const pollId = window.setInterval(() => {
		if (tryBoot()) return;
		if (performance.now() - started > AMPLITUDE_CDN_WAIT_MS) {
			completed = true;
			cleanup();
			script.remove();
			onUnavailable('[Amplitude] CDN script did not provide window.amplitude');
		}
	}, 100);

	return () => {
		cleanup();
	};
}

export function Amplitude() {
	useEffect(() => {
		if (!AMPLITUDE_API_KEY) return;

		const state = getAmplitudeState();
		if (!state) return;
		let cancelled = false;
		let stopWaitingForScript: (() => void) | undefined;

		// Already initialized in this tab (HMR, duplicate layout, etc.)
		if (state.clientInitialized) return;

		// GTM/Segment may already own Amplitude. Do not re-init an externally-owned SDK.
		if (window.amplitude) {
			ensureExperimentScript();
			adoptExternalAmplitude();
			return;
		}

		const waitForExternalTags = window.setTimeout(() => {
			if (cancelled || state.clientInitialized) return;

			ensureExperimentScript();

			if (window.amplitude) {
				adoptExternalAmplitude();
				return;
			}

			const existing = findInjectedAmplitudeScript(AMPLITUDE_API_KEY);
			if (existing) {
				stopWaitingForScript = whenAmplitudeScriptProvidesGlobal(
					existing,
					state.scriptInjected ? bootAppAmplitude : adoptExternalAmplitude,
					markAmplitudeUnavailable,
				);
				return;
			}

			state.scriptInjected = true;
			const script = document.createElement('script');
			script.src = AMPLITUDE_SDK_SRC;
			script.async = true;
			document.head.appendChild(script);
			stopWaitingForScript = whenAmplitudeScriptProvidesGlobal(
				script,
				bootAppAmplitude,
				markAmplitudeUnavailable,
			);
		}, EXTERNAL_AMPLITUDE_WAIT_MS);

		return () => {
			cancelled = true;
			window.clearTimeout(waitForExternalTags);
			stopWaitingForScript?.();
		};
	}, []);

	return null;
}
