import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';

/**
 * `ensureGooglePlacesLoaded` caches its load promise at module level so a second
 * keystroke awaits the same script instead of injecting a second tag. A rejected
 * promise is still a truthy object, so before the fix a single transient script
 * failure left the rejection cached for the rest of the session and autocomplete
 * silently degraded to free-text submit until the page was reloaded.
 *
 * The loader needs a real `document`, so this lives in the DOM half of the suite.
 * The whole sequence runs in one test on purpose: the module-level cache persists
 * across tests in a file, and what matters is the transition fail -> retry -> ok.
 */

let dom: JSDOM;
const KEY = 'NEXT_PUBLIC_GOOGLE_PLACES_BROWSER_KEY';
let previousKey: string | undefined;

beforeEach(() => {
	dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', { url: 'https://goodparty.org/' });
	const { window } = dom;
	globalThis.window = window as unknown as Window & typeof globalThis;
	globalThis.document = window.document;
	// The loader does `existing instanceof HTMLScriptElement`; that constructor is a
	// browser global, not a bun one, so expose jsdom's the way the other DOM tests do.
	for (const name of ['HTMLScriptElement', 'HTMLElement', 'Element', 'Node', 'Event'] as const) {
		(globalThis as Record<string, unknown>)[name] = (window as unknown as Record<string, unknown>)[name];
	}
	previousKey = process.env[KEY];
	process.env[KEY] = 'test-browser-key';
});

afterEach(() => {
	if (previousKey === undefined) delete process.env[KEY];
	else process.env[KEY] = previousKey;
	dom.window.close();
});

// No `instanceof` here: the element comes from jsdom's realm and the type from
// lib.dom, and the two disagree both at compile time and, across realms, at runtime.
function injectedScript(): Element {
	const el = document.head.querySelector('script[src*="maps.googleapis.com"]');
	if (!el || el.tagName !== 'SCRIPT') {
		throw new Error(`expected the Places script tag to have been injected; head was: ${document.head.innerHTML || '<empty>'}`);
	}
	return el;
}

describe('ensureGooglePlacesLoaded', () => {
	test('a failed script load is not cached: the next call retries and can succeed', async () => {
		const { ensureGooglePlacesLoaded } = await import('./googlePlaces');

		// First keystroke: the tag is injected, then the network fails.
		const first = ensureGooglePlacesLoaded();
		const script = injectedScript();
		script.dispatchEvent(new dom.window.Event('error'));
		await expect(first).rejects.toThrow('Google Places script failed to load');

		// The script did in fact arrive late (or the blip cleared). The library is
		// present on window, so a retry that re-checks the existing tag should resolve.
		(window as unknown as { google: unknown }).google = { maps: { places: {} } };

		const second = ensureGooglePlacesLoaded();
		expect(second).not.toBe(first);
		await expect(second).resolves.toBeUndefined();

		// And only ever one tag: recovery reuses the existing element rather than
		// appending a second script.
		expect(document.head.querySelectorAll('script[src*="maps.googleapis.com"]').length).toBe(1);
	});
});
