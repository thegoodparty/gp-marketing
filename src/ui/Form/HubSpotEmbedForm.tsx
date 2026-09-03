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

const BRAND_STYLE_ID = 'gp-hubspot-brand';
const FONT_STYLE_ID = 'gp-hubspot-fonts';

/* The form renders inside a same-origin about:blank iframe that does not inherit
   the site's @font-face rules, so text falls back to a system font. Copy the host
   page's font faces into the iframe, rewriting relative url()s to absolute since
   the iframe's base URL is about:blank. Computed once and reused. */
let hostFontFacesCache: string | null = null;

function collectHostFontFaces(): string {
	if (hostFontFacesCache !== null) return hostFontFacesCache;

	const faces: string[] = [];
	for (const sheet of Array.from(document.styleSheets)) {
		let rules: CSSRuleList;
		try {
			rules = sheet.cssRules;
		} catch {
			continue;
		}
		const base = sheet.href ?? document.baseURI;
		for (const rule of Array.from(rules)) {
			if (rule instanceof CSSFontFaceRule) {
				faces.push(
					rule.cssText.replace(/url\((["']?)([^"')]+)\1\)/g, (match, _quote, url: string) => {
						if (/^(data:|https?:)/.test(url)) return match;
						try {
							return `url("${new URL(url, base).href}")`;
						} catch {
							return match;
						}
					}),
				);
			}
		}
	}

	hostFontFacesCache = faces.join('\n');
	return hostFontFacesCache;
}

function injectHostFonts(doc: Document) {
	const faces = collectHostFontFaces();
	if (!faces) return;

	let style = doc.getElementById(FONT_STYLE_ID);
	if (!(style instanceof HTMLStyleElement)) {
		style = doc.createElement('style');
		style.id = FONT_STYLE_ID;
		doc.head.appendChild(style);
	}
	style.textContent = faces;

	/* Font faces load lazily, which can leave the form showing a fallback on first
	   paint. Kick off the two families the brand styles use so they are ready. */
	for (const family of ['Outfit', 'Open Sans']) {
		void doc.fonts.load(`600 16px "${family}"`).catch(() => null);
	}
}

/* Brand tokens forwarded from the host page onto the form iframe so the injected
   stylesheet stays a single source of truth with the rest of the site. */
const BRAND_TOKENS: Record<string, string> = {
	'--gp-form-font': '--font-secondary',
	'--gp-form-button-font': '--font-primary',
	'--gp-form-radius': '--radius-md',
	'--gp-form-primary': '--btn-primary-bg',
	'--gp-form-red': '--goodparty-red',
	'--gp-form-error': '--error-600',
};

const BRAND_CSS = `
	.hs-form, .hs-form * { font-family: var(--gp-form-font, "Open Sans", sans-serif) !important; }
	.hs-form .hs-input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=submit]) {
		width: 100% !important;
		max-width: 100% !important;
		box-sizing: border-box !important;
		border-radius: var(--gp-form-radius, 12px) !important;
		border: 1px solid hsl(0 0% 82%) !important;
		padding: 0.75rem 0.875rem !important;
		font-size: 1rem !important;
		background-color: #fff !important;
		color: #111 !important;
		box-shadow: none !important;
	}
	.hs-form textarea.hs-input { min-height: 7rem !important; }
	.hs-form .hs-input:focus {
		border-color: var(--gp-form-primary, #2563eb) !important;
		outline: none !important;
		box-shadow: 0 0 0 3px var(--gp-form-primary, #2563eb) !important;
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--gp-form-primary, #2563eb) 35%, transparent) !important;
	}
	.hs-form .hs-input.invalid:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=submit]),
	.hs-form .hs-input.error:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=submit]) {
		border-color: var(--gp-form-error, #b80a27) !important;
	}
	.hs-form .hs-button, .hs-form input[type=submit].hs-button {
		display: inline-block !important;
		width: auto !important;
		background-color: var(--gp-form-primary, #2563eb) !important;
		color: #fff !important;
		border: none !important;
		border-radius: 9999px !important;
		padding: 0.75rem 2rem !important;
		font-family: var(--gp-form-button-font, "Outfit", sans-serif) !important;
		font-weight: 600 !important;
		font-size: 0.875rem !important;
		line-height: 1.4 !important;
		cursor: pointer !important;
		transition: filter 0.2s ease !important;
		text-transform: none !important;
		box-shadow: none !important;
	}
	.hs-form .hs-button:hover { filter: brightness(0.92) !important; }
	.hs-form .hs-button:focus-visible {
		outline: none !important;
		box-shadow: 0 0 0 3px var(--gp-form-primary, #2563eb) !important;
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--gp-form-primary, #2563eb) 35%, transparent) !important;
	}
	.hs-form .hs-form-required { color: var(--gp-form-red, #db1439) !important; }
	.hs-form label { color: hsl(220 58% 10%) !important; font-weight: 600 !important; }
	.hs-form .hs-error-msg, .hs-form .hs-error-msgs label { color: var(--gp-form-error, #b80a27) !important; font-weight: 400 !important; }
`;

function applyBrandStyles(target: HTMLElement) {
	const iframe = target.querySelector('iframe');
	if (!(iframe instanceof HTMLIFrameElement)) return;

	let doc: Document | null = null;
	try {
		doc = iframe.contentDocument;
	} catch {
		return;
	}
	if (!doc?.head) return;

	injectHostFonts(doc);

	const hostStyles = getComputedStyle(document.documentElement);
	for (const [alias, token] of Object.entries(BRAND_TOKENS)) {
		const value = hostStyles.getPropertyValue(token).trim();
		if (value) doc.documentElement.style.setProperty(alias, value);
	}

	let style = doc.getElementById(BRAND_STYLE_ID);
	if (!(style instanceof HTMLStyleElement)) {
		style = doc.createElement('style');
		style.id = BRAND_STYLE_ID;
		doc.head.appendChild(style);
	}
	style.textContent = BRAND_CSS;
}

export function HubSpotEmbedForm({
	formId,
	redirectTo,
	submitLabel,
	onFormSubmit = handleHubSpotFormSubmission,
}: {
	formId: string;
	redirectTo?: string;
	submitLabel?: string;
	onFormSubmit?: typeof handleHubSpotFormSubmission;
}) {
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
						applyBrandStyles(target);
						applySubmitLabel(target, submitLabel);
					},
					onFormSubmitted: () => {
						onFormSubmit({
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
	}, [formId, redirectTo, submitLabel, targetId, onFormSubmit]);

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
