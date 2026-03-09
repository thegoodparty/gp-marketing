import { US_STATES } from '~/constants/usStates';
import type { CandidacyItem, PlaceWithFacts } from '~/types/elections';
import type { FactsCardProps } from '~/ui/FactsCard';

export function mapCandidacyToCard(
	candidacy: CandidacyItem,
	index: number,
): { _key: string; name: string; partyAffiliation: string; avatar?: string; href: string } {
	const name = [candidacy.firstName, candidacy.lastName].filter(Boolean).join(' ') || 'Candidate';
	return {
		_key: candidacy.id ?? `c-${index}`,
		name,
		partyAffiliation: candidacy.party ?? 'Unknown',
		avatar: candidacy.image ?? undefined,
		href: candidacy.slug
			? `/candidate/${candidacy.slug}`
			: `/profile?slug=${encodeURIComponent([candidacy.firstName, candidacy.lastName].filter(Boolean).join('-').toLowerCase())}&raceId=${encodeURIComponent(candidacy.raceId ?? '')}`,
	};
}

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses an ISO date-only string (YYYY-MM-DD) as local date to avoid UTC midnight shifting the day in western time zones.
 */
function parseDateOnlyAsLocal(dateOnly: string): Date {
	const [y, m, d] = dateOnly.split('-').map(Number);
	return new Date(y, m - 1, d);
}

const LOCALE_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
	month: 'long',
	day: 'numeric',
	year: 'numeric',
};

/**
 * Returns "November 5, [year]" when only the year is known (e.g. general election placeholder).
 * Use when the API provides a year but not a specific election date.
 */
export function formatElectionDate(year: number): string {
	const date = new Date(year, 10, 5);
	return date.toLocaleDateString('en-US', LOCALE_DATE_OPTIONS);
}

export function formatElectionDateFromApi(dateStr: string | undefined): string {
	if (!dateStr) return 'TBD';
	if (DATE_ONLY_REGEX.test(dateStr)) {
		return parseDateOnlyAsLocal(dateStr).toLocaleDateString('en-US', LOCALE_DATE_OPTIONS);
	}
	return new Date(dateStr).toLocaleDateString('en-US', LOCALE_DATE_OPTIONS);
}

/**
 * Returns the calendar year from a date string that may be ISO date-only (YYYY-MM-DD)
 * or a pre-formatted string like "November 5, 2026". Uses local-date parsing for ISO to avoid timezone shift.
 */
export function getYearFromDateString(dateStr: string): number {
	if (DATE_ONLY_REGEX.test(dateStr)) {
		return parseDateOnlyAsLocal(dateStr).getFullYear();
	}
	const parsed = new Date(dateStr);
	if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear();
	const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
	return yearMatch ? parseInt(yearMatch[0], 10) : NaN;
}

export function formatFilingPeriod(
	periods: Array<{ startOn: string; endOn: string }> | undefined,
): string {
	const first = periods?.[0];
	if (!first) return 'TBD';
	const start = new Date(first.startOn).toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
	const end = new Date(first.endOn).toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
	return `${start} - ${end}`;
}

export function getStateName(code: string): string {
	const upper = code.toUpperCase();
	const found = US_STATES.find(s => s.value === upper);
	return found?.label ?? code;
}

export function slugifyPositionName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Finds the city (child place) that a district name belongs to by matching
 * the city's base name (e.g. "quincy" from "Quincy City") against the district name.
 * Used to build city position URLs so getRaceBySlug gets a 4-part slug.
 * When multiple children match, prefers the longest base name match.
 */
export function findCityForDistrictName(
	districtName: string,
	children: { name: string; slug: string }[],
): { name: string; slug: string } | null {
	if (!children.length) return null;
	const lower = districtName.toLowerCase();
	const withBase = children.map(c => ({
		...c,
		baseName: c.name.replace(/\s+(Town|City|Township|Village)$/i, '').toLowerCase(),
	}));
	const matching = withBase.filter(c => lower.includes(c.baseName));
	if (matching.length === 0) return null;
	// Prefer longest base name match (e.g. "quincy township" over "quincy")
	matching.sort((a, b) => b.baseName.length - a.baseName.length);
	return { name: matching[0].name, slug: matching[0].slug };
}

export function buildRaceSlug(
	state: string,
	positionSlug: string,
	county?: string,
	city?: string,
): string {
	const parts = [state.toLowerCase()];
	if (county) parts.push(county.toLowerCase());
	if (city) parts.push(city.toLowerCase());
	parts.push(positionSlug);
	return parts.join('/');
}

export function formatFilingPeriodFromRace(
	start: string | undefined,
	end: string | undefined,
): string {
	if (!start && !end) return 'TBD';
	const fmt = (d: string) =>
		DATE_ONLY_REGEX.test(d)
			? parseDateOnlyAsLocal(d).toLocaleDateString('en-US', LOCALE_DATE_OPTIONS)
			: new Date(d).toLocaleDateString('en-US', LOCALE_DATE_OPTIONS);
	if (start && end) return `${fmt(start)} - ${fmt(end)}`;
	if (start) return `From ${fmt(start)}`;
	return `Until ${fmt(end!)}`;
}

export function placeToFactsCards(place: PlaceWithFacts | null): FactsCardProps[] {
	if (!place) return [];
	const cards: FactsCardProps[] = [];
	const factTypeLabels: Record<string, string> = {
		'largest-city': 'Largest City',
		population: 'Population',
		density: 'Density (per sq mi)',
		'median-income': 'Median Income',
		'unemployment-rate': 'Unemployment Rate',
		'average-home-value': 'Average Home Value',
	};
	if (place.cityLargest != null) {
		cards.push({ factType: 'largest-city', label: factTypeLabels['largest-city']!, value: place.cityLargest });
	}
	if (place.population != null) {
		cards.push({ factType: 'population', label: factTypeLabels['population']!, value: place.population.toLocaleString() });
	}
	if (place.density != null) {
		// API returns people per sq km; display as people per sq mi
		const densityPerSqMi = place.density / 0.386102;
		cards.push({ factType: 'density', label: factTypeLabels['density']!, value: Math.round(densityPerSqMi).toLocaleString() });
	}
	if (place.incomeHouseholdMedian != null) {
		cards.push({
			factType: 'median-income',
			label: factTypeLabels['median-income']!,
			value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(place.incomeHouseholdMedian),
		});
	}
	if (place.unemploymentRate != null) {
		cards.push({
			factType: 'unemployment-rate',
			label: factTypeLabels['unemployment-rate']!,
			value: `${(place.unemploymentRate * 100).toFixed(1)}%`,
		});
	}
	if (place.homeValue != null) {
		cards.push({
			factType: 'average-home-value',
			label: factTypeLabels['average-home-value']!,
			value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(place.homeValue),
		});
	}
	return cards;
}
