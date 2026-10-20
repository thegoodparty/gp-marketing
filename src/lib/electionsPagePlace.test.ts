import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { __resetElectionApiAuthForTests } from './electionApiAuth';
import { getElectionsPagePlace, retryDelayMs } from './electionsApi';
import { getFeaturedPeople } from './featuredCandidates';
import { getNearbyOffices } from './nearbyOffices';

const originalFetch = globalThis.fetch;
const ORIGINAL_M2M_TOKEN = process.env['ELECTION_API_M2M_TOKEN'];

const COUNTY_SLUG = 'ca/alameda-county';

const PLACE = {
	slug: COUNTY_SLUG,
	name: 'Alameda County',
	mtfcc: 'G4020',
	countyName: 'Alameda County',
	state: 'CA',
	geoId: '06001',
	Races: [],
};

let requested: string[] = [];

beforeEach(() => {
	requested = [];
	delete process.env['ELECTION_API_M2M_TOKEN'];
	__resetElectionApiAuthForTests({ warnedMissingToken: true });
	globalThis.fetch = (async (input: RequestInfo | URL) => {
		const url = String(input);
		requested.push(url);
		const body = url.includes('/v1/places') ? [PLACE] : [];
		return await Promise.resolve(
			new Response(JSON.stringify(body), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			}),
		);
	}) as typeof fetch;
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

function placeUrlsFor(slug: string): string[] {
	const encoded = encodeURIComponent(slug);
	return [...new Set(requested.filter(u => u.includes('/v1/places?') && u.includes(`slug=${encoded}`)))];
}

describe('one place read per /elections page render', () => {
	// The cache in front of election-api is keyed on the whole URL, so two blocks
	// on the same page asking for the same place with different column lists are
	// two cache entries and two upstream reads. Four such column lists is what
	// multiplied a crawl of these pages into the 2026-10-05 election-api outage.
	test('the page body, the featured-people block and the nearby-offices block all ask for the same URL', async () => {
		await getElectionsPagePlace({ slug: COUNTY_SLUG });
		await getFeaturedPeople({ placeSlug: COUNTY_SLUG, locationLevel: 'county' });
		await getNearbyOffices({ placeSlug: COUNTY_SLUG });

		expect(placeUrlsFor(COUNTY_SLUG)).toHaveLength(1);
	});

	test('the shared column list still carries every field the blocks read', async () => {
		await getElectionsPagePlace({ slug: COUNTY_SLUG });

		const url = placeUrlsFor(COUNTY_SLUG)[0] ?? '';
		const columns = new URL(url).searchParams.get('placeColumns')?.split(',') ?? [];

		// mtfcc + countyName: the page body. state + geoId: featured people.
		for (const column of ['slug', 'name', 'mtfcc', 'countyName', 'state', 'geoId']) {
			expect(columns).toContain(column);
		}
	});
});

describe('retry backoff is jittered', () => {
	// Fixed 500ms/1000ms delays meant every render that had just failed re-asked
	// election-api at the same two instants, tripling load on a service that was
	// already over its ceiling.
	test('spreads each attempt across a window instead of one instant', () => {
		expect(retryDelayMs(0, () => 0)).toBe(250);
		expect(retryDelayMs(0, () => 1)).toBe(750);
		expect(retryDelayMs(1, () => 0)).toBe(500);
		expect(retryDelayMs(1, () => 1)).toBe(1500);
	});

	test('two callers failing together do not come back together', () => {
		const draws = [0.1, 0.4, 0.75, 0.95];
		const delays = draws.map(d => retryDelayMs(0, () => d));

		expect(new Set(delays).size).toBe(draws.length);
	});
});
