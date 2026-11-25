import { describe, expect, it } from 'bun:test';
import { assertWithinMiddlewareBudget, buildRetiredDdhqMap, parseCsv, raceSlugFromCell, renderRetiredDdhqDataModule, slugFromCell } from './people-retired-ddhq-generate';

const EXPORT = [
	'url,state,impressions_90d,race_slug,johns_recommendation',
	'https://goodparty.org/people/demitri-theodoropoulos-259b578a,DE,238,de/newark/city-legislature,301',
	'/people/vinnie-royster-cf77a7fd,GA,35,,review',
	'"/people/felix-pardo-9570da5f",FL,11,"",410',
	'https://goodparty.org/people/thomas-maly-e8089cc9/,DE,9,/elections/de/ocean-view/city-executive-mayor,301',
].join('\r\n');

describe('parseCsv', () => {
	it('reads quoted fields, doubled quotes and CRLF line ends', () => {
		expect(parseCsv('a,b\r\n"x, y","say ""hi"""\r\n')).toEqual([
			['a', 'b'],
			['x, y', 'say "hi"'],
		]);
	});
});

describe('slugFromCell and raceSlugFromCell', () => {
	it('take the slug out of a full URL, a path or a bare slug', () => {
		expect(slugFromCell('https://goodparty.org/people/Jane-Doe-11111111/?utm=x')).toBe('jane-doe-11111111');
		expect(slugFromCell('/people/jane-doe-11111111')).toBe('jane-doe-11111111');
		expect(slugFromCell('jane-doe-11111111')).toBe('jane-doe-11111111');
	});

	it('strip the site and the /elections and /position prefixes from a race slug', () => {
		expect(raceSlugFromCell('https://goodparty.org/elections/position/de/newark/city-legislature/')).toBe('de/newark/city-legislature');
		expect(raceSlugFromCell('/elections/de/newark/city-legislature')).toBe('de/newark/city-legislature');
		expect(raceSlugFromCell('de/newark/city-legislature')).toBe('de/newark/city-legislature');
	});
});

describe('buildRetiredDdhqMap', () => {
	it('forwards rows with a race slug and marks 410 and review rows gone', () => {
		expect(buildRetiredDdhqMap(EXPORT)).toEqual({
			redirects: {
				'demitri-theodoropoulos-259b578a': 'de/newark/city-legislature',
				'thomas-maly-e8089cc9': 'de/ocean-view/city-executive-mayor',
			},
			gone: ['felix-pardo-9570da5f', 'vinnie-royster-cf77a7fd'],
			rows: 4,
		});
	});

	it('finds the URL column by its values when the header is not a known name', () => {
		const csv = ['page_address,recommended_action,race_slug', '/people/jane-doe-11111111,410,'].join('\n');
		expect(buildRetiredDdhqMap(csv).gone).toEqual(['jane-doe-11111111']);
	});

	it('names the missing column instead of guessing', () => {
		expect(() => buildRetiredDdhqMap('url,state\n/people/jane-doe-11111111,GA')).toThrow(/recommended action.*race_slug/);
	});

	it('refuses a redirect with no target, an unknown recommendation, and a non-people URL', () => {
		const header = 'url,race_slug,recommendation\n';
		expect(() => buildRetiredDdhqMap(`${header}/people/jane-doe-11111111,,301`)).toThrow(/no race_slug/);
		expect(() => buildRetiredDdhqMap(`${header}/people/jane-doe-11111111,,maybe`)).toThrow(/unknown recommendation/);
		expect(() => buildRetiredDdhqMap(`${header}/candidate/jane-doe,,410`)).toThrow(/not a \/people/);
		expect(() => buildRetiredDdhqMap(`${header}/people/jane-doe-11111111,newark,301`)).toThrow(/race_slug "newark"/);
	});

	it('lets a matched race win when the same slug appears twice', () => {
		const csv = [
			'url,race_slug,recommendation',
			'/people/jane-doe-11111111,,review',
			'/people/jane-doe-11111111,ga/atlanta/city-legislature,301',
			'/people/jane-doe-11111111,,410',
		].join('\n');
		expect(buildRetiredDdhqMap(csv)).toEqual({
			redirects: { 'jane-doe-11111111': 'ga/atlanta/city-legislature' },
			gone: [],
			rows: 3,
		});
	});
});

describe('renderRetiredDdhqDataModule', () => {
	it('writes the module the middleware reads, sorted so regenerating gives a stable diff', () => {
		const out = renderRetiredDdhqDataModule(buildRetiredDdhqMap(EXPORT), {
			file: 'ddhq_retired_indexed_earning.csv',
			generatedAt: '2026-11-17',
		});
		expect(out).toContain("file: 'ddhq_retired_indexed_earning.csv'");
		expect(out).toContain("'demitri-theodoropoulos-259b578a': 'de/newark/city-legislature',\n\t'thomas-maly-e8089cc9'");
		expect(out).toContain('export const RETIRED_DDHQ_GONE = `felix-pardo-9570da5f\nvinnie-royster-cf77a7fd`;');
		expect(out).toContain('Rows read: 4. Redirects: 2. Gone: 2.');
	});
});

describe('assertWithinMiddlewareBudget', () => {
	it('accepts a module under the budget', () => {
		expect(() => assertWithinMiddlewareBudget('x'.repeat(100), 100)).not.toThrow();
	});

	it('refuses a module over the budget, since the map ships in global middleware', () => {
		expect(() => assertWithinMiddlewareBudget('x'.repeat(101), 100)).toThrow(/middleware budget/);
	});

	it('counts bytes, not characters', () => {
		expect(() => assertWithinMiddlewareBudget('é'.repeat(60), 100)).toThrow(/middleware budget/);
	});
});
