import { describe, expect, test } from 'bun:test';
import {
	buildPageUrls,
	categorizeResults,
	checkContent,
	extractTitleAndDescription,
	type PageCheckResult,
} from './validate-election-pages';

function result(url: string, invalid: string[] = [], status = 200): PageCheckResult {
	return {
		url,
		status,
		durationMs: 100,
		invalid,
	};
}

describe('categorizeResults', () => {
	test('all valid: valid equals total, invalid and errors are 0', () => {
		const checked = [
			{ result: result('https://a.com/1') },
			{ result: result('https://a.com/2') },
			{ result: result('https://a.com/3') },
		];
		const { summary } = categorizeResults(checked);
		expect(summary.total).toBe(3);
		expect(summary.valid).toBe(3);
		expect(summary.invalid).toBe(0);
		expect(summary.errors).toBe(0);
	});

	test('some invalid: correct split', () => {
		const checked = [
			{ result: result('https://a.com/1') },
			{ result: result('https://a.com/2', ['buckeye County']) },
			{ result: result('https://a.com/3') },
		];
		const { invalid, summary } = categorizeResults(checked);
		expect(summary.total).toBe(3);
		expect(summary.valid).toBe(2);
		expect(summary.invalid).toBe(1);
		expect(summary.errors).toBe(0);
		expect(invalid).toHaveLength(1);
		expect(invalid[0]?.url).toBe('https://a.com/2');
	});

	test('some errors: correct split', () => {
		const checked = [
			{ result: result('https://a.com/1') },
			{ result: result('https://a.com/2', ['fetch failed']), error: 'AbortError' },
			{ result: result('https://a.com/3') },
		];
		const { errors, summary } = categorizeResults(checked);
		expect(summary.total).toBe(3);
		expect(summary.valid).toBe(2);
		expect(summary.invalid).toBe(0);
		expect(summary.errors).toBe(1);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.url).toBe('https://a.com/2');
	});

	test('fetch failure: counted only as error, not double-counted in invalid', () => {
		const checked = [
			{
				result: result('https://a.com/fail', ['fetch failed'], 0),
				error: 'The operation was aborted',
			},
		];
		const { invalid, errors, summary } = categorizeResults(checked);
		expect(summary.total).toBe(1);
		expect(summary.valid).toBe(0);
		expect(summary.invalid).toBe(0);
		expect(summary.errors).toBe(1);
		expect(invalid).toHaveLength(0);
		expect(errors).toHaveLength(1);
	});

	test('all errors: valid is 0, never negative', () => {
		const checked = [
			{ result: result('https://a.com/1', ['fetch failed'], 0), error: 'timeout' },
			{ result: result('https://a.com/2', ['fetch failed'], 0), error: 'timeout' },
			{ result: result('https://a.com/3', ['fetch failed'], 0), error: 'timeout' },
		];
		const { summary } = categorizeResults(checked);
		expect(summary.total).toBe(3);
		expect(summary.valid).toBe(0);
		expect(summary.invalid).toBe(0);
		expect(summary.errors).toBe(3);
		expect(summary.valid).toBeGreaterThanOrEqual(0);
	});

	test('invariant: total === valid + invalid + errors always holds', () => {
		const checked = [
			{ result: result('https://a.com/1') },
			{ result: result('https://a.com/2', ['buckeye County']) },
			{ result: result('https://a.com/3', ['fetch failed'], 0), error: 'AbortError' },
			{ result: result('https://a.com/4') },
		];
		const { summary } = categorizeResults(checked);
		expect(summary.total).toBe(summary.valid + summary.invalid + summary.errors);
	});

	test('mixed valid, invalid, and errors: invariant holds', () => {
		const checked = [
			{ result: result('https://a.com/1') },
			{ result: result('https://a.com/2') },
			{ result: result('https://a.com/3', ['undefined']) },
			{ result: result('https://a.com/4', ['fetch failed'], 0), error: 'timeout' },
			{ result: result('https://a.com/5') },
		];
		const { summary } = categorizeResults(checked);
		expect(summary.total).toBe(5);
		expect(summary.valid).toBe(3);
		expect(summary.invalid).toBe(1);
		expect(summary.errors).toBe(1);
		expect(summary.total).toBe(summary.valid + summary.invalid + summary.errors);
	});

	test('empty checked: invariant holds', () => {
		const { summary } = categorizeResults([]);
		expect(summary.total).toBe(0);
		expect(summary.valid).toBe(0);
		expect(summary.invalid).toBe(0);
		expect(summary.errors).toBe(0);
		expect(summary.total).toBe(summary.valid + summary.invalid + summary.errors);
	});
});

describe('checkContent', () => {
	test('passes clean content', () => {
		expect(checkContent('Elections in Phoenix, Maricopa County, Arizona')).toEqual([]);
		expect(checkContent('Governor Race in Phoenix')).toEqual([]);
	});

	test('detects lowercase word + County (broken fallback)', () => {
		const matches = checkContent('buckeye County elections');
		expect(matches.length).toBeGreaterThan(0);
		expect(matches.some(m => m.includes('County'))).toBe(true);
	});

	test('detects undefined', () => {
		const matches = checkContent('Title: undefined | Good Party');
		expect(matches.length).toBeGreaterThan(0);
		expect(matches.some(m => /undefined/i.test(m))).toBe(true);
	});

	test('detects null', () => {
		const matches = checkContent('Description: null');
		expect(matches.length).toBeGreaterThan(0);
		expect(matches.some(m => /null/i.test(m))).toBe(true);
	});

	test('detects [object', () => {
		const matches = checkContent('[object Object] in title');
		expect(matches.length).toBeGreaterThan(0);
		expect(matches.some(m => m.includes('[object'))).toBe(true);
	});

	test('returns empty when no patterns match', () => {
		expect(checkContent('')).toEqual([]);
		expect(checkContent('Yuma County')).toEqual([]);
	});
});

describe('extractTitleAndDescription', () => {
	test('parses title from HTML', () => {
		const html = '<html><head><title>Elections in Phoenix | Good Party</title></head></html>';
		const { title, description } = extractTitleAndDescription(html);
		expect(title).toBe('Elections in Phoenix | Good Party');
		expect(description).toBeUndefined();
	});

	test('parses meta description from HTML', () => {
		const html = '<html><head><meta name="description" content="Browse elections in Phoenix."></head></html>';
		const { title, description } = extractTitleAndDescription(html);
		expect(title).toBeUndefined();
		expect(description).toBe('Browse elections in Phoenix.');
	});

	test('parses both title and description', () => {
		const html = '<html><head><title>Phoenix</title><meta name="description" content="Elections."></head></html>';
		const { title, description } = extractTitleAndDescription(html);
		expect(title).toBe('Phoenix');
		expect(description).toBe('Elections.');
	});

	test('handles single-quoted meta attribute', () => {
		const html = '<meta name=\'description\' content=\'Single quotes\' />';
		const { description } = extractTitleAndDescription(html);
		expect(description).toBe('Single quotes');
	});

	test('returns undefined for empty or missing HTML', () => {
		expect(extractTitleAndDescription('')).toEqual({ title: undefined, description: undefined });
		expect(extractTitleAndDescription('<html></html>')).toEqual({ title: undefined, description: undefined });
	});
});

describe('buildPageUrls', () => {
	const baseUrl = 'https://goodparty.org';

	test('builds position and candidates URLs from race slugs', () => {
		const racesByState = new Map<string, Array<{ slug?: string }>>([
			['AZ', [{ slug: 'az/maricopa-county/governor' }]],
		]);
		const urls = buildPageUrls(baseUrl, racesByState, 10);
		expect(urls).toContain(`${baseUrl}/elections/az/maricopa-county/position/governor`);
		expect(urls).toContain(`${baseUrl}/elections/az/maricopa-county/position/governor/candidates`);
	});

	test('respects samplePerState limit', () => {
		const racesByState = new Map<string, Array<{ slug?: string }>>([
			['AZ', [
				{ slug: 'az/maricopa-county/race1' },
				{ slug: 'az/maricopa-county/race2' },
				{ slug: 'az/maricopa-county/race3' },
			]],
		]);
		const urls = buildPageUrls(baseUrl, racesByState, 4);
		expect(urls.length).toBe(4);
	});

	test('deduplicates paths', () => {
		const racesByState = new Map<string, Array<{ slug?: string }>>([
			['AZ', [
				{ slug: 'az/maricopa-county/governor' },
				{ slug: 'az/maricopa-county/governor' },
			]],
		]);
		const urls = buildPageUrls(baseUrl, racesByState, 10);
		expect(urls.filter(u => u.includes('/governor'))).toHaveLength(2);
	});

	test('skips races without slug', () => {
		const racesByState = new Map<string, Array<{ slug?: string }>>([
			['AZ', [{ slug: undefined }, { slug: 'az/maricopa-county/governor' }]],
		]);
		const urls = buildPageUrls(baseUrl, racesByState, 10);
		expect(urls).toHaveLength(2);
	});

	test('handles multiple states', () => {
		const racesByState = new Map<string, Array<{ slug?: string }>>([
			['AZ', [{ slug: 'az/maricopa-county/governor' }]],
			['CA', [{ slug: 'ca/los-angeles-county/mayor' }]],
		]);
		const urls = buildPageUrls(baseUrl, racesByState, 10);
		expect(urls).toContain(`${baseUrl}/elections/az/maricopa-county/position/governor`);
		expect(urls).toContain(`${baseUrl}/elections/ca/los-angeles-county/position/mayor`);
	});

	test('returns empty when no races', () => {
		const racesByState = new Map<string, Array<{ slug?: string }>>([
			['AZ', []],
		]);
		expect(buildPageUrls(baseUrl, racesByState, 10)).toEqual([]);
	});
});
