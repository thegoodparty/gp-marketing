import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar } from './Avatar';

/**
 * Election-api headshots reach the lists as plain URLs. The circle must crop
 * them, not stretch them: a portrait photo squished sideways in every candidate
 * list while the profile hero, which crops, showed it correctly (Emily,
 * 2026-10-06).
 */
describe('Avatar with a URL photo', () => {
	test('crops to the circle by default', () => {
		const html = renderToStaticMarkup(<Avatar image='https://cdn.example.org/jane.jpg' />);
		expect(html).toMatch(/<img[^>]*class="[^"]*object-cover/);
		expect(html).not.toMatch(/<img[^>]*class="[^"]*object-contain/);
	});

	test('can be asked to fit instead', () => {
		const html = renderToStaticMarkup(<Avatar image='https://cdn.example.org/logo.png' imageFit='contain' />);
		expect(html).toMatch(/<img[^>]*class="[^"]*object-contain/);
	});

	test('still fills the circle', () => {
		const html = renderToStaticMarkup(<Avatar image='https://cdn.example.org/jane.jpg' />);
		// The wrapper keeps the full-size rules (the ampersand is HTML-escaped in markup).
		expect(html).toMatch(/<div class="h-full w-full \[&(amp;)?_img\]:h-full \[&(amp;)?_img\]:w-full"/);
	});
});
