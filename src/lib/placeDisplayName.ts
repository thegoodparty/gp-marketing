/**
 * Election data names towns, townships and villages the way the Census does:
 * the proper name, then a lowercase legal descriptor ("Bethlehem town",
 * "Evesham township", "Colonie village"). Cities had the descriptor removed
 * upstream, these did not, and the page showed them as delivered. The display
 * form (Emily, 2026-10-09) capitalizes the descriptor, and says a town the way
 * people do: "Town of Bethlehem".
 *
 * Only a lowercase descriptor at the very end is touched, and nothing is ever
 * lowercased, so "Jersey City", "Coeur d'Alene", "Fond du Lac", "DeKalb",
 * "Bend-La Pine" and "Town of Hempstead" pass through unchanged. The raw name
 * stays on the data (slugs, office-name matching and dedupe compare raw names);
 * this is for headings, titles, breadcrumbs, cards and lists.
 */

const TOWN_RE = /^(.+?)\s+town$/;

const DESCRIPTOR_RE =
	/^(.+?)\s+(township|charter township|metro township|village|borough|city|plantation|gore|grant|location|purchase|reservation|municipality|comunidad|zona urbana|consolidated government|metropolitan government|urban county)$/;

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
	const descriptor = DESCRIPTOR_RE.exec(trimmed);
	if (descriptor?.[1] && descriptor[2]) return `${descriptor[1]} ${capitalizeWords(descriptor[2])}`;
	return name;
}
