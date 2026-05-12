#!/usr/bin/env bun
/**
 * After `next build`, optionally verifies HTML canonical links point at https://goodparty.org/
 * when this deployment targets the public site (getBaseUrl() === https://goodparty.org).
 * Skips on Vercel preview and when NEXT_PUBLIC_SITE_URL points at a non-production host.
 */

import { spawn } from 'node:child_process';
import { getBaseUrl } from '../src/lib/siteBaseUrl';

const PRODUCTION_ORIGIN = 'https://goodparty.org';
const SAMPLE_PATHS = ['/', '/blog', '/blog/article/20-reasons-to-run'];

function shouldRunCheck(): boolean {
	if (process.env['SKIP_CANONICAL_CHECK'] === '1') return false;
	if (process.env['VERCEL_ENV'] === 'preview') return false;
	return getBaseUrl() === PRODUCTION_ORIGIN;
}

function extractCanonical(html: string): string | null {
	const patterns = [
		/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
		/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i,
	];
	for (const re of patterns) {
		const m = html.match(re);
		if (m?.[1]) return m[1];
	}
	return null;
}

async function waitForHttpOk(origin: string, maxMs: number): Promise<void> {
	const deadline = Date.now() + maxMs;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(`${origin}/`, { redirect: 'follow' });
			if (res.ok || res.status === 404) return;
		} catch {
			/* retry */
		}
		await new Promise(r => setTimeout(r, 400));
	}
	throw new Error(`Server at ${origin} did not become ready within ${maxMs}ms`);
}

async function main() {
	if (!shouldRunCheck()) {
		console.log('[check-canonicals] Skipping (not a goodparty.org production base or SKIP_CANONICAL_CHECK=1)');
		return;
	}

	const port = process.env['CANONICAL_CHECK_PORT'] ?? '3010';
	const origin = `http://127.0.0.1:${port}`;

	const child = spawn('bun', ['run', 'start', '--', '-p', port], {
		cwd: process.cwd(),
		stdio: ['ignore', 'pipe', 'pipe'],
		env: { ...process.env, PORT: port },
	});

	const onExit = new Promise<number>((resolve, reject) => {
		child.once('error', reject);
		child.once('exit', (code) => resolve(code ?? 0));
	});

	try {
		await waitForHttpOk(origin, 90_000);

		const failures: string[] = [];
		for (const path of SAMPLE_PATHS) {
			const res = await fetch(`${origin}${path}`, { redirect: 'follow' });
			const html = await res.text();
			const canonical = extractCanonical(html);
			if (!canonical) {
				failures.push(`${path}: no canonical link found`);
				continue;
			}
			if (!canonical.startsWith(`${PRODUCTION_ORIGIN}/`) && canonical !== PRODUCTION_ORIGIN) {
				failures.push(`${path}: canonical is ${canonical}`);
			}
		}

		if (failures.length > 0) {
			throw new Error(`Canonical check failed:\n${failures.join('\n')}`);
		}
		console.log('[check-canonicals] OK for paths:', SAMPLE_PATHS.join(', '));
	} finally {
		child.kill('SIGTERM');
		await onExit;
	}
}

main().catch(err => {
	console.error(err instanceof Error ? err.message : err);
	process.exit(1);
});
