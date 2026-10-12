import { describe, expect, test } from 'bun:test';
import { formatPromoCountdown, promoBannerDismissKey, promoBannerIsLive, promoBannerPrePaintScript, promoBannerShowsOn } from './promoBanner';

describe('promoBannerShowsOn', () => {
	test('shows everywhere when both lists are empty', () => {
		expect(promoBannerShowsOn('/', {})).toBe(true);
		expect(promoBannerShowsOn('/elections/texas', { include: [], exclude: [null, '  '] })).toBe(true);
	});

	test('a hide rule matches the path itself and everything under it', () => {
		const rules = { exclude: ['/elections/'] };
		expect(promoBannerShowsOn('/elections', rules)).toBe(false);
		expect(promoBannerShowsOn('/elections/texas/harris-county', rules)).toBe(false);
		expect(promoBannerShowsOn('/blog', rules)).toBe(true);
	});

	test('rules are fragments, so they match anywhere in the path and ignore case and spaces', () => {
		expect(promoBannerShowsOn('/blog/article/why-run', { exclude: [' Article '] })).toBe(false);
		expect(promoBannerShowsOn('/Elections/Texas', { include: ['/elections/'] })).toBe(true);
	});

	test('an only-show list limits the banner to matching pages', () => {
		const rules = { include: ['/run-for-office', '/blog/'] };
		expect(promoBannerShowsOn('/run-for-office', rules)).toBe(true);
		expect(promoBannerShowsOn('/blog/article/why-run', rules)).toBe(true);
		expect(promoBannerShowsOn('/', rules)).toBe(false);
		expect(promoBannerShowsOn('/elections', rules)).toBe(false);
	});

	test('a bare slash means the homepage only', () => {
		expect(promoBannerShowsOn('/', { include: ['/'] })).toBe(true);
		expect(promoBannerShowsOn('/blog', { include: ['/'] })).toBe(false);
		expect(promoBannerShowsOn('/', { exclude: ['/'] })).toBe(false);
		expect(promoBannerShowsOn('/blog', { exclude: ['/'] })).toBe(true);
	});

	test('hide wins over only-show', () => {
		expect(promoBannerShowsOn('/elections/texas', { include: ['/elections/'], exclude: ['texas'] })).toBe(false);
	});

	test('a trailing slash on the path does not change the answer', () => {
		expect(promoBannerShowsOn('/elections/', { exclude: ['/elections/'] })).toBe(false);
		expect(promoBannerShowsOn('/elections/', { include: ['/'] })).toBe(false);
	});
});

describe('promoBannerIsLive', () => {
	const now = Date.parse('2026-10-12T12:00:00Z');

	test('no schedule means always live', () => {
		expect(promoBannerIsLive({}, now)).toBe(true);
		expect(promoBannerIsLive({ startsAt: null, endsAt: '' }, now)).toBe(true);
	});

	test('waits for the start and stops at the end', () => {
		expect(promoBannerIsLive({ startsAt: '2026-10-13T00:00:00Z' }, now)).toBe(false);
		expect(promoBannerIsLive({ startsAt: '2026-10-12T00:00:00Z' }, now)).toBe(true);
		expect(promoBannerIsLive({ endsAt: '2026-10-12T12:00:00Z' }, now)).toBe(false);
		expect(promoBannerIsLive({ endsAt: '2026-10-12T12:00:01Z' }, now)).toBe(true);
	});

	test('an unreadable date is ignored rather than hiding the banner', () => {
		expect(promoBannerIsLive({ startsAt: 'soon', endsAt: 'later' }, now)).toBe(true);
	});
});

describe('promoBannerDismissKey', () => {
	test('is stable for the same promo and changes when the promo changes', () => {
		const key = promoBannerDismissKey({ text: 'Run in 2027', href: '/run-for-office', startsAt: null });
		expect(promoBannerDismissKey({ text: 'Run in 2027', href: '/run-for-office', startsAt: null })).toBe(key);
		expect(promoBannerDismissKey({ text: 'Run in 2028', href: '/run-for-office', startsAt: null })).not.toBe(key);
		expect(promoBannerDismissKey({ text: 'Run in 2027', href: '/pricing', startsAt: null })).not.toBe(key);
		expect(promoBannerDismissKey({ text: 'Run in 2027', href: '/run-for-office', startsAt: '2026-11-01T00:00:00Z' })).not.toBe(key);
	});
});

describe('promoBannerPrePaintScript', () => {
	test('bakes the key and schedule in and escapes the key', () => {
		const script = promoBannerPrePaintScript({ dismissKey: 'ab"c', startsAt: '2026-10-12T00:00:00Z', endsAt: null });
		expect(script).toContain('"ab\\"c"');
		expect(script).toContain(`${Date.parse('2026-10-12T00:00:00Z')}!==null`);
		expect(script).toContain('null!==null');
		expect(script).toContain('{display:none}');
	});
});

describe('formatPromoCountdown', () => {
	const now = Date.parse('2026-10-12T12:00:00Z');

	test('shows days with a zero-padded clock, and only the clock inside the last day', () => {
		expect(formatPromoCountdown('2026-10-15T16:12:09Z', now)).toBe('3d 04:12:09');
		expect(formatPromoCountdown('2026-10-12T12:05:00Z', now)).toBe('00:05:00');
		expect(formatPromoCountdown('2026-10-13T11:59:59Z', now)).toBe('23:59:59');
	});

	test('is null once the moment has passed, at the moment itself, or without a readable date', () => {
		expect(formatPromoCountdown('2026-10-12T11:59:59Z', now)).toBe(null);
		expect(formatPromoCountdown('2026-10-12T12:00:00Z', now)).toBe(null);
		expect(formatPromoCountdown('whenever', now)).toBe(null);
		expect(formatPromoCountdown(null, now)).toBe(null);
	});

	test('rounds partial seconds down so the display never shows a second it has already passed', () => {
		expect(formatPromoCountdown('2026-10-12T12:00:01.900Z', now)).toBe('00:00:01');
	});
});
