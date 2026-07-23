'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';

import { handleHubSpotFormSubmission } from '~/lib/hubspot/handleHubSpotFormSubmission';
import { getHubSpotPortalId } from '~/lib/hubspot/portalId';

import { waitForHubSpotForms } from './waitForHubSpotForms';

import './hubspot-embed.css';

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

export function HubSpotEmbedForm({ formId, redirectTo, submitLabel }: { formId: string; redirectTo?: string; submitLabel?: string }) {
	const reactId = useId();
	const targetId = `hs-form-${reactId.replace(/:/g, '')}`;
	const mountedRef = useRef(true);
	const [loadError, setLoadError] = useState(false);

	useEffect(() => {
		mountedRef.current = true;
		setLoadError(false);

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
			.catch(err => {
				if (!cancelled && mountedRef.current) {
					console.error('HubSpotEmbedForm: failed to load HubSpot forms script', err);
					setLoadError(true);
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
			{loadError ? (
				<p className='opacity-70'>
					Form failed to load. Please{' '}
					<Link href='/contact' className='underline'>
						contact us
					</Link>{' '}
					directly.
				</p>
			) : null}
			<div
				id={targetId}
				className='gp-hubspot-form-target'
				style={{ width: 'stretch', maxWidth: '100%', display: loadError ? 'none' : undefined }}
			/>
		</div>
	);
}
