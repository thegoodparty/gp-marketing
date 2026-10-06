import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { parseEmbed } from './EmbedHtml.tsx';

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
		});
	});

	test('accepts a VoteAmerica iframe pasted directly', () => {
		const html = '<iframe src="https://www.voteamerica.com/embed/register/?subscriber=goodpartyorg-sstqynbv"></iframe>';

		expect(parseEmbed(html, DOMPurify)).toEqual({
			type: 'iframe',
			src: 'https://www.voteamerica.com/embed/register/?subscriber=goodpartyorg-sstqynbv',
		});
	});

	test('still strips scripts from snippets for providers it does not know', () => {
		const html = '<script src="https://example.com/widget.js"></script><div class="example-widget" data-id="1"></div>';

		expect(parseEmbed(html, DOMPurify)).toEqual({
			type: 'html',
			sanitized: '<div class="example-widget" data-id="1"></div>',
		});
	});

	test('refuses an iframe from a host that is not approved', () => {
		const html = '<iframe src="https://example.com/embed"></iframe>';

		expect(parseEmbed(html, DOMPurify)).toBeNull();
	});
});
