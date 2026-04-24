'use client';

import { useEffect } from 'react';

const AMPLITUDE_API_KEY = process.env['NEXT_PUBLIC_AMPLITUDE_API_KEY'];
const EXTERNAL_AMPLITUDE_WAIT_MS = 1_500;

function getAmplitudeState() {
	if (typeof window === 'undefined') return undefined;
	window.__goodpartyAmplitude ??= { clientInitialized: false, scriptInjected: false };
	return window.__goodpartyAmplitude;
}

function markAmplitudeReady() {
	window.dispatchEvent(new Event('experiment:ready'));
}

function adoptExternalAmplitude() {
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

	window.amplitude.init(AMPLITUDE_API_KEY, {
		fetchRemoteConfig: true,
		autocapture: true,
		transport: 'beacon',
	});
	markAmplitudeReady();
}

function findInjectedAmplitudeScript(apiKey: string) {
	const suffix = `/script/${apiKey}.js`;
	return [...document.scripts].find((s) => s.src.endsWith(suffix));
}

/**
 * When the script is already in the DOM (Strict Mode remount or cache), `load` may have
 * fired before we attach a listener. Poll briefly after `load` + microtask/rAF.
 */
function whenAmplitudeScriptProvidesGlobal(
	script: HTMLScriptElement,
	onReady: () => void,
): (() => void) | undefined {
	const tryBoot = () => {
		if (!window.amplitude) return false;
		onReady();
		return true;
	};

	if (tryBoot()) return undefined;

	const run = () => {
		void tryBoot();
	};

	script.addEventListener('load', run, { once: true });
	script.addEventListener('error', run, { once: true });
	void queueMicrotask(run);
	requestAnimationFrame(run);

	const started = performance.now();
	const pollId = window.setInterval(() => {
		if (tryBoot() || performance.now() - started > 10_000) {
			window.clearInterval(pollId);
		}
	}, 100);

	return () => {
		window.clearInterval(pollId);
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
			adoptExternalAmplitude();
			return;
		}

		const waitForExternalTags = window.setTimeout(() => {
			if (cancelled || state.clientInitialized) return;

			if (window.amplitude) {
				adoptExternalAmplitude();
				return;
			}

			const existing = findInjectedAmplitudeScript(AMPLITUDE_API_KEY);
			if (existing) {
				stopWaitingForScript = whenAmplitudeScriptProvidesGlobal(
					existing,
					state.scriptInjected ? bootAppAmplitude : adoptExternalAmplitude,
				);
				return;
			}

			state.scriptInjected = true;
			const script = document.createElement('script');
			script.src = `https://cdn.amplitude.com/script/${AMPLITUDE_API_KEY}.js`;
			script.async = true;
			document.head.appendChild(script);
			stopWaitingForScript = whenAmplitudeScriptProvidesGlobal(script, bootAppAmplitude);
		}, EXTERNAL_AMPLITUDE_WAIT_MS);

		return () => {
			cancelled = true;
			window.clearTimeout(waitForExternalTags);
			stopWaitingForScript?.();
		};
	}, []);

	return null;
}
