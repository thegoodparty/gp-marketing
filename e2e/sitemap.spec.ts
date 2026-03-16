import { expect } from '@playwright/test';
import { test } from '@playwright/test';

const BASE = (process.env['E2E_BASE_URL'] ?? 'https://goodparty.org').replace(/\/+$/, '');
const EXPECTED_ORIGIN = new URL(BASE).origin;

test.describe('Sitemap', () => {
	test('robots.txt references sitemap with correct base URL', async ({ request }) => {
		const res = await request.get(`${BASE}/robots.txt`);
		expect(res.status()).toBe(200);
		const text = await res.text();
		expect(text).toContain(`Sitemap: ${BASE}/sitemap.xml`);
	});

	test('root sitemap.xml returns 200 with XML content-type', async ({ request }) => {
		const res = await request.get(`${BASE}/sitemap.xml`);
		expect(res.status()).toBe(200);
		const ct = res.headers()['content-type'] ?? '';
		expect(ct).toMatch(/xml/);
	});

	test('root sitemap is valid sitemapindex with sitemap children', async ({ request }) => {
		const res = await request.get(`${BASE}/sitemap.xml`);
		expect(res.status()).toBe(200);
		const xml = await res.text();
		expect(xml).toContain('<sitemapindex');
		expect(xml).toContain('</sitemapindex>');
		const locMatches = xml.match(/<loc>([^<]+)<\/loc>/g);
		expect(locMatches?.length).toBeGreaterThan(0);
	});

	test('all sitemap loc URLs use the expected base domain', async ({ request }) => {
		const res = await request.get(`${BASE}/sitemap.xml`);
		expect(res.status()).toBe(200);
		const xml = await res.text();
		const locMatches = xml.match(/<loc>([^<]+)<\/loc>/g);
		expect(locMatches?.length).toBeGreaterThan(0);
		for (const m of locMatches!) {
			const url = m.replace(/<\/?loc>/g, '').trim();
			expect(new URL(url).origin, `URL ${url} should use ${EXPECTED_ORIGIN}`).toBe(EXPECTED_ORIGIN);
		}
	});

	test('child sitemaps use /sitemap/[id].xml format', async ({ request }) => {
		const res = await request.get(`${BASE}/sitemap.xml`);
		expect(res.status()).toBe(200);
		const xml = await res.text();
		const childLocs = xml.match(/<loc>([^<]+)<\/loc>/g) ?? [];
		const childUrls = childLocs.map((m) => m.replace(/<\/?loc>/g, '').trim()).filter((u) => u.includes('/sitemap/') && u.endsWith('.xml'));
		expect(childUrls.length).toBeGreaterThan(0);
		for (const url of childUrls) {
			const pathname = new URL(url).pathname;
			expect(pathname).toMatch(/\/sitemap\/\d+\.xml$/);
		}
	});

	test('all lastmod dates are valid and within last year', async ({ request }) => {
		const res = await request.get(`${BASE}/sitemap.xml`);
		expect(res.status()).toBe(200);
		const xml = await res.text();
		const lastmodMatches = xml.match(/<lastmod>([^<]+)<\/lastmod>/g);
		if (!lastmodMatches) return;
		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
		for (const m of lastmodMatches) {
			const dateStr = m.replace(/<\/?lastmod>/g, '');
			const date = new Date(dateStr);
			expect(date.getTime(), `Invalid date: ${dateStr}`).not.toBeNaN();
			expect(date.getTime(), `Date too old: ${dateStr}`).toBeGreaterThanOrEqual(oneYearAgo.getTime());
		}
	});

	test('sample child sitemaps are accessible with 200 and XML content-type', async ({ request }) => {
		const res = await request.get(`${BASE}/sitemap.xml`);
		expect(res.status()).toBe(200);
		const xml = await res.text();
		const locRegex = /<loc>([^<]+)<\/loc>/g;
		const urls: string[] = [];
		let match: RegExpExecArray | null;
		while ((match = locRegex.exec(xml)) !== null) {
			urls.push(match[1]!.trim());
		}
		const childUrls = urls.filter((u) => /\/sitemap\/\d+\.xml$/.test(new URL(u).pathname));
		expect(childUrls.length, 'Expected at least one child sitemap URL matching /sitemap/[id].xml').toBeGreaterThan(0);
		const sample = childUrls.slice(0, 3);
		for (const url of sample) {
			const urlToFetch = url.startsWith('http') ? url : `${BASE}${url.startsWith('/') ? url : `/${url}`}`;
			const childRes = await request.get(urlToFetch);
			expect(childRes.status(), `Expected 200 for ${urlToFetch}`).toBe(200);
			const ct = childRes.headers()['content-type'] ?? '';
			expect(ct, `Expected XML content-type for ${urlToFetch}`).toMatch(/xml/);
		}
	});
});
