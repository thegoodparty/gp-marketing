/**
 * Wiring test for the /people profile's `/elections` links.
 *
 * `peopleProfile.test.ts` proves the pure builders expand a county-less city
 * slug when they are handed a lookup. That is the easy half: the bug being
 * fixed here was that nothing ever handed them one, so every "back to this
 * race/city" link on a city profile pointed at the pre-restructuring URL and
 * 308'd (~36,900 internal links across ~4,800 destinations in the 2026-09-14
 * crawl). A helper that takes the lookup but a loader that never builds it
 * would pass those tests and still ship the redirects.
 *
 * So this runs the REAL `loadPersonProfile` with `globalThis.fetch` stubbed at
 * the HTTP boundary — the same seam the state matrix and full-chain tests use —
 * and asserts on the links the rendered page actually carries.
 */
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { loadPersonProfile } from './peopleProfile';
import { __resetElectionApiAuthForTests } from './electionApiAuth';

const PERSON_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const RACE_SLUG = 'nc/greensboro/mayor';
const CANDIDACY_SLUG = 'jane-doe-mayor';
const CANONICAL = '/elections/nc/guilford-county/greensboro/position/mayor';
/** What the page shipped before: a real page, but only after a 308. */
const REDIRECTING = '/elections/nc/greensboro';

const originalFetch = globalThis.fetch;
const ORIGINAL_M2M_TOKEN = process.env['ELECTION_API_M2M_TOKEN'];

const ELECTION_DATE = `${new Date().getUTCFullYear() + 1}-11-03`;

const PERSON = {
	id: PERSON_ID,
	slug: `jane-doe-${PERSON_ID.slice(0, 8)}`,
	firstName: 'Jane',
	lastName: 'Doe',
	fullName: 'Jane Doe',
	state: 'NC',
	isPledged: false,
	Candidacies: [
		{
			id: 'cand-1',
			slug: CANDIDACY_SLUG,
			positionName: 'Mayor',
			party: 'Independent',
			state: 'NC',
			Race: { electionDate: ELECTION_DATE, slug: RACE_SLUG, positionLevel: 'CITY' },
		},
	],
	OfficeHolders: [
		{
			id: 'off-1',
			officeTitle: 'Town Council Member',
			positionName: 'Cary Town Council',
			state: 'NC',
			startAt: '2019-01-01',
			endAt: '2023-01-01',
			isCurrent: false,
			partyNames: ['Independent'],
			positionSlug: 'nc/cary/town-council',
			positionLevel: 'CITY',
		},
	],
};

/** The candidacy detail fetch, which is where the loader reads the race slug. */
const CANDIDACY_DETAIL = [
	{
		id: 'cand-1',
		slug: CANDIDACY_SLUG,
		positionName: 'Mayor',
		state: 'NC',
		Race: {
			brHashId: 'br-1',
			slug: RACE_SLUG,
			positionId: 'pos-1',
			positionLevel: 'CITY',
			electionDate: ELECTION_DATE,
		},
	},
];

const NC_COUNTIES = [
	{ id: '1', slug: 'nc/guilford-county', name: 'Guilford County', mtfcc: 'G4020', state: 'NC' },
	{ id: '2', slug: 'nc/wake-county', name: 'Wake County', mtfcc: 'G4020', state: 'NC' },
];

const NC_CITIES = [
	{
		id: '3',
		slug: 'nc/greensboro',
		name: 'Greensboro',
		mtfcc: 'G4110',
		state: 'NC',
		countyName: 'Guilford',
	},
	{
		id: '4',
		slug: 'nc/high-point',
		name: 'High Point',
		mtfcc: 'G4110',
		state: 'NC',
		countyName: 'Guilford',
	},
	{ id: '5', slug: 'nc/cary', name: 'Cary', mtfcc: 'G4110', state: 'NC', countyName: 'Wake' },
];

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

function stubFetch(): void {
	globalThis.fetch = (async (input: RequestInfo | URL): Promise<Response> => {
		const url = String(input);

		// gp-api: no overlay and no density — this is an unclaimed programmatic page.
		if (url.includes('/public-person-profiles')) return jsonResponse({}, 404);

		if (/\/v1\/persons\/[^/?]+$/.test(url)) return jsonResponse(PERSON);
		if (url.includes('/v1/candidacies?') && url.includes('slug=')) {
			return jsonResponse(CANDIDACY_DETAIL);
		}
		if (url.includes('/v1/places?') && url.includes('mtfcc=G4020')) {
			return jsonResponse(NC_COUNTIES);
		}
		if (url.includes('/v1/places?') && url.includes('mtfcc=G4110')) {
			return jsonResponse(NC_CITIES);
		}

		// Towns, officeholder/candidacy lists, removals: empty is a valid answer.
		return jsonResponse([]);
	}) as unknown as typeof fetch;
}

beforeEach(() => {
	delete process.env['ELECTION_API_M2M_TOKEN'];
	__resetElectionApiAuthForTests({ warnedMissingToken: true });
	stubFetch();
});

afterEach(() => {
	if (ORIGINAL_M2M_TOKEN === undefined) {
		delete process.env['ELECTION_API_M2M_TOKEN'];
	} else {
		process.env['ELECTION_API_M2M_TOKEN'] = ORIGINAL_M2M_TOKEN;
	}
	__resetElectionApiAuthForTests();
	globalThis.fetch = originalFetch;
});

describe('a city profile links the canonical /elections URLs, not the ones that redirect', () => {
	test('the position href carries the county segment', async () => {
		const view = await loadPersonProfile(PERSON_ID);

		expect(view?.positionHref).toBe(CANONICAL);
	});

	test('the breadcrumb names the county and links each level', async () => {
		const view = await loadPersonProfile(PERSON_ID);

		expect(view?.breadcrumb.map((c) => c.label)).toEqual([
			'Elections',
			'North Carolina',
			'Guilford County',
			'Greensboro',
			'Mayor',
			'Jane Doe',
		]);
		expect(view?.breadcrumb.at(-2)?.href).toBe(CANONICAL);
	});

	test('a past office term links its own city with its own county', async () => {
		const view = await loadPersonProfile(PERSON_ID);
		const term = view?.recentExperience.find((r) => r.title === 'Town Council Member');

		expect(term?.href).toBe('/elections/nc/wake-county/cary/position/town-council');
	});

	/**
	 * The assertion that pins the reported problem: the crawl found these links by
	 * destination, so this test does too, across every link the view exposes.
	 */
	test('no link on the page points at a county-less city URL', async () => {
		const view = await loadPersonProfile(PERSON_ID);
		expect(view).not.toBeNull();
		if (!view) return;

		const hrefs = [
			view.positionHref,
			...view.breadcrumb.map((c) => c.href),
			...view.recentExperience.map((r) => r.href),
			...(view.electionsIndex?.entries ?? []).map((e) => e.href),
		].filter((href): href is string => Boolean(href));

		expect(hrefs.length).toBeGreaterThan(5);
		for (const href of hrefs) {
			expect(href).not.toStartWith(REDIRECTING);
			expect(href).not.toStartWith('/elections/nc/cary');
		}
	});

	/**
	 * The "Explore Elections" band reads its tier back off the position href, so a
	 * county-less href silently demoted a city profile to the county list. Fixing
	 * the href fixes the band with it.
	 */
	test('the "Explore Elections" band lists sibling cities in the resolved county', async () => {
		const view = await loadPersonProfile(PERSON_ID);

		expect(view?.electionsIndex?.entryLevel).toBe('city');
		expect(view?.electionsIndex?.entries.map((e) => e.href)).toContain(
			'/elections/nc/guilford-county/high-point',
		);
	});
});
