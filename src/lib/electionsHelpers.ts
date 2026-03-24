import { US_STATES } from '~/constants/usStates';
import type { CandidacyItem, PlaceItem, PlaceWithFacts, RaceDetail } from '~/types/elections';
import type { FactsCardProps } from '~/ui/FactsCard';

const COUNTY_EQUIV_SUFFIX_RE = /\s+(County|Parish|City and Borough|City and County|Borough|Census Area|Municipio)$/i;

/** Resolve display name for the [county] route param (county, city, or district). */
export function resolveLocalityName(
	countyPlace: PlaceItem | undefined,
	racePlace: PlaceWithFacts | undefined,
	fallbackSlug: string,
): string {
	if (countyPlace) return countyPlace.name;
	if (racePlace?.name) return racePlace.name;
	const last = fallbackSlug.split('/').pop();
	return last
		? last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
		: fallbackSlug;
}

/** Strip county-equivalent suffix from a place name: "Jefferson Parish" -> "Jefferson" */
export function stripCountySuffix(name: string): string {
	return name.replace(COUNTY_EQUIV_SUFFIX_RE, '') || name;
}

/** Get the suffix word from a county-equivalent name: "Jefferson Parish" -> "Parish", fallback "County" */
export function getCountySuffixLabel(name: string): string {
	const match = name.match(COUNTY_EQUIV_SUFFIX_RE);
	return match?.[1] ?? 'County';
}

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
			value: `${place.unemploymentRate.toFixed(1)}%`,
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

/**
 * Builds a Schema.org WebPage JSON-LD object with GovernmentOffice for position pages.
 * Describes the page and the elected office. JobPosting JSON-LD is emitted separately
 * (see buildJobPostingSchema) for Google Job Postings rich results.
 */
export function buildPositionPageSchema(params: {
	race: RaceDetail;
	officeName: string;
	stateName: string;
	countyName?: string;
	cityName?: string;
	pageUrl: string;
}): object {
	const { race, officeName, stateName, countyName, cityName, pageUrl } = params;

	const locationParts = [cityName, countyName, stateName].filter(Boolean);
	const addressLocality = cityName ?? countyName;
	const locationName = locationParts.join(', ');

	const description =
		race.positionDescription ||
		`Learn about running for ${officeName} in ${locationName}.`;

	const datePublished =
		race.filingDateStart?.slice(0, 10) || race.electionDate?.slice(0, 10);

	return {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: `${officeName} in ${locationName}`,
		url: pageUrl,
		description,
		...(datePublished && { datePublished }),
		about: {
			'@type': 'GovernmentOffice',
			name: officeName,
			address: {
				'@type': 'PostalAddress',
				addressRegion: race.state,
				...(addressLocality && { addressLocality }),
			},
		},
		provider: {
			'@type': 'Organization',
			name: 'GoodParty.org',
			url: 'https://goodparty.org',
		},
	};
}

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
	'full-time': 'FULL_TIME',
	'full time': 'FULL_TIME',
	'part-time': 'PART_TIME',
	'part time': 'PART_TIME',
	volunteer: 'VOLUNTEER',
	contract: 'CONTRACTOR',
	contractor: 'CONTRACTOR',
	temporary: 'TEMPORARY',
	temp: 'TEMPORARY',
	intern: 'INTERN',
	internship: 'INTERN',
	'per diem': 'PER_DIEM',
	'per-diem': 'PER_DIEM',
};

function mapPositionEmploymentType(type: string): string {
	return EMPLOYMENT_TYPE_MAP[type.toLowerCase().trim()] ?? 'OTHER';
}

function parseSalaryString(salary: string): object | null {
	function makeResult(unitText: 'HOUR' | 'YEAR', amounts: number[]): object {
		const value: Record<string, unknown> = { '@type': 'QuantitativeValue', unitText };
		if (amounts.length === 1) {
			value.value = amounts[0];
		} else {
			value.minValue = Math.min(...amounts);
			value.maxValue = Math.max(...amounts);
		}
		return { '@type': 'MonetaryAmount', currency: 'USD', value };
	}

	// 1. Explicit annual amounts — handles "$95,000/year", "$14,400 / year", prose with embedded salary.
	//    Stops at the first 1–2 matches so per-diem noise ("$7,200/year + $221/day") is ignored.
	const yearAmounts = [...salary.matchAll(/\$\s*([\d,]+(?:\.\d{2})?)\s*(?:\/\s*(?:year|yr)\b|per\s+year\b|annually\b)/gi)]
		.map(m => parseFloat(m[1]!.replace(/,/g, '')));
	if (yearAmounts.length > 2) return null;
	if (yearAmounts.length >= 1) return makeResult('YEAR', yearAmounts);

	// 2. Explicit hourly amounts — handles "$25/hr", "$25/hour".
	const hourAmounts = [...salary.matchAll(/\$\s*([\d,]+(?:\.\d{2})?)\s*(?:\/\s*h(?:ou)?r\b|per\s+hour\b|hourly\b)/gi)]
		.map(m => parseFloat(m[1]!.replace(/,/g, '')));
	if (hourAmounts.length > 2) return null;
	if (hourAmounts.length >= 1) return makeResult('HOUR', hourAmounts);

	// 3. Bare integer with no other text — handles "147175".
	const bareMatch = /^\s*([\d,]+)\s*$/.exec(salary);
	if (bareMatch) {
		const n = parseFloat(bareMatch[1]!.replace(/,/g, ''));
		if (!isNaN(n)) return makeResult('YEAR', [n]);
	}

	// 4. Generic $ amounts with no explicit unit — handles "$50,000" and "$50,000 - $75,000".
	const genericAmounts = [...salary.matchAll(/\$\s*([\d,]+(?:\.\d{2})?)/g)]
		.map(m => parseFloat(m[1]!.replace(/,/g, '')));
	if (genericAmounts.length === 1 || genericAmounts.length === 2) return makeResult('YEAR', genericAmounts);

	return null;
}

function escapeHtmlForJobPosting(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * JobPosting description as HTML: trusted API markup when present, else escaped plain text in `<p>`.
 */
function buildJobPostingDescription(
	positionDescription: string | undefined,
	officeName: string,
	locationName: string,
): string {
	if (positionDescription?.trim()) {
		const raw = positionDescription.trim();
		// Pass through API HTML only when it starts with a known safe block tag.
		if (/^<(p|ul|ol|h[1-6]|div|section|article)\b/i.test(raw)) {
			return raw.replace(/<(script|iframe|object)[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/\s+on\w+="[^"]*"/gi, '');
		}
		return `<p>${escapeHtmlForJobPosting(raw)}</p>`;
	}
	const plain =
		`${officeName} is an elected public office position in ${locationName}. ` +
		`Learn about eligibility, filing deadlines, and how to run for this office.`;
	return `<p>${escapeHtmlForJobPosting(plain)}</p>`;
}

/**
 * Builds Schema.org JobPosting JSON-LD for elections position pages (Google Job Postings rich results).
 * Returns null when filingDateStart and electionDate are both missing (required datePosted); omit schema until the elections API backfills dates.
 */
export function buildJobPostingSchema(params: {
	race: RaceDetail;
	officeName: string;
	stateName: string;
	countyName?: string;
	cityName?: string;
	pageUrl: string;
}): object | null {
	const { race, officeName, stateName, countyName, cityName, pageUrl } = params;

	const datePosted = race.filingDateStart?.slice(0, 10) || race.electionDate?.slice(0, 10);
	if (!datePosted) {
		return null;
	}

	const locationParts = [cityName, countyName, stateName].filter(Boolean);
	const locationName = locationParts.join(', ');

	const description = buildJobPostingDescription(race.positionDescription, officeName, locationName);

	const orgName = cityName
		? `City of ${cityName}`
		: countyName
			? countyName
			: `State of ${stateName}`;

	const addressLocality = cityName ?? countyName ?? stateName;

	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'JobPosting',
		title: officeName,
		sameAs: pageUrl,
		description,
		datePosted,
		directApply: false,
		hiringOrganization: {
			'@type': 'GovernmentOrganization',
			name: orgName,
		},
		jobLocation: {
			'@type': 'Place',
			address: {
				'@type': 'PostalAddress',
				addressLocality,
				addressRegion: race.state,
				addressCountry: 'US',
			},
		},
	};

	if (race.filingDateEnd) {
		schema.validThrough = race.filingDateEnd.slice(0, 10);
	}

	if (race.employmentType) {
		schema.employmentType = mapPositionEmploymentType(race.employmentType);
	}

	if (race.salary) {
		const baseSalary = parseSalaryString(race.salary);
		if (baseSalary) {
			schema.baseSalary = baseSalary;
		}
	}

	return schema;
}

/**
 * Builds a Schema.org BreadcrumbList JSON-LD object from breadcrumb items.
 */
export function buildBreadcrumbSchema(
	breadcrumbs: { href: string; label: string }[],
	toAbsolute: (path: string) => string,
): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbs.map((crumb, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: crumb.label,
			...(crumb.href && { item: toAbsolute(crumb.href) }),
		})),
	};
}

/**
 * Builds a Schema.org FAQPage JSON-LD object from FAQ question/answer pairs.
 */
export function buildFAQSchema(
	items: { title: string; copy: string }[],
): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map(item => ({
			'@type': 'Question',
			name: item.title,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.copy,
			},
		})),
	};
}

/**
 * Builds dynamic FAQ items from race data, matching the live goodparty.org position page.
 */
export function buildDynamicFAQItems(
	race: RaceDetail,
	officeName: string,
	stateName: string,
): { title: string; copy: string }[] {
	const items: { title: string; copy: string }[] = [];

	if (race.frequency?.length) {
		const freq = race.frequency
			.map(v => String(v ?? '').trim())
			.filter(Boolean)
			.map(v => (/^\d+$/.test(v) ? `${v} years` : v))
			.join(', ');
		items.push({
			title: `How often is ${officeName} elected?`,
			copy: `The position of ${officeName} is typically elected every ${freq}.`,
		});
	}

	if (race.partisanType) {
		const isPartisan = race.partisanType.toLowerCase() === 'partisan';
		items.push({
			title: `What does it mean for an election to be ${race.partisanType.toLowerCase()}?`,
			copy: isPartisan
				? 'Partisan elections require candidates to declare a party affiliation, like Democrat, Republican, Libertarian, or Independent.'
				: 'Nonpartisan elections do not require candidates to declare a party affiliation on the ballot.',
		});
	}

	if (race.filingRequirements) {
		items.push({
			title: `What are the filing requirements to get on the ballot in ${stateName}?`,
			copy: race.filingRequirements,
		});
	}

	if (race.paperworkInstructions) {
		items.push({
			title: 'Where do I submit my candidate paperwork?',
			copy: race.paperworkInstructions,
		});
	}

	if (race.filingOfficeAddress) {
		items.push({
			title: 'Where is the filing office?',
			copy: race.filingOfficeAddress,
		});
	}

	if (race.filingPhoneNumber && /\d/.test(race.filingPhoneNumber)) {
		items.push({
			title: 'How can I get in touch with the filing office?',
			copy: `You can contact the filing office by calling ${race.filingPhoneNumber}.`,
		});
	}

	items.push({
		title: `How do I get started running for ${officeName}?`,
		copy: `You can start running for ${officeName} by checking to ensure you meet all filing deadlines and requirements. Next, you can prepare to file for office and start planning your campaign strategy. Get in touch with our team of campaign experts for help with any step of the campaign process!`,
	});

	if (race.isPrimary !== undefined || race.isRunoff !== undefined) {
		const parts: string[] = [];
		if (race.isPrimary !== undefined) parts.push(race.isPrimary ? 'a primary' : 'no primary');
		if (race.isRunoff !== undefined) parts.push(race.isRunoff ? 'a runoff' : 'no runoff');
		items.push({
			title: 'Is there a primary or runoff election for this office?',
			copy: `The next election for ${officeName} ${parts.length === 2 ? (race.isPrimary || race.isRunoff ? 'includes' : 'does not include') + ' a primary or runoff election' : `includes ${parts.join(' and ')} election`}.`,
		});
	}

	return items;
}
