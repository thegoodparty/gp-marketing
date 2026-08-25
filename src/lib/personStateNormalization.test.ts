import { describe, expect, test } from 'bun:test';
import { normalizeStateCode } from '~/constants/usStateCodes';
import { US_STATES_TUPLES } from '~/constants/usStates';
import { buildBreadcrumbTrail } from '~/lib/peopleProfile';

/**
 * `Person.state` is a two-letter code by contract — the breadcrumb lowercases it
 * into `/elections/<code>` and the profile's JSON-LD uses it for schema.org
 * `addressRegion` — but the mart does not guarantee one.
 *
 * Rows sourced from BallotReady carry `MN`. Rows the ETL creates from a gp-api
 * account carry `Minnesota`, gp-api's own format passed through: 24,619 rows on
 * 2026-08-25, of which 24,385 are gp-api users, 18,893 took the pledge, and
 * zero have any candidacy or office term. Every one of those pages linked to
 * `/elections/minnesota` (or /california, /texas...), which 404s, while
 * `/elections/mn` serves 200 — including on the published, indexable profiles.
 */

describe('a spelled-out state normalizes to the code the routes expect', () => {
	test('every state resolves from its full name as well as its code', () => {
		for (const [code, name] of US_STATES_TUPLES) {
			expect([name, normalizeStateCode(name)]).toEqual([name, code]);
			expect([code, normalizeStateCode(code)]).toEqual([code, code]);
		}
	});

	test('spelling and padding do not matter', () => {
		expect(normalizeStateCode('minnesota')).toBe('MN');
		expect(normalizeStateCode('  Minnesota  ')).toBe('MN');
		expect(normalizeStateCode('mn')).toBe('MN');
		// Multi-word names are the ones most likely to be typo'd upstream.
		expect(normalizeStateCode('north carolina')).toBe('NC');
		expect(normalizeStateCode('District of Columbia')).toBe('DC');
	});

	test('an unplaceable value is null, not something that looks like a code', () => {
		// Returning the input would put the 404 back: the caller cannot tell a
		// real code from a passthrough, which is exactly how `Minnesota` shipped.
		expect(normalizeStateCode('Puerto Rico')).toBeNull();
		expect(normalizeStateCode('XX')).toBeNull();
		expect(normalizeStateCode('')).toBeNull();
		expect(normalizeStateCode(null)).toBeNull();
		expect(normalizeStateCode(undefined)).toBeNull();
	});
});

describe('the breadcrumb links somewhere that exists', () => {
	const crumbs = (stateCode: string | null) =>
		buildBreadcrumbTrail({
			displayName: 'DeVelle Jackson',
			stateCode,
			raceSlug: null,
			positionLevel: null,
			positionName: null,
		});

	test('a code-spelled state builds the state URL', () => {
		expect(crumbs('MN')[1]).toEqual({ href: '/elections/mn', label: 'Minnesota' });
	});

	test('a normalized full name builds the same URL, not /elections/minnesota', () => {
		// The regression: `Minnesota`.toLowerCase() is a 404. Callers normalize
		// before handing the value over, so the trail only ever sees a code.
		const state = normalizeStateCode('Minnesota');
		expect(state).toBe('MN');
		expect(crumbs(state)[1]).toEqual({ href: '/elections/mn', label: 'Minnesota' });
	});

	test('no state at all drops the crumb rather than linking nowhere', () => {
		const trail = crumbs(normalizeStateCode('Puerto Rico'));
		expect(trail.map((c) => c.label)).toEqual(['Elections', 'DeVelle Jackson']);
	});
});
