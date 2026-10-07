/**
 * Ranks states by distance from a given state, nearest first, so a block that
 * runs short of its own state's content can fill from neighbours instead of
 * from arbitrary states. Distance between state centres rather than shared
 * borders: borders leave Alaska and Hawaii with nothing, and a state whose
 * every neighbour is also empty would need a second rule. Centres are
 * approximate geographic centres in degrees; the ranking only has to be
 * sensible, not survey-grade.
 */
const STATE_CENTERS: Record<string, [number, number]> = {
	'Alabama': [32.8, -86.8],
	'Alaska': [64.0, -152.0],
	'Arizona': [34.3, -111.7],
	'Arkansas': [34.9, -92.4],
	'California': [37.2, -119.5],
	'Colorado': [39.0, -105.5],
	'Connecticut': [41.6, -72.7],
	'Delaware': [39.0, -75.5],
	'District of Columbia': [38.9, -77.0],
	'Florida': [28.6, -82.4],
	'Georgia': [32.7, -83.4],
	'Hawaii': [20.8, -156.3],
	'Idaho': [44.4, -114.6],
	'Illinois': [40.0, -89.2],
	'Indiana': [39.9, -86.3],
	'Iowa': [42.1, -93.5],
	'Kansas': [38.5, -98.4],
	'Kentucky': [37.5, -85.3],
	'Louisiana': [31.1, -92.0],
	'Maine': [45.4, -69.2],
	'Maryland': [39.0, -76.8],
	'Massachusetts': [42.3, -71.8],
	'Michigan': [44.3, -85.4],
	'Minnesota': [46.3, -94.3],
	'Mississippi': [32.7, -89.7],
	'Missouri': [38.4, -92.5],
	'Montana': [47.0, -109.6],
	'Nebraska': [41.5, -99.8],
	'Nevada': [39.3, -116.6],
	'New Hampshire': [43.7, -71.6],
	'New Jersey': [40.1, -74.7],
	'New Mexico': [34.4, -106.1],
	'New York': [42.9, -75.5],
	'North Carolina': [35.6, -79.4],
	'North Dakota': [47.5, -100.5],
	'Ohio': [40.3, -82.8],
	'Oklahoma': [35.6, -97.5],
	'Oregon': [43.9, -120.6],
	'Pennsylvania': [40.9, -77.8],
	'Rhode Island': [41.7, -71.6],
	'South Carolina': [33.9, -80.9],
	'South Dakota': [44.4, -100.2],
	'Tennessee': [35.9, -86.4],
	'Texas': [31.5, -99.3],
	'Utah': [39.3, -111.7],
	'Vermont': [44.1, -72.7],
	'Virginia': [37.5, -78.9],
	'Washington': [47.4, -120.5],
	'West Virginia': [38.6, -80.6],
	'Wisconsin': [44.6, -89.9],
	'Wyoming': [43.0, -107.6],
};

const normalize = (name: string | undefined | null) => (name ?? '').trim().toLowerCase();

const byName = new Map(Object.entries(STATE_CENTERS).map(([name, center]) => [normalize(name), { name, center }]));

export function isKnownState(name: string | undefined | null): boolean {
	return byName.has(normalize(name));
}

export function sameState(a: string | undefined | null, b: string | undefined | null): boolean {
	const na = normalize(a);
	return na.length > 0 && na === normalize(b);
}

function distanceKm([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Every other state, nearest first. Unknown names rank nothing. */
export function rankStatesByDistance(stateName: string | undefined | null): string[] {
	const origin = byName.get(normalize(stateName));
	if (!origin) return [];
	return Object.entries(STATE_CENTERS)
		.filter(([name]) => name !== origin.name)
		.map(([name, center]) => ({ name, distance: distanceKm(origin.center, center) }))
		.sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name))
		.map(entry => entry.name);
}

/**
 * Picks up to `limit` items for a page in `stateName`: the state's own items
 * first, then the nearest states' items closest first, then items with no
 * state. Items keep their given order within each group. When nothing in the
 * list carries a state, or nothing can be matched, the list comes back
 * unchanged (and uncapped) so the caller never renders an empty block.
 */
export function pickItemsForState<T>(
	items: T[],
	getState: (item: T) => string | undefined | null,
	stateName: string | undefined | null,
	limit: number,
): T[] {
	const tagged = items.filter(item => normalize(getState(item)).length > 0);
	if (tagged.length === 0 || !stateName) return items;

	const picked: T[] = [];
	const take = (group: T[]) => {
		for (const item of group) {
			if (picked.length >= limit) return;
			picked.push(item);
		}
	};

	take(items.filter(item => sameState(getState(item), stateName)));
	for (const nearby of rankStatesByDistance(stateName)) {
		if (picked.length >= limit) break;
		take(items.filter(item => sameState(getState(item), nearby)));
	}
	take(items.filter(item => normalize(getState(item)).length === 0));

	return picked.length > 0 ? picked : items;
}
