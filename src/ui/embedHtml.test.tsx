import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { parseEmbed, parseResizerMessage, resizerInitMessage } from './EmbedHtml.tsx';

/**
 * `parseEmbed` decides what an Embedded Block actually shows: an iframe for a known
 * provider, or sanitized HTML with every script removed. A script-based snippet from
 * an unknown provider therefore renders as nothing (the check-voter-registration page,
 * September 2026), so each provider we support needs to be pinned here.
 */

let dom: JSDOM;
let DOMPurify: ReturnType<typeof createDOMPurify>;
const originalDOMParser = globalThis.DOMParser;

beforeAll(() => {
	dom = new JSDOM('<!doctype html><html><body></body></html>');
	globalThis.DOMParser = dom.window.DOMParser;
	DOMPurify = createDOMPurify(dom.window);
});

afterAll(() => {
	globalThis.DOMParser = originalDOMParser;
	dom.window.close();
});

describe('parseEmbed', () => {
	test('turns the VoteAmerica script snippet into the iframe its script would build', () => {
		const html =
			'<script src="https://cdn.voteamerica.org/embed/tools.js" async></script>\n' +
			'<div class="voteamerica-embed" data-subscriber="goodpartyorg-sstqynbv" data-tool="verify"></div>';

		expect(parseEmbed(html, DOMPurify)).toEqual({
			type: 'iframe',
			src: 'https://www.voteamerica.org/embed/verify/?subscriber=goodpartyorg-sstqynbv',
			provider: 'voteamerica',
		});
	});

	test('accepts a VoteAmerica iframe pasted directly', () => {
		const html = '<iframe src="https://www.voteamerica.com/embed/register/?subscriber=goodpartyorg-sstqynbv"></iframe>';

		expect(parseEmbed(html, DOMPurify)).toEqual({
			type: 'iframe',
			src: 'https://www.voteamerica.com/embed/register/?subscriber=goodpartyorg-sstqynbv',
			provider: 'voteamerica',
		});
	});

	test('still strips scripts from snippets for providers it does not know', () => {
		const html = '<script src="https://example.com/widget.js"></script><div class="example-widget" data-id="1"></div>';

		expect(parseEmbed(html, DOMPurify)).toEqual({
			type: 'html',
			sanitized: '<div class="example-widget" data-id="1"></div>',
		});
	});

	test('does not treat other providers as self-sizing', () => {
		const html = '<iframe src="https://www.youtube.com/embed/3riK4DWWhbw"></iframe>';

		expect(parseEmbed(html, DOMPurify)).toEqual({ type: 'iframe', src: 'https://www.youtube.com/embed/3riK4DWWhbw' });
	});

	test('refuses an iframe from a host that is not approved', () => {
		const html = '<iframe src="https://example.com/embed"></iframe>';

		expect(parseEmbed(html, DOMPurify)).toBeNull();
	});
});

/**
 * VoteAmerica's embed page reports its height over the iframe-resizer v4 protocol, the same one
 * its own snippet's script would drive. We only act on messages addressed to our frame id, and we
 * never read a scroll instruction's x/y pair as a height.
 */
describe('parseResizerMessage', () => {
	const id = 'embed-abc123';

	test('announces the parent with the settings string the page expects', () => {
		expect(resizerInitMessage(id)).toBe(
			'[iFrameSizer]embed-abc123:8:false:false:32:true:true:0 0:taggedElement:null:null:0:false:parent:scroll',
		);
	});

	test('recognises the page asking for the handshake', () => {
		expect(parseResizerMessage('[iFrameResizerChild]Ready', id)).toEqual({ kind: 'ready' });
	});

	test('reads the height from init and resize reports', () => {
		expect(parseResizerMessage('[iFrameSizer]embed-abc123:916:1024:init', id)).toEqual({ kind: 'height', px: 916 });
		expect(parseResizerMessage('[iFrameSizer]embed-abc123:1240:1024:mutationObserver', id)).toEqual({ kind: 'height', px: 1240 });
	});

	test('ignores reports meant for another frame', () => {
		expect(parseResizerMessage('[iFrameSizer]embed-other:916:1024:init', id)).toBeNull();
	});

	test('does not mistake a scroll instruction for a height', () => {
		expect(parseResizerMessage('[iFrameSizer]embed-abc123:0:300:scrollTo', id)).toBeNull();
		// pageInfo carries the page's scroll offset in the height slot, so a scrolled page
		// would otherwise shrink the frame to wherever the reader happens to be.
		expect(parseResizerMessage('[iFrameSizer]embed-abc123:450:0:pageInfo', id)).toBeNull();
		expect(parseResizerMessage('[iFrameSizer]embed-abc123:450:0:inPageLink', id)).toBeNull();
	});

	test('turns the scroll-to-top message into a scroll request', () => {
		expect(parseResizerMessage('[iFrameSizer]embed-abc123:916:1024:message:{"type":"scrollToTop"}', id)).toEqual({ kind: 'scrollToTop' });
		expect(parseResizerMessage('[iFrameSizer]embed-abc123:916:1024:message:{"type":"parentMessage","payload":{}}', id)).toBeNull();
	});

	test('ignores anything that is not a string', () => {
		expect(parseResizerMessage({ height: 900 }, id)).toBeNull();
		expect(parseResizerMessage('hello', id)).toBeNull();
	});
});
