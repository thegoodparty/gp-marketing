import { describe, expect, it } from 'bun:test';

/**
 * Every /elections/* route once shipped without a canonical link, which left ~46,800 URLs
 * (the site's largest content type) letting Google pick its own authoritative variant. The
 * routes 301 their non-canonical variants, so each page's canonical is self-referencing and
 * built from the same lowercased path its body hands to `toAbsoluteUrl`. Scanning source keeps
 * a newly added election route from quietly reintroducing the gap: the pages are React Server
 * Components wired to the live election API, so importing them here is not an option.
 */

const ELECTIONS_ROOT = 'src/app/elections';

async function electionPageFiles(): Promise<string[]> {
	const glob = new Bun.Glob('**/page.tsx');
	return [...glob.scanSync({ cwd: ELECTIONS_ROOT })].map(path => `${ELECTIONS_ROOT}/${path}`).sort();
}

function metadataBody(source: string): string {
	const start = source.indexOf('export async function generateMetadata');
	return start === -1 ? '' : source.slice(start);
}

describe('/elections canonical metadata', () => {
	it('finds every elections route variant', async () => {
		const files = await electionPageFiles();
		expect(files.length).toBeGreaterThanOrEqual(12);
	});

	it('emits a canonical from every generateMetadata return', async () => {
		for (const file of await electionPageFiles()) {
			const source = await Bun.file(file).text();
			const body = metadataBody(source);
			expect(body, `${file} has no generateMetadata`).not.toBe('');

			// The index page canonicals through StructureMetaData; the rest do it inline.
			if (body.includes('StructureMetaData')) {
				expect(body, `${file} must pass a url to StructureMetaData`).toMatch(/url:/);
				continue;
			}

			// Every metadata return other than the invalid-state `return {}` (that route 404s)
			// has to carry a canonical, so count returns against canonicals.
			const returns = body.match(/\n\t+return \{$/gm) ?? [];
			const canonicals = body.match(/canonical/g) ?? [];
			expect(canonicals.length, `${file} returns metadata without a canonical`).toBeGreaterThanOrEqual(
				returns.length,
			);
			expect(body, `${file} must build its canonical with toAbsoluteUrl`).toMatch(
				/canonical: toAbsoluteUrl\(|const canonical = toAbsoluteUrl\(/,
			);
		}
	});

	it('canonicalizes to a lowercased /elections path', async () => {
		for (const file of await electionPageFiles()) {
			const body = metadataBody(await Bun.file(file).text());
			if (body.includes('StructureMetaData')) continue;
			const [, path] = /toAbsoluteUrl\(\s*`(\/elections[^`]*)`/.exec(body) ?? [];
			expect(path, `${file} canonical is not an /elections path`).toBeDefined();
			// Route params reach the page in whatever case the visitor typed.
			const rawSegments = path!.match(/\$\{(?!.*toLowerCase)[^}]+\}/g) ?? [];
			const allowed = rawSegments.every(s => s.includes('positionSlug') || s.includes('Slug}'));
			expect(allowed, `${file} canonical interpolates un-lowercased segments: ${rawSegments.join(', ')}`).toBe(
				true,
			);
		}
	});
});

/**
 * Two title defects the Sept 2026 crawl caught across ~90k election URLs. Both are invisible
 * locally (the routes need a live election API), so they are guarded by scanning source.
 */
describe('/elections page titles', () => {
	it('suffixes every title with the SITE_NAME constant, never a literal brand name', async () => {
		for (const file of await electionPageFiles()) {
			const body = metadataBody(await Bun.file(file).text());
			expect(body, `${file} hardcodes a brand name instead of SITE_NAME`).not.toMatch(/\| Good ?Party/);
			for (const [, suffix] of body.matchAll(/title: `[^`]*?\| ([^`]*)`/g)) {
				expect(suffix, `${file} title ends in "${suffix}" rather than \${SITE_NAME}`).toBe('${SITE_NAME}');
			}
		}
	});

	/**
	 * Same-named townships are the common case — Indiana alone has 46 Washington townships — so a
	 * city-level title that names only the city collides with every namesake in the state. The
	 * county lives in `placePhrase`, which already skips the county for a joint office whose
	 * "city" segment is really an office name.
	 */
	/**
	 * A district nested under the city slot resolves the race's own place into both the city and
	 * the county slot, so the join read "Dutton/Brady K-12 Schools, Dutton/Brady K-12 Schools" on
	 * `/elections/mt/dutton/brady-k-12-schools/position/local-school-board`. The description had
	 * carried it for a while; the title inherited it when city-level titles moved onto placePhrase.
	 */
	it('never names the same place twice in a city-level title', async () => {
		const cityRoutes = (await electionPageFiles()).filter(f => f.includes('[city]') && !f.endsWith('[city]/page.tsx'));
		expect(cityRoutes.length).toBeGreaterThanOrEqual(4);
		for (const file of cityRoutes) {
			const body = metadataBody(await Bun.file(file).text());
			expect(body, `${file} joins city to county without checking they are different places`).toMatch(
				/cityName !== countyDisplayName/,
			);
			// The subplace routes join once more. The check has to be against the names placePhrase was
			// built from, not the joined string, or a half-collapsed phrase slips a repeat through.
			if (body.includes('isRealSubplace')) {
				expect(body, `${file} joins subplace to place without checking the city slot`).toMatch(
					/subplaceName === cityName/,
				);
				expect(body, `${file} joins subplace to place without checking the county slot`).toMatch(
					/subplaceName === countyDisplayName/,
				);
			}
		}
	});

	it('names the county in every city-level title', async () => {
		// The city index page is excluded: it has no race in scope, so an unresolvable segment
		// leaves `cityPlace` null and the page 404s before a title is served. `placePhrase` there
		// would be a no-op, since isRealPlaceSegment returns true for an undefined place slug.
		const cityRoutes = (await electionPageFiles()).filter(f => f.includes('[city]') && !f.endsWith('[city]/page.tsx'));
		expect(cityRoutes.length).toBeGreaterThanOrEqual(4);
		for (const file of cityRoutes) {
			const body = metadataBody(await Bun.file(file).text());
			expect(body, `${file} must derive its title place from placePhrase`).toMatch(/const placePhrase =/);
			// The subplace branch wraps placePhrase in locationPhrase so it can drop a repeated name;
			// the county still reaches the title through it, which the next assertion pins.
			if (body.includes('${locationPhrase}')) {
				expect(body, `${file} locationPhrase must be built from placePhrase`).toMatch(
					/const locationPhrase =[^;]*placePhrase/,
				);
			}
			for (const [title] of body.matchAll(/title: `[^`]*`/g)) {
				expect(title, `${file} title omits the county: ${title}`).toMatch(/\$\{(placePhrase|locationPhrase)\}/);
			}
		}
	});
});
