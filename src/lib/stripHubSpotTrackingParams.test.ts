import { describe, expect, test } from 'bun:test';
import { urlWithoutHubSpotTrackingParams } from './stripHubSpotTrackingParams';

describe('urlWithoutHubSpotTrackingParams', () => {
	test('returns null when no HubSpot params', () => {
		const u = new URL('https://goodparty.org/blog/article/foo?utm_source=x');
		expect(urlWithoutHubSpotTrackingParams(u)).toBeNull();
		expect(u.search).toBe('?utm_source=x');
	});

	test('returns null when search is empty', () => {
		const u = new URL('https://goodparty.org/blog');
		expect(urlWithoutHubSpotTrackingParams(u)).toBeNull();
	});

	test('strips only HubSpot params and removes query when nothing left', () => {
		const u = new URL('https://goodparty.org/p?__hstc=1&__hssc=2&__hsfp=3');
		const next = urlWithoutHubSpotTrackingParams(u);
		expect(next?.href).toBe('https://goodparty.org/p');
		expect(u.search).toBe('?__hstc=1&__hssc=2&__hsfp=3');
	});

	test('strips HubSpot params and preserves others', () => {
		const u = new URL(
			'https://goodparty.org/blog/article/slug?__hstc=a&utm_medium=email&__hsfp=b&foo=bar',
		);
		const next = urlWithoutHubSpotTrackingParams(u);
		expect(next?.pathname).toBe('/blog/article/slug');
		const sp = next?.searchParams;
		expect(sp?.get('utm_medium')).toBe('email');
		expect(sp?.get('foo')).toBe('bar');
		expect(sp?.has('__hstc')).toBe(false);
		expect(sp?.has('__hsfp')).toBe(false);
		expect(sp?.has('__hssc')).toBe(false);
	});

	test('strips one HubSpot param and leaves the rest of query', () => {
		const u = new URL('https://goodparty.org/x?__hstc=1&keep=1');
		const next = urlWithoutHubSpotTrackingParams(u);
		expect(next?.href).toBe('https://goodparty.org/x?keep=1');
	});

	test('does not mutate input URL', () => {
		const href =
			'https://goodparty.org/a?__hstc=1&utm_campaign=z';
		const u = new URL(href);
		urlWithoutHubSpotTrackingParams(u);
		expect(u.href).toBe(href);
	});
});
