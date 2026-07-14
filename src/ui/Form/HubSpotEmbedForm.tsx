'use client';

import { useEffect, useId, useRef } from 'react';

import { trackEvent } from '~/lib/analytics';
import { getHubSpotPortalId } from '~/lib/hubspot/portalId';
import { isSafeRelativeRedirect } from '~/lib/isSafeRelativeRedirect';

import './hubspot-embed.css';

type HubSpotFormsApi = {
	create: (options: {
		portalId: string;
		formId: string;
		target: string;
		region?: string;
		onFormReady?: () => void;
		onFormSubmitted?: () => void;
	}) => void;
};

declare global {
	interface Window {
		hbspt?: {
			forms: HubSpotFormsApi;
		};
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

function waitForHubSpotForms(): Promise<HubSpotFormsApi> {
	return new Promise((resolve, reject) => {
		const started = Date.now();

		const check = () => {
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
}: {
	formId: string;
	redirectTo?: string;
}) {
	const reactId = useId();
	const targetId = `hs-form-${reactId.replace(/:/g, '')}`;
	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;
		const target = document.getElementById(targetId);

		if (!target) return;

		let cancelled = false;

		void waitForHubSpotForms()
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
					},
					onFormSubmitted: () => {
						trackEvent('Newsletter Form Submitted', {
							formId,
							page_path: window.location.pathname,
						});

						if (redirectTo && isSafeRelativeRedirect(redirectTo)) {
							const separator = redirectTo.includes('?') ? '&' : '?';
							window.location.assign(`${redirectTo}${separator}submissionGuid=${crypto.randomUUID()}`);
						}
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
	}, [formId, redirectTo, targetId]);

	return (
		<div data-component='HubSpotEmbedForm' className='gp-hubspot-form flex w-full flex-col gap-4'>
			<div id={targetId} className='gp-hubspot-form-target' style={{ width: 'stretch', maxWidth: '100%' }} />
		</div>
	);
}
