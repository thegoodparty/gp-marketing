/// <reference types="bun-types" />
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { __resetElectionApiAuthForTests } from '~/lib/electionApiAuth';
import { resolveLegacyPositionRaceSlug } from '~/lib/legacyPositionRedirect';
import { resetNextCacheMock } from '~/testing/nextCacheMock';
import { blockVercelOidcToken, saveVercelOidcEnv } from '~/testing/vercelOidc';
import Page from './[...raceSlug]/page';

/**
 * Old `/elections/position/<race slug>` URLs from before the March 2026
 * migration returned 404; they now 308 to the office's current page (SEO
 * tickets 1 and 9, 2026-11-12). Examples are the ones the audit found dead.
 */
const originalFetch = globalThis.fetch;
let restoreVercelOidcEnv: () => void;

function withRaces(races: Record<string, unknown>, places: unknown[] = []) {
	globalThis.fetch = (async (input: RequestInfo | URL) => {
		const url = new URL(String(input));
		let body: unknown = [];
		if (url.pathname.endsWith('/races')) {
			const race = races[url.searchParams.get('raceSlug') ?? ''];
			body = race ? [race] : [];
		} else if (url.pathname.endsWith('/places')) {
			body = places;
		}
		return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
	}) as typeof fetch;
}

async function outcome(segments: string[]): Promise<string> {
	try {
		await Page({ params: Promise.resolve({ raceSlug: segments }) });
		return 'rendered';
	} catch (error) {
		const digest = (error as { digest?: string }).digest ?? '';
		if (digest.startsWith('NEXT_REDIRECT')) {
			const [, , target, status] = digest.split(';');
			return `${status} ${target}`;
		}
		if (digest.includes('404')) return '404';
		throw error;
	}
}

beforeEach(() => {
	restoreVercelOidcEnv = saveVercelOidcEnv();
	blockVercelOidcToken();
	__resetElectionApiAuthForTests({ warnedNoToken: true });
	resetNextCacheMock();
});

afterEach(() => {
	restoreVercelOidcEnv();
	__resetElectionApiAuthForTests();
	globalThis.fetch = originalFetch;
});

describe('old /elections/position URLs', () => {
	test('a statewide office goes to its state position page', async () => {
		withRaces({ 'ca/governor': { slug: 'ca/governor', positionLevel: 'STATE' } });
		expect(await outcome(['ca', 'governor'])).toBe('308 /elections/ca/position/governor');
	});

	test('a county office goes to its county position page', async () => {
		withRaces({ 'al/walker-county/county-sheriff': { slug: 'al/walker-county/county-sheriff', positionLevel: 'COUNTY' } });
		expect(await outcome(['al', 'walker-county', 'county-sheriff'])).toBe(
			'308 /elections/al/walker-county/position/county-sheriff',
		);
	});

	test('a city office with no county in the old URL gets its county from the race', async () => {
		withRaces(
			{
				'al/anniston/city-executive-mayor': {
					slug: 'al/anniston/city-executive-mayor',
					state: 'AL',
					positionLevel: 'CITY',
					Place: { slug: 'al/anniston', mtfcc: 'G4110', countyName: 'Calhoun' },
				},
			},
			[{ slug: 'al/calhoun-county', name: 'Calhoun County', mtfcc: 'G4020', state: 'AL' }],
		);
		expect(await outcome(['al', 'anniston', 'city-executive-mayor'])).toBe(
			'308 /elections/al/calhoun-county/anniston/position/city-executive-mayor',
		);
	});

	test('a town office that carried its county keeps it', async () => {
		withRaces({
			'ut/salt-lake-county/cottonwood/improvement-district-board': {
				slug: 'ut/salt-lake-county/cottonwood/improvement-district-board',
				positionLevel: 'LOCAL',
			},
		});
		expect(await outcome(['ut', 'salt-lake-county', 'cottonwood', 'improvement-district-board'])).toBe(
			'308 /elections/ut/salt-lake-county/cottonwood/position/improvement-district-board',
		);
	});

	test('an old candidates listing goes to the same office', async () => {
		withRaces({ 'ca/governor': { slug: 'ca/governor', positionLevel: 'STATE' } });
		expect(await outcome(['ca', 'governor', 'candidates'])).toBe('308 /elections/ca/position/governor');
	});

	test('a slug with no race stays a 404 instead of a guessed redirect', async () => {
		withRaces({});
		expect(await outcome(['tx', 'rockwall-county', 'county-clerk'])).toBe('404');
	});

	test('a first segment that is not a state is a 404 without asking the API', async () => {
		let asked = false;
		globalThis.fetch = (async () => {
			asked = true;
			return new Response('[]');
		}) as unknown as typeof fetch;
		expect(await outcome(['st-george', 'city-legislature'])).toBe('404');
		expect(asked).toBe(false);
	});
});

describe('resolveLegacyPositionRaceSlug', () => {
	test('joins and lowercases the segments', () => {
		expect(resolveLegacyPositionRaceSlug(['AL', 'Walker-County', 'county-sheriff'])).toBe('al/walker-county/county-sheriff');
	});

	test('rejects paths too short or too long to be a race slug', () => {
		expect(resolveLegacyPositionRaceSlug(['ca'])).toBeNull();
		expect(resolveLegacyPositionRaceSlug(['ca', 'candidates'])).toBeNull();
		expect(resolveLegacyPositionRaceSlug(['a', 'b', 'c', 'd', 'e', 'f'])).toBeNull();
	});
});
