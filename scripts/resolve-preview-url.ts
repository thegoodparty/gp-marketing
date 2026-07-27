#!/usr/bin/env bun
/**
 * Resolves the Vercel Preview deployment URL for a commit SHA via the GitHub
 * Deployments API and prints it to stdout. Used by the CI e2e job so tests run
 * against the pull request's own preview deployment instead of a fixed URL.
 *
 * Usage:
 *   GITHUB_TOKEN=$(gh auth token) bun run scripts/resolve-preview-url.ts <sha>
 *
 * Environment variables:
 *   GITHUB_REPOSITORY   owner/repo (default: thegoodparty/gp-marketing)
 *   GITHUB_TOKEN        Token with deployments:read (required)
 *   E2E_BASE_URL        If set, printed as-is and no API calls are made —
 *                       manual override for workflow_dispatch runs.
 *   PREVIEW_TIMEOUT_MS  Total time to wait for a successful deployment
 *                       (default: 600000 = 10 minutes)
 *
 * Exit code: 0 with the URL on stdout, 1 on timeout or missing configuration.
 */

const override = process.env['E2E_BASE_URL'];
if (override) {
	console.log(override.replace(/\/+$/, ''));
	process.exit(0);
}

const REPO = process.env['GITHUB_REPOSITORY'] ?? 'thegoodparty/gp-marketing';
const TOKEN = process.env['GITHUB_TOKEN'];
const SHA = process.argv[2];
const TIMEOUT_MS = Number(process.env['PREVIEW_TIMEOUT_MS']) || 600_000;
const POLL_INTERVAL_MS = 15_000;

if (!TOKEN) {
	console.error('Error: GITHUB_TOKEN is required (deployments:read).');
	process.exit(1);
}
if (!SHA) {
	console.error('Error: commit SHA argument is required.\n  Usage: bun run scripts/resolve-preview-url.ts <sha>');
	process.exit(1);
}

async function githubApi<T>(path: string): Promise<T> {
	const res = await fetch(`https://api.github.com${path}`, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${TOKEN}`,
			'X-GitHub-Api-Version': '2022-11-28',
		},
	});
	if (!res.ok) {
		throw new Error(`GitHub API ${path} failed: ${res.status} ${await res.text()}`);
	}
	return res.json() as Promise<T>;
}

type Deployment = { id: number; environment: string };
type DeploymentStatus = { state: string; environment_url: string | null };

async function findPreviewUrl(): Promise<string | null> {
	const deployments = await githubApi<Deployment[]>(
		`/repos/${REPO}/deployments?sha=${SHA}&environment=Preview&per_page=5`,
	);
	for (const deployment of deployments) {
		const statuses = await githubApi<DeploymentStatus[]>(
			`/repos/${REPO}/deployments/${deployment.id}/statuses?per_page=10`,
		);
		const failed = statuses.find(s => s.state === 'failure' || s.state === 'error');
		if (failed) {
			throw new Error(`Preview deployment ${deployment.id} for ${SHA} failed — aborting.`);
		}
		const success = statuses.find(s => s.state === 'success' && s.environment_url);
		if (success?.environment_url) return success.environment_url;
	}
	return null;
}

const deadline = Date.now() + TIMEOUT_MS;
let url: string | null = null;
while (Date.now() < deadline) {
	url = await findPreviewUrl();
	if (url) break;
	console.error(`Waiting for Preview deployment of ${SHA.slice(0, 7)}…`);
	await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
}

if (!url) {
	console.error(`Error: no successful Preview deployment for ${SHA} within ${TIMEOUT_MS / 1000}s.`);
	process.exit(1);
}

console.log(url.replace(/\/+$/, ''));
