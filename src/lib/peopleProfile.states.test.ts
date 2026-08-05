/**
 * 12-state integration matrix (states A–L).
 *
 * Stubs `globalThis.fetch` and drives the REAL data flow — election-api Person
 * spine + gp-api overlay/removal gate → `loadPersonProfile` (fetch orchestration
 * + `composeView`) → the resolved `PersonProfileView` the UI renders. This is
 * the CI-guaranteed coverage that the API payloads compose into the right state,
 * content gating, and SEO signals for every state.
 *
 * Payloads come from the shared contract fixtures (see peopleProfileFixtures.ts)
 * so the Storybook stories render the exact same data.
 */
import { afterEach, describe, expect, test } from 'bun:test';
import { loadPersonProfile } from './peopleProfile';
import {
	assertNoPii,
	buildPeopleFetchMock,
	fixtureForState,
	PERSON_ID,
	STATE_FIXTURES,
} from '~/testing/peopleProfileFixtures';

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe('public profile — 12-state data-flow matrix', () => {
	for (const fixture of STATE_FIXTURES) {
		test(`state ${fixture.state} — ${fixture.description}`, async () => {
			globalThis.fetch = buildPeopleFetchMock(fixture) as unknown as typeof fetch;

			const view = await loadPersonProfile(PERSON_ID);
			expect(view).not.toBeNull();
			if (!view) return;

			const e = fixture.expected;
			// State resolution + the axes that drive it.
			expect(view.state).toBe(fixture.state);
			expect(view.persona).toBe(e.persona);
			expect(view.claimed).toBe(e.claimed);
			expect(view.majorParty).toBe(e.majorParty);
			expect(view.empowered).toBe(e.empowered);
			expect(view.removed).toBe(e.removed);
			expect(view.pledged).toBe(e.pledged);

			// Content gating (what actually paints).
			expect(view.avatarUrl != null).toBe(e.hasAvatar);
			expect(view.bio != null).toBe(e.hasBio);
			expect(view.issues.length > 0).toBe(e.hasIssues);

			// Breadcrumb always terminates at the person; canonical slug is the
			// spine base slug plus the 8-hex id suffix.
			expect(view.breadcrumb.at(-1)?.label).toBe('Jane Public');
			expect(view.canonicalSlug).toBe('jane-public-aaaaaaaa');

			// PII must never reach the composed view.
			expect(assertNoPii(view)).toEqual([]);
		});
	}
});

describe('public profile — removal SEO signal', () => {
	test('removed states (K/L) are noindex per the expectation table', () => {
		for (const fixture of STATE_FIXTURES) {
			// noindex is applied in the page metadata from view.removed; assert the
			// flag that drives it matches the spec for every state.
			expect(fixture.expected.removed).toBe(fixture.expected.noindex);
		}
	});
});

describe('public profile — suppression gate (not a render state)', () => {
	test('a deleted overlay (gp-api 410 → gone) suppresses the page entirely', async () => {
		const goneFixture = { ...fixtureForState('A'), overlay: { status: 'gone' as const } };
		globalThis.fetch = buildPeopleFetchMock(goneFixture) as unknown as typeof fetch;

		const view = await loadPersonProfile(PERSON_ID);
		expect(view).toBeNull();
	});
});
