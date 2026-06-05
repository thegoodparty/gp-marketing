import { US_STATES } from '~/constants/usStates';
import type { CandidacyItem, PlaceItem, PlaceWithFacts, RaceDetail } from '~/types/elections';
import type { FactsCardProps } from '~/ui/FactsCard';

export { isCityOrTownMtfcc } from '~/lib/electionsApi';

import { permanentRedirect } from 'next/navigation';
import { isCityOrTownMtfcc, resolveCountySlugForPlace } from '~/lib/electionsApi';

const COUNTY_EQUIV_SUFFIX_RE =
	/\s+(County|Parish|City and Borough|City and County|Borough|Census Area|Municipality)$/i;
const COUNTY_EQUIV_TAIL_RE =
	/\s+(County|Parish|City and Borough|City and County|Borough|Census Area|Municipality)(?:\s+(County|Parish|City and Borough|City and County|Borough|Census Area|Municipality))*$/i;

type CanonicalSuffix =
	| 'County'
	| 'Parish'
	| 'Borough'
	| 'Census Area'
	| 'City and Borough'
	| 'City and County'
	| 'Municipality';

type CanonicalCountyName = {
	displayName: string;
	baseName: string;
	suffixLabel: CanonicalSuffix;
};

const SUFFIX_NORMALIZATION: Record<string, CanonicalSuffix> = {
	county: 'County',
	parish: 'Parish',
	borough: 'Borough',
	'census area': 'Census Area',
	'city and borough': 'City and Borough',
	'city and county': 'City and County',
	municipality: 'Municipality',
};

function normalizeWhitespace(value: string): string {
	return value.replace(/\s+/g, ' ').trim();
}

function toCanonicalSuffix(value: string): CanonicalSuffix | null {
	const normalized = normalizeWhitespace(value).toLowerCase();
	return SUFFIX_NORMALIZATION[normalized] ?? null;
}

function pickSuffixByState(
	stateCode: string,
	existingSuffix: CanonicalSuffix | null,
): CanonicalSuffix {
	const upper = stateCode.toUpperCase();
	if (upper === 'AK') {
		if (
			existingSuffix === 'City and Borough' ||
			existingSuffix === 'Census Area' ||
			existingSuffix === 'Borough' ||
			existingSuffix === 'Municipality'
		) {
			return existingSuffix;
		}
		return 'Borough';
	}
	if (upper === 'LA') return 'Parish';
	if (existingSuffix === 'City and County') return existingSuffix;
	return 'County';
}

/**
 * Canonical county-equivalent naming for county-level display surfaces.
 * Enforces AK/LA conventions and defensively cleans malformed double suffixes.
 */
export function canonicalizeCountyEquivalentName(
	stateCode: string,
	rawPlaceName: string,
): CanonicalCountyName {
	const normalizedName = normalizeWhitespace(rawPlaceName);
	const tailMatch = normalizedName.match(COUNTY_EQUIV_TAIL_RE);
	const existingSuffix = tailMatch ? toCanonicalSuffix(tailMatch[1] ?? '') : null;
	const suffixLabel = pickSuffixByState(stateCode, existingSuffix);
	const baseName = normalizeWhitespace(normalizedName.replace(COUNTY_EQUIV_TAIL_RE, '')) || normalizedName;
	const displayName = `${baseName} ${suffixLabel}`.trim();
	return { displayName, baseName, suffixLabel };
}

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
	const match = COUNTY_EQUIV_SUFFIX_RE.exec(name);
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
	if (!DATE_ONLY_REGEX.test(dateOnly)) {
		throw new Error(`Invalid date-only string: ${dateOnly}`);
	}
	const parts = dateOnly.split('-').map(Number);
	const y = parts[0];
	const m = parts[1];
	const d = parts[2];
	if (y === undefined || m === undefined || d === undefined) {
		throw new Error(`Invalid date-only string: ${dateOnly}`);
	}
	if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
		throw new Error(`Invalid date-only string: ${dateOnly}`);
	}
	if (m < 1 || m > 12 || d < 1 || d > 31) {
		throw new Error(`Invalid date-only string: ${dateOnly}`);
	}
	const date = new Date(y, m - 1, d);
	if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
		throw new Error(`Invalid date-only string: ${dateOnly}`);
	}
	return date;
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
	const yearMatch = /\b(19|20)\d{2}\b/.exec(dateStr);
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
	const best = matching[0];
	if (!best) return null;
	return { name: best.name, slug: best.slug };
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

type FactField =
	| 'population'
	| 'density'
	| 'incomeHouseholdMedian'
	| 'unemploymentRate'
	| 'homeValue';

const FACT_SIGNATURE_FIELDS: FactField[] = [
	'population',
	'density',
	'incomeHouseholdMedian',
	'unemploymentRate',
	'homeValue',
];

export function hasSuspiciousFactsMatch(
	cityPlace: PlaceWithFacts | null | undefined,
	countyPlace: PlaceWithFacts | null | undefined,
): boolean {
	if (!cityPlace || !countyPlace) return false;

	let comparedFields = 0;
	for (const field of FACT_SIGNATURE_FIELDS) {
		const cityValue = cityPlace[field];
		const countyValue = countyPlace[field];
		if (typeof cityValue !== 'number' || typeof countyValue !== 'number') continue;
		comparedFields += 1;
		if (cityValue !== countyValue) return false;
	}

	// Require multiple identical facts to avoid noisy single-field matches.
	return comparedFields >= 2;
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
			value['value'] = amounts[0];
		} else {
			value['minValue'] = Math.min(...amounts);
			value['maxValue'] = Math.max(...amounts);
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

	const addressLocality = cityName ?? countyName ?? race.Place?.name ?? stateName;

	const postalAddress: Record<string, unknown> = {
		'@type': 'PostalAddress',
		addressLocality,
		addressRegion: race.state,
		addressCountry: 'US',
	};

	const filingAddr = race.filingOfficeAddress?.trim();
	if (filingAddr) {
		postalAddress['streetAddress'] = filingAddr;
		const zipMatch = filingAddr.match(/\b\d{5}(?:-\d{4})?\b/);
		if (zipMatch?.[0]) {
			postalAddress['postalCode'] = zipMatch[0];
		}
	}

	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'JobPosting',
		title: officeName,
		sameAs: pageUrl,
		description,
		datePosted,
		directApply: false,
		hiringOrganization: {
			'@type': 'Organization',
			name: orgName,
		},
		jobLocation: {
			'@type': 'Place',
			address: postalAddress,
		},
	};

	const validThrough = race.filingDateEnd?.slice(0, 10) || race.electionDate?.slice(0, 10);
	if (validThrough) {
		schema['validThrough'] = validThrough;
	}

	schema['employmentType'] = race.employmentType
		? mapPositionEmploymentType(race.employmentType)
		: 'FULL_TIME';

	if (race.salary) {
		const baseSalary = parseSalaryString(race.salary);
		if (baseSalary) {
			schema['baseSalary'] = baseSalary;
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

/** Formats election frequency years for profile sidebar (e.g. [4] → "4 Years"). */
export function formatTermLength(
	frequency: Array<number | string> | undefined | null,
): string | undefined {
	if (!frequency?.length) return undefined;
	const years = Number(frequency[0]);
	if (!Number.isFinite(years) || years <= 0) return undefined;
	return years === 1 ? '1 Year' : `${years} Years`;
}

/** Infers Lucide icon name for elections sidebar links from URL. */
export function inferSidebarLinkIcon(href: string): string {
	const lower = href.toLowerCase();
	if (lower.startsWith('mailto:')) return 'mail';
	if (lower.includes('linkedin.com')) return 'linkedin';
	if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook';
	if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
	if (lower.includes('instagram.com')) return 'instagram';
	return 'globe';
}

/** Human-readable label for a candidate profile link (first URL is always Website). */
export function formatSidebarLinkLabel(href: string, index: number): string {
	if (index === 0) return 'Website';
	const lower = href.toLowerCase();
	if (lower.startsWith('mailto:')) return 'Email';
	if (lower.includes('linkedin.com')) return 'LinkedIn';
	if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'Facebook';
	if (lower.includes('twitter.com') || lower.includes('x.com')) return 'Twitter';
	if (lower.includes('instagram.com')) return 'Instagram';
	try {
		const url = new URL(href.startsWith('http') ? href : `https://${href}`);
		const host = url.hostname.replace(/^www\./, '');
		return host.charAt(0).toUpperCase() + host.slice(1);
	} catch {
		return `Link ${index + 1}`;
	}
}

export type SidebarLink = { label: string; icon: string; href: string };

export type SidebarLinkInput = { label: string; href: string; icon?: string };

/** Normalize URLs for dedup (scheme, www, trailing slash). mailto: compared case-insensitively. */
export function normalizeLinkHrefForCompare(href: string): string {
	const trimmed = href.trim();
	const lower = trimmed.toLowerCase();
	if (lower.startsWith('mailto:')) {
		return lower;
	}
	try {
		const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
		const host = url.hostname.replace(/^www\./i, '').toLowerCase();
		const path = url.pathname.replace(/\/$/, '') || '';
		return `${host}${path}`;
	} catch {
		return lower;
	}
}

export function linkHrefAlreadyPresent(
	links: ReadonlyArray<{ href: string }>,
	href: string,
): boolean {
	const target = normalizeLinkHrefForCompare(href);
	return links.some((l) => normalizeLinkHrefForCompare(l.href) === target);
}

/** Prepends claimed campaign website when not already present (by href, not label). */
export function prependClaimedWebsiteIfNew(
	links: SidebarLinkInput[],
	claimedWebsite: string,
): SidebarLink[] {
	const normalized = links.map((link) => ({
		...link,
		icon: link.icon ?? inferSidebarLinkIcon(link.href),
	}));
	if (linkHrefAlreadyPresent(normalized, claimedWebsite)) {
		return normalized;
	}
	return [
		{
			label: 'Website',
			icon: inferSidebarLinkIcon(claimedWebsite),
			href: claimedWebsite,
		},
		...normalized,
	];
}

export type RaceSlugEntry = { slug?: string; positionLevel?: string };

export type BuildElectionPositionHrefOptions = {
	citySlugToCountySlug?: Map<string, string>;
	/** When true, omit CITY 3-part slugs with no county mapping (sitemap behavior). */
	skipUnmappedCity?: boolean;
};

/**
 * Builds elections position page path from a race slug and optional county lookup.
 * Mirrors buildRaceEntries URL rules in sitemap-entries.ts.
 */
export function buildElectionPositionHrefFromRaceSlug(
	race: RaceSlugEntry,
	options?: BuildElectionPositionHrefOptions,
): string | undefined {
	if (!race.slug) return undefined;
	const parts = race.slug.split('/').filter(Boolean);
	const positionSlug = parts.pop();
	if (!positionSlug || parts.length === 0) return undefined;

	const level = (race.positionLevel ?? '').toUpperCase();

	if (level === 'CITY' || level === 'LOCAL') {
		const citySlug = parts.join('/');
		const countySlug = options?.citySlugToCountySlug?.get(citySlug);
		if (countySlug) {
			const citySegment = parts.pop();
			if (!citySegment) return undefined;
			return `/elections/${countySlug}/${citySegment}/position/${positionSlug}`;
		}
		if (level === 'CITY' && parts.length === 2 && options?.skipUnmappedCity) {
			return undefined;
		}
	}

	const prefix = parts.join('/');
	return `/elections/${prefix}/position/${positionSlug}`;
}

/** Builds elections position page path from a race slug (e.g. ok/foo/local-school-board). */
export function buildRacePositionHref(raceSlug: string | undefined): string | undefined {
	return buildElectionPositionHrefFromRaceSlug({ slug: raceSlug });
}

/** Builds elections candidates listing path from a race slug entry. */
export function buildRaceCandidatesHref(
	race: RaceSlugEntry,
	options?: BuildElectionPositionHrefOptions,
): string | undefined {
	const positionHref = buildElectionPositionHrefFromRaceSlug(race, options);
	return positionHref ? `${positionHref}/candidates` : undefined;
}

/**
 * On 3-level county routes (`/elections/[state]/[county]/position/...`), city/town
 * races must redirect to the 4-level URL that includes the city segment. This is
 * NOT the same as the county-correction redirect on 4-level pages — the target here
 * is always a different route handler, so no redirect loop is possible.
 */
export async function redirectCityRaceToFourLevelUrl(
	race: Pick<RaceDetail, 'Place'> | null | undefined,
	stateCode: string,
	state: string,
	county: string,
	pathSuffix: string,
): Promise<void> {
	if (!race?.Place || !isCityOrTownMtfcc(race.Place.mtfcc)) return;
	const citySegment = race.Place.slug?.split('/').pop()?.toLowerCase();
	if (!citySegment) return;
	const canonicalCountySlug = race.Place.countyName
		? await resolveCountySlugForPlace(stateCode, race.Place.countyName)
		: undefined;
	const targetCounty = canonicalCountySlug ?? `${state.toLowerCase()}/${county.toLowerCase()}`;
	permanentRedirect(`/elections/${targetCounty}/${citySegment}${pathSuffix}`);
}
