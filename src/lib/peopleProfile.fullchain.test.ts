/**
 * Full-chain content-fidelity test (the UI end of election-api → gp-api →
 * gp-marketing).
 *
 * The 12-state matrix (peopleProfile.states.test.ts) proves each API payload
 * composes into the right STATE and gating. This complements it by proving the
 * DATA itself threads through verbatim for a rich published profile: the spine
 * identity, the overlay's authored content winning over the spine, the live
 * Serve issue STATUS, and the voter-density cells the map renders from. A field
 * that's merely "present" but wired to the wrong source would pass the matrix
 * and fail here.
 *
 * Same seam as the matrix: `globalThis.fetch` is stubbed at the HTTP boundary
 * (election-api Person spine + gp-api overlay + gp-api voter-density proxy), and
 * the REAL `loadPersonProfile` orchestration + `composeView` runs unmodified.
 */
import { afterEach, describe, expect, test } from 'bun:test';
import { loadPersonProfile } from './peopleProfile';
import {
	buildPeopleFetchMock,
	fixtureForState,
	PERSON_ID,
} from '~/testing/peopleProfileFixtures';
import type { VoterDensity } from '~/types/people';

const originalFetch = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = originalFetch;
});

// Aggregated, k-anonymized cells as the gp-api proxy would return them (people-
// api upstream). Deliberately non-empty so the map surface is exercised — the
// matrix stubs this endpoint to 404.
const DENSITY: VoterDensity = {
	coverage: 0.82,
	cells: [
		{ lat: 34.05, lng: -118.24, count: 120 },
		{ lat: 34.06, lng: -118.25, count: 45 },
	],
};

describe('public profile — full-chain content fidelity (claimed officeholder)', () => {
	test('spine + overlay + live issue status + voter density all thread through to the view', async () => {
		// State B: claimed officeholder with a rich published overlay + one visible
		// IN_PROGRESS priority.
		const fixture = fixtureForState('B');
		const base = buildPeopleFetchMock(fixture);
		globalThis.fetch = (async (
			input: RequestInfo | URL,
			init?: RequestInit,
		): Promise<Response> => {
			const url = String(input);
			if (url.includes('/public-person-profiles/voter-density')) {
				return {
					ok: true,
					status: 200,
					json: async () => DENSITY,
				} as unknown as Response;
			}
			return base(input, init);
		}) as unknown as typeof fetch;

		const view = await loadPersonProfile(PERSON_ID);
		expect(view).not.toBeNull();
		if (!view) return;

		// Identity: the overlay left displayName null, so the spine full name wins.
		expect(view.displayName).toBe('Jane Public');

		// Authored overlay content wins over the spine and threads through verbatim.
		expect(view.bio).toBe('Authored bio from the claimed profile.');
		expect(view.whyRunning).toBe('To make local government work for everyone.');
		expect(view.avatarUrl).toBe('https://cdn.example.org/jane-overlay.jpg');

		// The published, visible priority reaches the UI WITH its live Serve status
		// and transparency label — the whole point of the issues pipeline.
		expect(view.issues).toHaveLength(1);
		expect(view.issues[0]).toMatchObject({
			title: 'Affordable Housing',
			status: 'IN_PROGRESS',
			transparency: 'Verified',
		});

		// Voter-density cells (election-api district resolve → gp-api proxy →
		// people-api) compose onto the view the map renders from.
		expect(view.voterDensity).not.toBeNull();
		expect(view.voterDensity?.coverage).toBe(0.82);
		expect(view.voterDensity?.cells).toHaveLength(2);
		expect(view.voterDensity?.cells[0]).toMatchObject({ count: 120 });

		// The whole-chain guarantee the matrix also enforces: no spine PII leaks.
		expect(
			JSON.stringify(view).includes('"email"') ||
				JSON.stringify(view).includes('"phone"'),
		).toBe(false);
	});
});
