import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { writeTokenToVercel } from './rotate-election-api-token';

type VercelCall = { method: string; path: string; body: Record<string, unknown> | null };

const originalFetch = globalThis.fetch;
const GP_MARKETING = { projectId: 'prj_marketing', envKey: 'ELECTION_API_M2M_TOKEN' };
const CANDIDATE_SITES = { projectId: 'prj_candidate_sites', envKey: 'GP_API_M2M_TOKEN' };

const mockVercel = (envsByProject: Record<string, Array<Record<string, unknown>>>): VercelCall[] => {
	const calls: VercelCall[] = [];
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = new URL(String(input));
		const method = init?.method ?? 'GET';
		calls.push({ method, path: url.pathname, body: init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : null });
		const listMatch = method === 'GET' ? url.pathname.match(/^\/v9\/projects\/([^/]+)\/env$/) : null;
		const body = listMatch ? { envs: envsByProject[listMatch[1] ?? ''] ?? [], pagination: { next: null } } : {};
		return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
	}) as typeof fetch;
	return calls;
};

let logSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
	logSpy = spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
	logSpy.mockRestore();
	globalThis.fetch = originalFetch;
});

describe('writeTokenToVercel', () => {
	test('writes the same token to gp-marketing and candidate-sites under each project’s own key', async () => {
		const calls = mockVercel({
			prj_marketing: [
				{ id: 'env_prod', key: 'ELECTION_API_M2M_TOKEN', target: ['production'], type: 'sensitive' },
				{ id: 'env_other', key: 'SOMETHING_ELSE', target: ['production'], type: 'encrypted' },
			],
			prj_candidate_sites: [{ id: 'env_cs_prod', key: 'GP_API_M2M_TOKEN', target: 'production', type: 'encrypted' }],
		});

		await writeTokenToVercel([GP_MARKETING, CANDIDATE_SITES], 'new-jwt', 'vercel-token', 'team_x');

		const writes = calls.filter(c => c.method !== 'GET');
		expect(writes).toEqual([
			{ method: 'PATCH', path: '/v9/projects/prj_marketing/env/env_prod', body: { value: 'new-jwt', type: 'sensitive' } },
			{
				method: 'POST',
				path: '/v10/projects/prj_marketing/env',
				body: { key: 'ELECTION_API_M2M_TOKEN', value: 'new-jwt', type: 'sensitive', target: ['preview'] },
			},
			{
				method: 'POST',
				path: '/v10/projects/prj_marketing/env',
				body: { key: 'ELECTION_API_M2M_TOKEN', value: 'new-jwt', type: 'encrypted', target: ['development'] },
			},
			{ method: 'PATCH', path: '/v9/projects/prj_candidate_sites/env/env_cs_prod', body: { value: 'new-jwt', type: 'sensitive' } },
			{
				method: 'POST',
				path: '/v10/projects/prj_candidate_sites/env',
				body: { key: 'GP_API_M2M_TOKEN', value: 'new-jwt', type: 'sensitive', target: ['preview'] },
			},
			{
				method: 'POST',
				path: '/v10/projects/prj_candidate_sites/env',
				body: { key: 'GP_API_M2M_TOKEN', value: 'new-jwt', type: 'encrypted', target: ['development'] },
			},
		]);
	});

	test('a mixed-type entry in candidate-sites aborts before gp-marketing is written', async () => {
		const calls = mockVercel({
			prj_marketing: [{ id: 'env_prod', key: 'ELECTION_API_M2M_TOKEN', target: ['production'], type: 'sensitive' }],
			prj_candidate_sites: [{ id: 'env_mixed', key: 'GP_API_M2M_TOKEN', target: ['production', 'development'], type: 'encrypted' }],
		});

		await expect(writeTokenToVercel([GP_MARKETING, CANDIDATE_SITES], 'new-jwt', 'vercel-token', 'team_x')).rejects.toThrow(
			'env_mixed in prj_candidate_sites',
		);
		expect(calls.filter(c => c.method !== 'GET')).toEqual([]);
	});

	test('with only gp-marketing targeted, candidate-sites is never touched', async () => {
		const calls = mockVercel({ prj_marketing: [] });

		await writeTokenToVercel([GP_MARKETING], 'new-jwt', 'vercel-token', 'team_x');

		expect(calls.some(c => c.path.includes('prj_candidate_sites'))).toBe(false);
		expect(calls.filter(c => c.method === 'POST')).toHaveLength(3);
	});
});
