'use client';

import { useEffect, useId, useRef } from 'react';

import { handleHubSpotFormSubmission } from '~/lib/hubspot/handleHubSpotFormSubmission';
import { getHubSpotPortalId } from '~/lib/hubspot/portalId';

import './hubspot-embed.css';

type HubSpotFormCreateOptions = {
	portalId: string;
	formId: string;
	target: string;
	region?: string;
	onFormReady?(): void;
	onFormSubmitted?(): void;
};

type HubSpotFormsApi = {
	create(options: HubSpotFormCreateOptions): void;
};

declare global {
	interface Window {
		hbspt?: {
			forms: HubSpotFormsApi;
		};
	}
}

function applySubmitLabel(target: HTMLElement, submitLabel?: string) {
	if (!submitLabel) return;

	const submit = target.querySelector('.hs-button, input[type="submit"], button[type="submit"]');
	if (submit instanceof HTMLInputElement) {
		submit.value = submitLabel;
	} else if (submit instanceof HTMLButtonElement) {
		submit.textContent = submitLabel;
	}
}

function applyEmbedWidth(target: HTMLElement) {
	target.style.width = 'stretch';
	target.style.maxWidth = '100%';

	const iframe = target.querySelector('iframe');
	if (iframe instanceof HTMLIFrameElement) {
		iframe.style.width = '100%';
		iframe.style.maxWidth = '100%';
	}
}

const SCRIPT_TIMEOUT_MS = 10_000;
const SCRIPT_POLL_MS = 250;

async function waitForHubSpotForms(isCancelled: () => boolean): Promise<HubSpotFormsApi> {
	return new Promise((resolve, reject) => {
		const started = Date.now();

		const check = () => {
			if (isCancelled()) {
				reject(new Error('HubSpot form wait cancelled'));
				return;
			}

			const forms = window.hbspt?.forms;
			if (forms?.create) {
				resolve(forms);
				return;
			}

			if (Date.now() - started >= SCRIPT_TIMEOUT_MS) {
				reject(new Error('HubSpot forms script did not load'));
				return;
			}

			window.setTimeout(check, SCRIPT_POLL_MS);
		};

		check();
	});
}

export function HubSpotEmbedForm({
	formId,
	redirectTo,
	submitLabel,
}: {
	formId: string;
	redirectTo?: string;
	submitLabel?: string;
}) {
	const reactId = useId();
	const targetId = `hs-form-${reactId.replace(/:/g, '')}`;
	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;
		const target = document.getElementById(targetId);

		if (!target) return;

		let cancelled = false;

		void waitForHubSpotForms(() => cancelled)
			.then(forms => {
				if (cancelled || !mountedRef.current) return;

				target.innerHTML = '';

				forms.create({
					portalId: getHubSpotPortalId(),
					formId,
					target: `#${targetId}`,
					region: 'na1',
					onFormReady: () => {
						if (cancelled || !mountedRef.current) return;
						applyEmbedWidth(target);
						applySubmitLabel(target, submitLabel);
					},
					onFormSubmitted: () => {
						handleHubSpotFormSubmission({
							formId,
							redirectTo,
							pagePath: window.location.pathname,
						});
					},
				});
			})
			.catch(() => {
				if (!cancelled && mountedRef.current) {
					target.innerHTML = '';
				}
			});

		return () => {
			cancelled = true;
			mountedRef.current = false;
			target.innerHTML = '';
		};
	}, [formId, redirectTo, submitLabel, targetId]);

	return (
		<div data-component='HubSpotEmbedForm' className='gp-hubspot-form flex w-full flex-col gap-4'>
			<div id={targetId} className='gp-hubspot-form-target' style={{ width: 'stretch', maxWidth: '100%' }} />
		</div>
	);
}
