/**
 * Election data names towns, townships and villages the way the Census does:
 * the proper name, then a lowercase legal descriptor ("Bethlehem town",
 * "Evesham township", "Colonie village"). Cities had the descriptor removed
 * upstream, these did not, and the page showed them as delivered. The display
 * form (Emily, 2026-10-09) capitalizes the descriptor, and says a town the way
 * people do: "Town of Bethlehem". A lowercase "city" is only left on the
 * county-level independent cities, which are shown by their plain name; see
 * {@link independentCityBaseName}.
 *
 * Only a lowercase descriptor at the very end is touched, and nothing is ever
 * lowercased, so "Jersey City", "Coeur d'Alene", "Fond du Lac", "DeKalb",
 * "Bend-La Pine" and "Town of Hempstead" pass through unchanged. The raw name
 * stays on the data (slugs, office-name matching and dedupe compare raw names);
 * this is for headings, titles, breadcrumbs, cards and lists.
 */

const TOWN_RE = /^(.+?)\s+town$/;

const DESCRIPTOR_RE =
	/^(.+?)\s+(township|charter township|metro township|village|borough|plantation|gore|grant|location|purchase|reservation|municipality|comunidad|zona urbana|consolidated government|metropolitan government|urban county)$/;

function capitalizeWords(words: string): string {
	return words.replace(/\b[a-z]/g, char => char.toUpperCase());
}

export function displayPlaceName(name: string): string;
export function displayPlaceName(name: string | null | undefined): string | undefined;
export function displayPlaceName(name: string | null | undefined): string | undefined {
	if (name == null) return undefined;
	const trimmed = name.trim();
	const town = TOWN_RE.exec(trimmed);
	if (town?.[1]) return `Town of ${town[1]}`;
	const independentCity = independentCityBaseName(trimmed);
	if (independentCity) return independentCity;
	const descriptor = DESCRIPTOR_RE.exec(trimmed);
	if (descriptor?.[1] && descriptor[2]) return `${descriptor[1]} ${capitalizeWords(descriptor[2])}`;
	return name;
}

/**
 * The plain name of a county-level independent city, or null. The Census names
 * one with a lowercase descriptor ("Fairfax city", "St. Louis city"), and Emily
 * wants it shown as "Fairfax" (2026-10-07). Only lowercase counts: in "Carson
 * City" and "Farmer City" the word is part of the name and stays (2026-10-20).
 */
export function independentCityBaseName(name: string | null | undefined): string | null {
	return /^(.+)\scity$/.exec(name?.trim() ?? '')?.[1] ?? null;
}

/**
 * An independent city's mayor, the way its position page heads it: BallotReady
 * calls Fairfax's "Fairfax City Mayor", and the page says "Mayor in Fairfax", so
 * the profile says "Fairfax Mayor". Every other office keeps "City", as the page
 * does ("City Council in Fairfax" is "Fairfax City Council"). `bases` are the
 * independent cities' plain names, so "Farmer City Mayor" is left alone.
 */
export function plainIndependentCityOfficeName(name: string, bases: ReadonlySet<string>): string;
export function plainIndependentCityOfficeName(name: string | null, bases: ReadonlySet<string>): string | null;
export function plainIndependentCityOfficeName(name: string | null | undefined, bases: ReadonlySet<string>): string | null | undefined;
export function plainIndependentCityOfficeName(name: string | null | undefined, bases: ReadonlySet<string>): string | null | undefined {
	if (!name) return name;
	const match = /^(.+?) City (Mayor\b.*)$/.exec(name);
	return match?.[1] && match[2] && bases.has(match[1]) ? `${match[1]} ${match[2]}` : name;
}
