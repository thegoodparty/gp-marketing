/**
 * The /elections link shapes the first county-lookup pass did not cover.
 *
 * `peopleProfile.countyLinks.test.ts` pins the plain case: a county-less city
 * slug reaching the canonical four-level URL. The 2026-09-18 crawl, run after
 * that shipped, still found 347 redirecting links across 79 destinations and a
 * further 346 breadcrumb 404s, in four shapes it did not reach. One profile per
 * shape here, through the REAL `loadPersonProfile` with `globalThis.fetch`
 * stubbed at the HTTP boundary, because the failure each time was the loader not
 * asking rather than the builders not knowing.
 */
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { loadPersonProfile } from './peopleProfile';
import { __resetElectionApiAuthForTests } from './electionApiAuth';

const PERSON_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const CANDIDACY_SLUG = 'jane-doe-race';
const ELECTION_DATE = `${new Date().getUTCFullYear() + 1}-11-03`;

const originalFetch = globalThis.fetch;
const ORIGINAL_M2M_TOKEN = process.env['ELECTION_API_M2M_TOKEN'];

type Place = {
	slug: string;
	name: string;
	mtfcc: string;
	state?: string;
	countyName?: string;
};

type Scenario = {
	state: string;
	raceSlug: string;
	positionLevel: string;
	counties: Place[];
	cities?: Place[];
	towns?: Place[];
	/** County slug → its municipal children, for the states whose sweeps come back empty. */
	countyChildren?: Record<string, Place[]>;
	/** Slug → place, for the per-place fallback when the sweep never returned it. */
	placesBySlug?: Record<string, Place>;
};

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function stubFetch(scenario: Scenario): void {
	const person = {
		id: PERSON_ID,
		slug: `jane-doe-${PERSON_ID.slice(0, 8)}`,
		firstName: 'Jane',
		lastName: 'Doe',
		fullName: 'Jane Doe',
		state: scenario.state,
		isPledged: false,
		Candidacies: [
			{
				id: 'cand-1',
				slug: CANDIDACY_SLUG,
				positionName: 'The Office',
				party: 'Independent',
				state: scenario.state,
				Race: { electionDate: ELECTION_DATE, slug: scenario.raceSlug, positionLevel: scenario.positionLevel },
			},
		],
		OfficeHolders: [],
	};
	const candidacyDetail = [
		{
			id: 'cand-1',
			slug: CANDIDACY_SLUG,
			positionName: 'The Office',
			state: scenario.state,
			Race: {
				brHashId: 'br-1',
				slug: scenario.raceSlug,
				positionId: 'pos-1',
				positionLevel: scenario.positionLevel,
				electionDate: ELECTION_DATE,
			},
		},
	];

	globalThis.fetch = (async (input: RequestInfo | URL): Promise<Response> => {
		const url = String(input);
		if (url.includes('/public-person-profiles')) return jsonResponse({}, 404);
		if (/\/v1\/persons\/[^/?]+$/.test(url)) return jsonResponse(person);
		if (url.includes('/v1/candidacies?') && url.includes('slug=')) return jsonResponse(candidacyDetail);

		if (url.includes('/v1/places?')) {
			const params = new URL(url).searchParams;
			const slug = params.get('slug');
			if (slug) {
				if (params.get('includeChildren') === 'true') {
					const children = scenario.countyChildren?.[slug] ?? [];
					return jsonResponse([{ slug, children }]);
				}
				const place = scenario.placesBySlug?.[slug];
				return jsonResponse(place ? [place] : []);
			}
			const mtfcc = params.get('mtfcc');
			if (mtfcc === 'G4020') return jsonResponse(scenario.counties);
			if (mtfcc === 'G4110') return jsonResponse(scenario.cities ?? []);
			if (mtfcc === 'G4040') return jsonResponse(scenario.towns ?? []);
		}

		return jsonResponse([]);
	}) as unknown as typeof fetch;
}

/** Every /elections link the rendered view carries, which is what the crawler sees. */
async function viewHrefs(): Promise<string[]> {
	const view = await loadPersonProfile(PERSON_ID);
	expect(view).not.toBeNull();
	if (!view) return [];
	return [
		view.positionHref,
		...view.breadcrumb.map(c => c.href),
		...view.recentExperience.map(r => r.href),
		...(view.electionsIndex?.entries ?? []).map(e => e.href),
	].filter((href): href is string => Boolean(href));
}

beforeEach(() => {
	delete process.env['ELECTION_API_M2M_TOKEN'];
	__resetElectionApiAuthForTests({ warnedMissingToken: true });
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

/**
 * 142 links. Where two cities in a state share a name the feed disambiguates the
 * city's own slug with a county suffix, and the old guard read that suffix as
 * proof the segment was already a county. Oakwood's countyName really does say
 * Montgomery while its slug says Cuyahoga: the lookup is the authority, not the
 * slug text, and Montgomery is where the live page canonicalises.
 */
describe('a city whose slug ends in a county suffix', () => {
	beforeEach(() => {
		stubFetch({
			state: 'OH',
			raceSlug: 'oh/oakwood-cuyahoga-county/city-legislature',
			positionLevel: 'CITY',
			counties: [
				{ slug: 'oh/montgomery-county', name: 'Montgomery County', mtfcc: 'G4020', state: 'OH' },
				{ slug: 'oh/cuyahoga-county', name: 'Cuyahoga County', mtfcc: 'G4020', state: 'OH' },
			],
			cities: [
				{
					slug: 'oh/oakwood-cuyahoga-county',
					name: 'Oakwood',
					mtfcc: 'G4110',
					state: 'OH',
					countyName: 'Montgomery',
				},
			],
		});
	});

	test('reaches the canonical four-level URL', async () => {
		const view = await loadPersonProfile(PERSON_ID);
		expect(view?.positionHref).toBe(
			'/elections/oh/montgomery-county/oakwood-cuyahoga-county/position/city-legislature',
		);
	});

	test('emits no county-less link anywhere on the page', async () => {
		for (const href of await viewHrefs()) {
			expect(href).not.toStartWith('/elections/oh/oakwood-cuyahoga-county');
		}
	});
});

/**
 * 91 links. A judicial, county or district-attorney office is routinely seated
 * in a city, and the old guard let only CITY and LOCAL take the city branch.
 */
describe('a non-city office seated in a city', () => {
	beforeEach(() => {
		stubFetch({
			state: 'NV',
			raceSlug: 'nv/las-vegas/justice-of-the-peace-judicial',
			positionLevel: 'JUDICIAL',
			counties: [{ slug: 'nv/clark-county', name: 'Clark County', mtfcc: 'G4020', state: 'NV' }],
			cities: [{ slug: 'nv/las-vegas', name: 'Las Vegas', mtfcc: 'G4110', state: 'NV', countyName: 'Clark' }],
		});
	});

	test('reaches the canonical four-level URL', async () => {
		const view = await loadPersonProfile(PERSON_ID);
		expect(view?.positionHref).toBe(
			'/elections/nv/clark-county/las-vegas/position/justice-of-the-peace-judicial',
		);
	});

	test('emits no county-less link anywhere on the page', async () => {
		for (const href of await viewHrefs()) {
			expect(href).not.toStartWith('/elections/nv/las-vegas');
		}
	});
});

/**
 * 107 links, 17 of them Connecticut, which maps nothing from the state-level
 * sweeps: it abolished county government and its county-equivalents became
 * planning regions in 2022. These were the worst of the set — the county-less
 * URL does not even redirect to the right town, it drops the visitor on the
 * bare state index.
 */
describe('a state whose municipal sweeps come back empty', () => {
	beforeEach(() => {
		stubFetch({
			state: 'CT',
			raceSlug: 'ct/stamford/city-legislature',
			positionLevel: 'CITY',
			counties: [{ slug: 'ct/fairfield-county', name: 'Fairfield County', mtfcc: 'G4020', state: 'CT' }],
			cities: [],
			towns: [],
			countyChildren: {
				'ct/fairfield-county': [
					{ slug: 'ct/stamford', name: 'Stamford', mtfcc: 'G4110' },
					{ slug: 'ct/norwalk', name: 'Norwalk', mtfcc: 'G4110' },
				],
			},
		});
	});

	test('reaches the canonical four-level URL by walking the counties', async () => {
		const view = await loadPersonProfile(PERSON_ID);
		expect(view?.positionHref).toBe('/elections/ct/fairfield-county/stamford/position/city-legislature');
	});

	test('emits no county-less link anywhere on the page', async () => {
		for (const href of await viewHrefs()) {
			expect(href).not.toStartWith('/elections/ct/stamford');
		}
	});
});

/** The scattered singles a healthy state's sweep still misses, asked for per place. */
describe('a city the state sweep never returned', () => {
	beforeEach(() => {
		stubFetch({
			state: 'ID',
			raceSlug: 'id/coeur-dalene/city-legislature',
			positionLevel: 'CITY',
			counties: [
				{ slug: 'id/kootenai-county', name: 'Kootenai County', mtfcc: 'G4020', state: 'ID' },
				{ slug: 'id/ada-county', name: 'Ada County', mtfcc: 'G4020', state: 'ID' },
			],
			// The sweep maps Boise, so nothing here looks broken at the state level.
			cities: [{ slug: 'id/boise', name: 'Boise', mtfcc: 'G4110', state: 'ID', countyName: 'Ada' }],
			placesBySlug: {
				'id/coeur-dalene': {
					slug: 'id/coeur-dalene',
					name: "Coeur d'Alene",
					mtfcc: 'G4110',
					countyName: 'Kootenai',
				},
			},
		});
	});

	test('reaches the canonical four-level URL', async () => {
		const view = await loadPersonProfile(PERSON_ID);
		expect(view?.positionHref).toBe('/elections/id/kootenai-county/coeur-dalene/position/city-legislature');
	});
});

/**
 * 346 of the 370 outright broken links. A joint office spends one URL segment
 * per combined role and those segments fill the route's place slots, so the
 * trail was linking an office name as if it were a county.
 */
describe('a joint office whose role segment sits in the county slot', () => {
	beforeEach(() => {
		stubFetch({
			state: 'GA',
			raceSlug: 'ga/state-insurance-commissioner/fire-safety-commissioner-joint',
			positionLevel: 'STATE',
			counties: [{ slug: 'ga/fulton-county', name: 'Fulton County', mtfcc: 'G4020', state: 'GA' }],
			cities: [{ slug: 'ga/atlanta', name: 'Atlanta', mtfcc: 'G4110', state: 'GA', countyName: 'Fulton' }],
		});
	});

	test('does not link the role as a place', async () => {
		const view = await loadPersonProfile(PERSON_ID);
		expect(view?.breadcrumb.map(c => c.href)).not.toContain('/elections/ga/state-insurance-commissioner');
		expect(view?.breadcrumb.map(c => c.label)).toEqual(['Elections', 'Georgia', 'The Office', 'Jane Doe']);
	});

	/** The position page itself is real, so the office keeps its own crumb. */
	test('still links the position page', async () => {
		const view = await loadPersonProfile(PERSON_ID);
		expect(view?.positionHref).toBe(
			'/elections/ga/state-insurance-commissioner/position/fire-safety-commissioner-joint',
		);
	});
});

/**
 * A place name with a slash in it ("Choctaw/Nicoma Park Schools") splits across
 * two slots. Choctaw is a real Oklahoma city, so the county slot held something
 * that resolved — to the wrong county, whose towns the "Explore Elections" band
 * then listed as this person's neighbours.
 */
describe('a place name that slugifies across two slots', () => {
	beforeEach(() => {
		stubFetch({
			state: 'OK',
			raceSlug: 'ok/choctaw/nicoma-park-schools/local-school-board',
			positionLevel: 'LOCAL',
			counties: [
				{ slug: 'ok/choctaw-county', name: 'Choctaw County', mtfcc: 'G4020', state: 'OK' },
				{ slug: 'ok/oklahoma-county', name: 'Oklahoma County', mtfcc: 'G4020', state: 'OK' },
			],
			cities: [
				{ slug: 'ok/choctaw', name: 'Choctaw', mtfcc: 'G4110', state: 'OK', countyName: 'Oklahoma' },
				{ slug: 'ok/hugo', name: 'Hugo', mtfcc: 'G4110', state: 'OK', countyName: 'Choctaw' },
			],
		});
	});

	test('does not link the first fragment as a county', async () => {
		const view = await loadPersonProfile(PERSON_ID);
		expect(view?.breadcrumb.map(c => c.href)).not.toContain('/elections/ok/choctaw');
	});

	test('does not offer another county’s towns as neighbours', async () => {
		const view = await loadPersonProfile(PERSON_ID);
		expect(view?.electionsIndex?.entryLevel).toBe('state');
		expect((view?.electionsIndex?.entries ?? []).map(e => e.href)).not.toContain('/elections/ok/choctaw/hugo');
	});
});
