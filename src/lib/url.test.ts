import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { getBaseUrl, toAbsoluteUrl } from './url';

const envKeys = ['NEXT_PUBLIC_APP_BASE', 'NEXT_PUBLIC_SITE_URL', 'VERCEL_ENV', 'VERCEL_URL', 'NODE_ENV'] as const;

let snapshot: Partial<Record<(typeof envKeys)[number], string | undefined>>;

beforeEach(() => {
	snapshot = {};
	for (const k of envKeys) {
		snapshot[k] = process.env[k];
	}
});

afterEach(() => {
	for (const k of envKeys) {
		const v = snapshot[k];
		if (v === undefined) delete process.env[k];
		else process.env[k] = v;
	}
});

describe('getBaseUrl', () => {
	test('strips whitespace and newlines from explicit site URL', () => {
		process.env['NODE_ENV'] = 'development';
		delete process.env['VERCEL_ENV'];
		process.env['NEXT_PUBLIC_SITE_URL'] = '  https://goodparty.org\n  ';
		expect(getBaseUrl()).toBe('https://goodparty.org');
	});

	test('prefixes https when scheme omitted', () => {
		process.env['NODE_ENV'] = 'development';
		delete process.env['VERCEL_ENV'];
		process.env['NEXT_PUBLIC_SITE_URL'] = 'www.example.org';
		expect(getBaseUrl()).toBe('https://www.example.org');
	});

	test('production rejects *.vercel.app explicit URL and falls back to goodparty.org', () => {
		process.env['NODE_ENV'] = 'production';
		process.env['VERCEL_ENV'] = 'production';
		process.env['NEXT_PUBLIC_SITE_URL'] = 'https://gp-marketing-abc.vercel.app';
		expect(getBaseUrl()).toBe('https://goodparty.org');
	});

	test('production allows non-Vercel explicit URL', () => {
		process.env['NODE_ENV'] = 'production';
		process.env['VERCEL_ENV'] = 'production';
		process.env['NEXT_PUBLIC_SITE_URL'] = 'https://www.goodparty.org';
		expect(getBaseUrl()).toBe('https://www.goodparty.org');
	});

	test('preview uses VERCEL_URL when site URL unset', () => {
		process.env['NODE_ENV'] = 'production';
		process.env['VERCEL_ENV'] = 'preview';
		delete process.env['NEXT_PUBLIC_SITE_URL'];
		delete process.env['NEXT_PUBLIC_APP_BASE'];
		process.env['VERCEL_URL'] = 'gp-marketing-abc-good-party.vercel.app';
		expect(getBaseUrl()).toBe('https://gp-marketing-abc-good-party.vercel.app');
	});

	test('NEXT_PUBLIC_APP_BASE wins over NEXT_PUBLIC_SITE_URL', () => {
		process.env['NODE_ENV'] = 'development';
		delete process.env['VERCEL_ENV'];
		process.env['NEXT_PUBLIC_APP_BASE'] = 'https://from-app-base.example';
		process.env['NEXT_PUBLIC_SITE_URL'] = 'https://from-site-url.example';
		expect(getBaseUrl()).toBe('https://from-app-base.example');
	});

	test('defaults to goodparty.org when unset (non-preview)', () => {
		process.env['NODE_ENV'] = 'development';
		delete process.env['VERCEL_ENV'];
		delete process.env['NEXT_PUBLIC_SITE_URL'];
		delete process.env['NEXT_PUBLIC_APP_BASE'];
		delete process.env['VERCEL_URL'];
		expect(getBaseUrl()).toBe('https://goodparty.org');
	});
});

describe('toAbsoluteUrl', () => {
	test('joins path with base', () => {
		process.env['NODE_ENV'] = 'development';
		delete process.env['VERCEL_ENV'];
		process.env['NEXT_PUBLIC_SITE_URL'] = 'https://goodparty.org';
		expect(toAbsoluteUrl('/blog')).toBe('https://goodparty.org/blog');
	});

	test('passes through absolute URLs', () => {
		process.env['NODE_ENV'] = 'development';
		expect(toAbsoluteUrl('https://elsewhere.example/x')).toBe('https://elsewhere.example/x');
	});
});
