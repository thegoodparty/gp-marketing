import type { PlaceItem } from '~/types/elections';
import {
	CITY_MTFCC,
	COUNTY_MTFCC,
	TOWN_MTFCC,
	getCitySlugToCountySlugMap,
	getPlaceBySlug,
	getPlacesByState,
	isCityOrTownMtfcc,
	normalizeName,
} from '~/lib/electionsApi';
import { canonicalizeCountyEquivalentName } from '~/lib/electionsHelpers';

export type ResolvePlaceInput = {
	city?: string;
	county?: string;
	state?: string;
};

export type ResolvedPlace = { url: string; matchedLevel: 'city' | 'county' | 'state' } | { error: 'unresolved' };

export type ResolvePlaceItem = Pick<PlaceItem, 'name' | 'slug' | 'countyName'>;

export type ResolvePlaceData = {
	cityAndTownPlaces: ResolvePlaceItem[];
	countyPlaces: ResolvePlaceItem[];
	citySlugToCountySlug: Map<string, string>;
};

function slugTail(slug: string): string | undefined {
	return slug.split('/').filter(Boolean).pop();
}

/**
 * Pure city -> county -> state fallback ladder over already-fetched place data.
 * No HTTP here, so it needs no mocking: `resolvePlace` below is the only caller
 * that talks to electionsApi.ts.
 */
export function resolvePlaceUrl(input: ResolvePlaceInput, data: ResolvePlaceData): ResolvedPlace {
	const state = input.state?.trim().toUpperCase();

	const cityQuery = input.city?.trim();
	if (state && cityQuery) {
		const target = normalizeName(cityQuery);
		const cityMatch = data.cityAndTownPlaces.find(p => normalizeName(p.name) === target);
		const countySlug = cityMatch ? data.citySlugToCountySlug.get(cityMatch.slug) : undefined;
		const countyTail = countySlug ? slugTail(countySlug) : undefined;
		const cityTail = cityMatch ? slugTail(cityMatch.slug) : undefined;
		if (countyTail && cityTail) {
			return { url: `/elections/${state.toLowerCase()}/${countyTail}/${cityTail}`, matchedLevel: 'city' };
		}
	}

	// Some callers only have one free-text field for the chosen place; when there
	// is no distinct `county`, try the city text against county names too (a
	// visitor picking "Guilford County, NC" from a single autocomplete field).
	const countyQuery = input.county?.trim() || cityQuery;
	if (state && countyQuery) {
		const target = normalizeName(canonicalizeCountyEquivalentName(state, countyQuery).baseName);
		const countyMatch = data.countyPlaces.find(p => normalizeName(canonicalizeCountyEquivalentName(state, p.name).baseName) === target);
		const countyTail = countyMatch ? slugTail(countyMatch.slug) : undefined;
		if (countyTail) {
			return { url: `/elections/${state.toLowerCase()}/${countyTail}`, matchedLevel: 'county' };
		}
	}

	if (state) {
		return { url: `/elections/${state.toLowerCase()}`, matchedLevel: 'state' };
	}

	return { error: 'unresolved' };
}

/**
 * Walks a state's counties for their municipal children. Connecticut's state-level
 * municipal sweeps (CITY_MTFCC and TOWN_MTFCC) come back empty, but
 * `/v1/places?slug=<county>&includeChildren=true` returns its towns, which is why
 * `/elections/ct/fairfield-county` links to 19 towns. Mirrors
 * `fetchMunicipalitiesByCountyWalk` in sitemap-entries.ts. The county is known
 * exactly for each child here (we just walked it), so the county-slug mapping is
 * built directly instead of depending on the child's own `countyName` matching.
 */
async function walkCountiesForMunicipalities(
	counties: ResolvePlaceItem[],
): Promise<{ places: ResolvePlaceItem[]; citySlugToCountySlug: Map<string, string> }> {
	const walkable = counties.filter(county => county.slug);
	const childLists = await Promise.all(
		walkable.map(async county => {
			// Params kept identical to getPlaceBySlug's known-working call (see
			// sitemap-entries.ts), including the explicit includeRaces: false.
			const result = await getPlaceBySlug({
				slug: county.slug,
				includeChildren: true,
				includeRaces: false,
				placeColumns: 'slug,name,mtfcc,countyName',
			});
			const children = (result?.children ?? []).filter(child => child.slug && isCityOrTownMtfcc(child.mtfcc));
			return { county, children };
		}),
	);

	const places: ResolvePlaceItem[] = [];
	const citySlugToCountySlug = new Map<string, string>();
	for (const { county, children } of childLists) {
		for (const child of children) {
			places.push({ name: child.name, slug: child.slug, countyName: county.name });
			citySlugToCountySlug.set(child.slug, county.slug);
		}
	}
	return { places, citySlugToCountySlug };
}

/**
 * Fetches one state's place data and runs it through `resolvePlaceUrl`.
 *
 * `getPlacesByState` requires a state, so an absent `state` can never resolve
 * anything and skips the fetch entirely rather than asking the API for nothing.
 */
export async function resolvePlace(input: ResolvePlaceInput): Promise<ResolvedPlace> {
	const state = input.state?.trim().toUpperCase();
	if (!state) return { error: 'unresolved' };

	const [cities, towns, counties, citySlugToCountySlug] = await Promise.all([
		getPlacesByState({ state, mtfcc: CITY_MTFCC }),
		getPlacesByState({ state, mtfcc: TOWN_MTFCC }),
		getPlacesByState({ state, mtfcc: COUNTY_MTFCC }),
		getCitySlugToCountySlugMap(state),
	]);

	let cityAndTownPlaces: ResolvePlaceItem[] = [...cities, ...towns];
	let mergedCitySlugToCountySlug = citySlugToCountySlug;

	// Gated on "could anything be placed under a county", not on the sweep being
	// empty: Connecticut's sweep can return rows that map to nothing (it abolished
	// county government in 2022), which an empty-sweep check would miss entirely.
	// Mirrors resolveMunicipalPlaces in sitemap-entries.ts, appending the walked
	// places to the sweep's rather than replacing it, since an unmapped swept row
	// is harmless here (resolvePlaceUrl just falls through it).
	if (citySlugToCountySlug.size === 0) {
		const walked = await walkCountiesForMunicipalities(counties);
		cityAndTownPlaces = [...cityAndTownPlaces, ...walked.places];
		mergedCitySlugToCountySlug = new Map([...citySlugToCountySlug, ...walked.citySlugToCountySlug]);
	}

	return resolvePlaceUrl(input, {
		cityAndTownPlaces,
		countyPlaces: counties,
		citySlugToCountySlug: mergedCitySlugToCountySlug,
	});
}
