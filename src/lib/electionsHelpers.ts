import { US_STATES } from '~/constants/usStates';
import type { PlaceWithFacts } from '~/types/elections';
import type { FactsCardProps } from '~/ui/FactsCard';

export function formatElectionDate(year: number): string {
	const date = new Date(year, 10, 5);
	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

export function formatElectionDateFromApi(dateStr: string | undefined): string {
	if (!dateStr) return 'TBD';
	return new Date(dateStr).toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
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
