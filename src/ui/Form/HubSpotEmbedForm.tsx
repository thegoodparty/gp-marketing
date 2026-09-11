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
			const isFontFace =
				typeof CSSFontFaceRule === 'undefined' ? rule.constructor?.name === 'CSSFontFaceRule' : rule instanceof CSSFontFaceRule;
			if (!isFontFace) continue;
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

	const css = faces.join('\n');
	// Only cache once faces were actually found. onFormReady can fire before a
	// stylesheet finishes parsing; caching the empty result would poison every
	// later call and silently skip font injection for the page's lifetime.
	if (faces.length > 0) hostFontFacesCache = css;
	return css;
}

/* Test-only: the font-face cache is a module singleton that survives between tests
   in a single process, so reset it per test to keep them order-independent. */
export function _resetHostFontFacesCacheForTest() {
	hostFontFacesCache = null;
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
	if (doc.fonts) {
		for (const family of ['Outfit', 'Open Sans']) {
			void doc.fonts.load(`600 16px "${family}"`).catch(() => null);
		}
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
	.hs-form label { color: var(--gp-form-text, hsl(220 58% 10%)) !important; font-weight: 600 !important; }
	.hs-form .hs-richtext, .hs-form .legal-consent-container, .hs-form .hs-form__legal-text {
		color: var(--gp-form-text, hsl(220 58% 10%)) !important;
	}
	.hs-form .hs-error-msg, .hs-form .hs-error-msgs label { color: var(--gp-form-error, #b80a27) !important; font-weight: 400 !important; }
`;

/* The form is dropped into sections with different backgrounds (cream, dark hero,
   etc.), so pick a readable colour for the on-section text — labels and the legal
   disclaimer — from the luminance of whatever background sits behind the form.
   Defaults to dark text, which suits the common light/cream sections. */
const ON_SECTION_DARK_TEXT = 'hsl(220 58% 10%)';
const ON_SECTION_LIGHT_TEXT = '#fff';

function effectiveBackgroundColor(element: HTMLElement): string | null {
	for (let node: HTMLElement | null = element; node; node = node.parentElement) {
		const color = getComputedStyle(node).backgroundColor;
		// Skip only the fully-transparent value (the resolved form of `transparent`);
		// a semi-opaque background such as rgba(0, 0, 0, 0.5) is a real background.
		if (color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') return color;
	}
	return null;
}

function isDarkColor(color: string): boolean {
	const match = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s]+([\d.]+))?/.exec(color);
	if (!match) return false;
	const r = Number(match[1]);
	const g = Number(match[2]);
	const b = Number(match[3]);
	const a = match[4] !== undefined ? Number(match[4]) : 1;
	// A near-transparent overlay carries no colour signal.
	if (a < 0.05) return false;
	// Composite over white using the alpha so a semi-opaque scrim is scored by its
	// effective colour on the page, not as if it were fully opaque.
	const effectiveR = a * r + (1 - a) * 255;
	const effectiveG = a * g + (1 - a) * 255;
	const effectiveB = a * b + (1 - a) * 255;
	return (0.299 * effectiveR + 0.587 * effectiveG + 0.114 * effectiveB) / 255 < 0.5;
}

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

	const background = effectiveBackgroundColor(target);
	doc.documentElement.style.setProperty('--gp-form-text', background && isDarkColor(background) ? ON_SECTION_LIGHT_TEXT : ON_SECTION_DARK_TEXT);

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
