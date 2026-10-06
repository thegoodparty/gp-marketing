import type { SectionOverrides } from '~/PageSections';
import type { TokenMap } from '~/lib/resolveTokens';
import type { FeaturedCityCard, RaceDetail } from '~/types/elections';
import type { CandidateCard } from '~/ui/CandidatesBlock';
import type { BreadcrumbItem } from '~/ui/BreadcrumbBlock';
import type { OfficeItem } from '~/ui/ListOfOfficesBlock';
import { type FeaturedPeople, summarizeIndependents } from '~/lib/featuredPeople';
import type { ElectionItem } from '~/ui/ElectionsIndexBlock';
import { type ElectionsPositionHeroCandidate, heroLocation } from '~/ui/ElectionsPositionHero';
import {
	buildDynamicFAQItems,
	buildPositionPageSchema,
	getYearFromDateString,
} from '~/lib/electionsHelpers';
import {
	POSITION_CONTENT_IDS,
	type ElectionsPositionAttribute,
	type ElectionsPositionElectionType,
	type ElectionsPositionPerson,
} from '~/ui/ElectionsPositionContentBlock';
import {
	buildBreadcrumbSchema,
	buildFAQSchema,
	buildGovernmentOrganizationSchema,
	buildSchemaGraph,
	buildWebPageSchema,
} from '~/lib/schema';
import { resolveHowToRunGuide } from '~/lib/howToRunGuide';
import { toAbsoluteUrl } from '~/lib/url';
import { POSITION_PAGE_FAQ } from '~/constants/positionPageStaticSections';

export type PositionPageContext = {
	officeName: string;
	stateName: string;
	countyName?: string;
	cityName?: string;
	electionDate: string;
	filingDate: string;
	breadcrumbs: BreadcrumbItem[];
	// Required by the position template overrides; candidates pages legitimately omit it.
	candidatesHref?: string;
	positionHref?: string;
	locationHref?: string;
	race?: RaceDetail | null;
	// Used only by the position-page schema builders; optional for candidates pages.
	pageUrl?: string;
	/**
	 * The hero's ballot rows. `undefined` means the route could not read the
	 * race's candidates and the hero hides its ballot card.
	 */
	heroCandidates?: ElectionsPositionHeroCandidate[];
	/**
	 * Current holders of the position, for the content block's "Who's currently
	 * in office" list. `undefined` means election-api gave no answer and the
	 * list hides. `renderElectionsPositionPage` loads it when a route does not.
	 */
	officeholders?: ElectionsPositionPerson[];
	/** From `getNearbyOffices`; set by the position page renderer, absent on candidates pages. */
	nearbyOffices?: OfficeItem[];
};

/**
 * The hero reads the same race the page does. Winners and the previous cycle's
 * winners are left unset because election-api records no results yet; the
 * resolver reads that as "results pending" after election day.
 */
export function buildPositionHeroOverride(ctx: PositionPageContext): NonNullable<SectionOverrides['component_electionsPositionHero']> {
	return {
		officeName: ctx.officeName,
		stateName: ctx.stateName,
		countyName: ctx.countyName,
		cityName: ctx.cityName,
		electionDate: ctx.electionDate,
		filingDate: ctx.filingDate,
		electionDateIso: ctx.race?.electionDate ?? null,
		filingDateStartIso: ctx.race?.filingDateStart ?? null,
		filingDateEndIso: ctx.race?.filingDateEnd ?? null,
		candidates: ctx.heroCandidates,
		seatCount: ctx.race?.numberOfSeats ?? null,
		candidatesHref: ctx.candidatesHref,
	};
}

/** election-api sends these as it stores them ("COUNTY", "partisan"); the card reads them as words. */
function sentenceCase(value: string): string {
	const trimmed = value.trim();
	return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function heroCandidateToPerson(candidate: ElectionsPositionHeroCandidate, index: number): ElectionsPositionPerson {
	return {
		key: candidate.key ?? `c-${index}`,
		name: candidate.name,
		href: candidate.href,
		avatar: candidate.avatar,
		party: candidate.party,
		isPledged: candidate.isPledged,
		isWinner: candidate.isWinner,
		seatName: candidate.seatName,
		seatValue: candidate.seatValue,
		seatLabel: candidate.seatName && candidate.seatValue ? `${candidate.seatName} ${candidate.seatValue}` : undefined,
	};
}

/**
 * The seat or district dropdown. Only offered when every row it would narrow
 * carries a seat and there is more than one seat to choose from: a filter that
 * silently leaves half the rows in place is worse than none. Candidate rows do
 * not carry their sub-area yet, so today this stays hidden whenever candidates
 * are listed.
 */
export function buildPositionSeatFilter(
	people: ElectionsPositionPerson[],
	subAreaName: string | null | undefined,
): NonNullable<SectionOverrides['component_electionsPositionContentBlock']>['seatFilter'] {
	if (people.length === 0 || people.some(person => !person.seatValue)) return undefined;
	const values = Array.from(new Set(people.flatMap(person => (person.seatValue ? [person.seatValue] : [])))).sort((a, b) =>
		a.localeCompare(b, 'en', { numeric: true }),
	);
	if (values.length < 2) return undefined;
	const name = subAreaName?.trim() || 'seat';
	return {
		label: `Filter by ${name}`,
		options: values.map(value => ({ value, label: `${name} ${value}` })),
	};
}

export function buildPositionAboutAttributes(race: RaceDetail): ElectionsPositionAttribute[] {
	const items: ElectionsPositionAttribute[] = [];
	if (race.positionLevel) items.push({ label: 'Office level', value: sentenceCase(race.positionLevel) });
	if (race.frequency?.length) items.push({ label: 'Election frequency', value: formatFrequency(race.frequency) });
	if (race.salary) items.push({ label: 'Typical salary', value: race.salary });
	if (race.employmentType) items.push({ label: 'Commitment level', value: race.employmentType });
	if (race.partisanType) items.push({ label: 'Affiliation', value: sentenceCase(race.partisanType) });
	if (typeof race.numberOfSeats === 'number' && race.numberOfSeats > 0) {
		items.push({ label: 'Positions', value: race.numberOfSeats === 1 ? '1 open seat' : `${race.numberOfSeats} open seats` });
	}
	return items;
}

/**
 * Only the election types the race data can vouch for. Judicial and retention
 * elections are in the design, but election-api carries no flag for either, so
 * they are left out rather than shown unchecked as if we knew.
 */
export function buildPositionElectionTypes(race: RaceDetail): ElectionsPositionElectionType[] | undefined {
	const items: ElectionsPositionElectionType[] = [];
	if (race.partisanType) {
		const partisan = /partisan/i.test(race.partisanType) && !/non/i.test(race.partisanType);
		items.push({ label: 'Partisan election (party labels appear on ballots)', checked: partisan });
	}
	if (typeof race.isRunoff === 'boolean') items.push({ label: 'Run-off election', checked: race.isRunoff });
	return items.length > 0 ? items : undefined;
}

export function buildPositionFilingAttributes(ctx: Pick<PositionPageContext, 'race' | 'filingDate'>): ElectionsPositionAttribute[] {
	const race = ctx.race;
	const items: ElectionsPositionAttribute[] = [];
	if (!race) return items;
	if (race.filingRequirements) items.push({ label: 'Filing requirements', value: race.filingRequirements });
	if (race.filingDateStart || race.filingDateEnd) items.push({ label: 'Filing period', value: ctx.filingDate });
	if (race.paperworkInstructions) items.push({ label: 'Paperwork instructions', value: race.paperworkInstructions });
	if (race.filingOfficeAddress) items.push({ label: 'Where to file', value: race.filingOfficeAddress });
	if (race.filingPhoneNumber) items.push({ label: 'Filing phone', value: race.filingPhoneNumber });
	return items;
}

/**
 * The content block reads the same race and the same candidate rows as the
 * hero, so the two derive one state. The "Explore more races" card links to the
 * page's own location, which is the crumb before the position in the trail.
 */
export function buildPositionContentOverride(
	ctx: PositionPageContext,
): NonNullable<SectionOverrides['component_electionsPositionContentBlock']> {
	const race = ctx.race;
	const candidates = ctx.heroCandidates?.map(heroCandidateToPerson);
	const people = [...(candidates ?? []), ...(ctx.officeholders ?? [])];
	const locationHref =
		ctx.locationHref ??
		[...ctx.breadcrumbs].reverse().find(crumb => crumb.href && crumb.href !== '/elections' && crumb.label !== ctx.officeName)?.href;
	const about = race
		? {
				description: race.positionDescription,
				attributes: buildPositionAboutAttributes(race),
				electionTypes: buildPositionElectionTypes(race),
			}
		: undefined;
	return {
		electionDateIso: race?.electionDate ?? null,
		filingDateStartIso: race?.filingDateStart ?? null,
		filingDateEndIso: race?.filingDateEnd ?? null,
		candidates,
		officeholders: ctx.officeholders,
		seatFilter: buildPositionSeatFilter(people, people.find(person => person.seatName)?.seatName ?? null),
		locationHref: locationHref || undefined,
		shareUrl: ctx.pageUrl,
		about: about && (about.description || about.attributes.length > 0) ? about : undefined,
		howToRun: race ? { eligibility: race.eligibilityRequirements, filing: buildPositionFilingAttributes(ctx) } : undefined,
	};
}

function formatFrequency(frequency: (string | number)[]): string {
	return frequency
		.map(v => {
			const s = String(v ?? '').trim();
			if (/^\d+$/.test(s)) return `Every ${s} years`;
			return s;
		})
		.filter(Boolean)
		.join(', ');
}

export function buildPositionTokens(ctx: Pick<PositionPageContext, 'officeName' | 'stateName' | 'countyName' | 'cityName'>): TokenMap {
	const locationName = ctx.cityName ?? ctx.countyName ?? ctx.stateName;
	return {
		'[office name]': ctx.officeName,
		'[office]': ctx.officeName,
		'[Position Name]': ctx.officeName,
		'[State]': ctx.stateName,
		'[County or City]': locationName,
		'[location]': heroLocation(ctx),
	};
}

export function buildCandidatesTokens(ctx: Pick<PositionPageContext, 'officeName' | 'stateName' | 'countyName' | 'cityName'>): TokenMap {
	const locationName = ctx.cityName ?? ctx.countyName ?? ctx.stateName;
	return {
		'[office]': ctx.officeName,
		'[office name]': ctx.officeName,
		'[Position Name]': ctx.officeName,
		'[State]': ctx.stateName,
		'[County or City]': locationName,
		'[location]': heroLocation(ctx),
	};
}

export function buildProfileTokens(ctx: { candidateName: string; officeName: string }): TokenMap {
	return {
		'[candidate name]': ctx.candidateName,
		'[office name]': ctx.officeName,
	};
}

export function buildPositionSectionOverrides(ctx: PositionPageContext): SectionOverrides {
	const race = ctx.race;
	return {
		component_breadcrumbBlock: { breadcrumbs: ctx.breadcrumbs },
		// The hero's ballot card points down the page at the content block's
		// candidate rows, never at the /candidates page, which goes away with the
		// redesign (Emily, 2026-09-24). With no rows the list hides, and so does
		// the button: the card already says how many candidates there are.
		component_electionsPositionHero: {
			...buildPositionHeroOverride(ctx),
			candidatesHref: ctx.heroCandidates && ctx.heroCandidates.length > 0 ? `#${POSITION_CONTENT_IDS.candidates}` : undefined,
			resultsHref: ctx.heroCandidates && ctx.heroCandidates.length > 0 ? `#${POSITION_CONTENT_IDS.candidates}` : undefined,
		},
		component_electionsPositionContentBlock: buildPositionContentOverride(ctx),
		component_faqBlock: {
			items: race
				? buildDynamicFAQItems(race, ctx.officeName, ctx.stateName)
				: POSITION_PAGE_FAQ.items.map(item => ({ title: item.title, copy: item.copy })),
		},
		component_ctaBlock: {
			primaryButtonHref: ctx.candidatesHref,
		},
		component_electionPositionResourcesBlock: {
			guideHref: resolveHowToRunGuide({ officeName: ctx.officeName, race }).href,
		},
		component_testimonialBlockWithLink: { stateName: ctx.stateName },
		component_nearbyOffices: {
			// "More offices in Bay City, Michigan"; a state page names the state once,
			// not "Michigan, Michigan" (Emily, 2026-10-06).
			heading: `More offices in ${[ctx.cityName ?? ctx.countyName, ctx.stateName].filter(Boolean).join(', ')}`,
			offices: ctx.nearbyOffices ?? [],
			hidden: !ctx.nearbyOffices || ctx.nearbyOffices.length === 0,
		},
	};
}

export function buildCandidatesSectionOverrides(ctx: PositionPageContext & { candidates: CandidateCard[] }): SectionOverrides {
	return {
		component_breadcrumbBlock: { breadcrumbs: ctx.breadcrumbs },
		component_electionsPositionHero: buildPositionHeroOverride(ctx),
		component_candidatesBlock: {
			candidates: ctx.candidates,
			header: {
				title: `Candidates for ${ctx.officeName}`,
				copy: `Candidates running for ${ctx.officeName} in ${[ctx.cityName, ctx.countyName, ctx.stateName].filter(Boolean).join(', ')}.`,
			},
		},
		component_ctaImageBlock: {
			primaryButtonHref: ctx.locationHref,
		},
	};
}

export function buildPositionPageSchemas(ctx: PositionPageContext) {
	const race = ctx.race;
	const pageUrl = ctx.pageUrl;
	const positionPageSchema =
		race && pageUrl
			? buildPositionPageSchema({
					race,
					officeName: ctx.officeName,
					stateName: ctx.stateName,
					countyName: ctx.countyName,
					cityName: ctx.cityName,
					pageUrl,
				})
			: undefined;
	const breadcrumbSchema = buildBreadcrumbSchema(ctx.breadcrumbs, toAbsoluteUrl);
	const faqItems = race
		? buildDynamicFAQItems(race, ctx.officeName, ctx.stateName)
		: POSITION_PAGE_FAQ.items.map(item => ({ title: item.title, copy: item.copy }));
	const faqSchema = buildFAQSchema(faqItems);
	return { positionPageSchema, breadcrumbSchema, faqSchema };
}

export function buildCandidatesPageSchema(ctx: PositionPageContext) {
	const locationParts = [ctx.cityName, ctx.countyName, ctx.stateName].filter(Boolean);
	const locationName = locationParts.join(', ');
	const lastCrumbHref = ctx.breadcrumbs[ctx.breadcrumbs.length - 1]?.href;
	const candidatesPageUrl = lastCrumbHref ? toAbsoluteUrl(lastCrumbHref) : undefined;
	return buildSchemaGraph([
		candidatesPageUrl
			? buildWebPageSchema({
					url: candidatesPageUrl,
					name: `Candidates for ${ctx.officeName} in ${locationName}`,
					description: `Candidates running for ${ctx.officeName} in ${locationName}.`,
					pageType: 'CollectionPage',
				})
			: null,
		buildBreadcrumbSchema(ctx.breadcrumbs, toAbsoluteUrl),
	]);
}

export type ElectionsIndexPageContext = {
	breadcrumbs: BreadcrumbItem[];
	locationLevel: 'state' | 'county' | 'city' | 'district';
	stateName: string;
	countyName?: string;
	cityName?: string;
	bodyCopy?: string;
	heroTitle?: string;
	/** Kept for the search block that takes over the input the location hero used to render. */
	searchPlaceholder?: string;
	listHeading?: string;
	defaultYear?: number;
	availableYears?: number[];
	offices?: OfficeItem[];
	elections?: ElectionItem[];
	stateSlug?: string;
	pageUrl?: string;
	pageTitle?: string;
	pageDescription?: string;
	electionsIndexHeader?: { title?: string; copy?: string; searchPlaceholder?: string };
	electionsIndexHidden?: boolean;
	featuredCities?: FeaturedCityCard[];
	locationFacts?: {
		title?: string;
		factsCards?: Array<{ factType: string; label: string; value: string }>;
		hidden?: boolean;
	};
	/**
	 * The page's editorial prose for `component_locationEditorialBlock`, one
	 * string per paragraph. No route sets it yet: the copy is written per
	 * location outside this repo and the source it will be read from is not
	 * decided, so the block stays hidden on location pages until this is fed.
	 */
	locationEditorial?: {
		heading?: string;
		paragraphs?: string[];
	};
	/**
	 * The page's candidates and current officeholders for
	 * `component_featuredCandidatesBlock`, from `getFeaturedPeople`. Fetched by
	 * `renderElectionsIndexPage` when a route does not supply it; absent means
	 * the block hides.
	 */
	featuredPeople?: FeaturedPeople;
};

/**
 * Pledged candidates per race, keyed by race slug, from the same people the
 * featured block and the hero read, so the three can never disagree. A person
 * counts once per race. Races the budget left unasked have no entry, and the
 * offices list shows nothing for them rather than a zero.
 */
function withPledgedCounts(offices: OfficeItem[] | undefined, people: FeaturedPeople | undefined): OfficeItem[] | undefined {
	if (!offices || !people) return offices;
	const peopleByRace = new Map<string, Set<string>>();
	for (const person of people.candidates) {
		if (!person.isPledged || !person.raceSlug) continue;
		const key = person.raceSlug.toLowerCase();
		const set = peopleByRace.get(key) ?? new Set<string>();
		set.add((person.personId ?? person.href).toLowerCase());
		peopleByRace.set(key, set);
	}
	return offices.map(office => {
		const pledgedCount = office.raceSlug ? peopleByRace.get(office.raceSlug.toLowerCase())?.size : undefined;
		return pledgedCount ? { ...office, pledgedCount } : office;
	});
}

export function buildElectionsIndexSectionOverrides(ctx: ElectionsIndexPageContext): SectionOverrides {
	const independents = summarizeIndependents(ctx.featuredPeople, ctx.defaultYear);
	return {
		component_breadcrumbBlock: { breadcrumbs: ctx.breadcrumbs },
		component_locationLandingPageHero: {
			// The route phrases the whole headline. Passing it as `stateName` instead
			// left the block to rebuild the headline around it, which published
			// "Kane County, Upcoming elections in Kane County, Illinois".
			headline: ctx.heroTitle,
			locationLevel: ctx.locationLevel,
			stateName: ctx.stateName,
			countyName: ctx.countyName,
			cityName: ctx.cityName,
			bodyCopy: ctx.bodyCopy,
			// Both figures describe the ballot the offices list shows, in the year it
			// opens on (Emily, 2026-10-05): the races are counted off the same rows,
			// and the independents off the same races' candidates. Without that year
			// neither figure can be scoped, so both cards hide rather than one showing
			// an all-years total beside the other's absence.
			raceCount:
				ctx.offices && ctx.defaultYear !== undefined
					? ctx.offices.filter(office => getYearFromDateString(office.nextElectionDate) === ctx.defaultYear).length
					: null,
			independents: ctx.defaultYear === undefined ? { ...independents, candidateCount: null } : independents,
		},
		component_listOfOfficesBlock: {
			// Fallback only: the templates carry their own heading with location
			// tokens, and that is what normally renders.
			headline: ctx.listHeading,
			defaultYear: ctx.defaultYear,
			availableYears: ctx.availableYears,
			offices: withPledgedCounts(ctx.offices, ctx.featuredPeople),
			// A district page is a local ballot like a city's, so it offers Local, County and State.
			pageLevel: ctx.locationLevel === 'city' || ctx.locationLevel === 'district' ? 'local' : ctx.locationLevel,
		},
		component_electionsIndexBlock: {
			elections: ctx.elections,
			stateSlug: ctx.stateSlug,
			hidden: ctx.electionsIndexHidden,
			header: ctx.electionsIndexHeader,
		},
		// Always set, even to []: a location page must never fall through to the
		// block's national city list (see the SectionOverrides comment).
		component_featuredCitiesBlock: { cities: ctx.featuredCities ?? [] },
		component_locationFactsBlock: ctx.locationFacts
			? {
					headerTitle: ctx.locationFacts.title,
					factsCards: ctx.locationFacts.factsCards,
					hidden: ctx.locationFacts.hidden,
				}
			: undefined,
		component_locationEditorialBlock: ctx.locationEditorial
			? {
					heading: ctx.locationEditorial.heading,
					paragraphs: ctx.locationEditorial.paragraphs,
				}
			: undefined,
		component_featuredCandidatesBlock: ctx.featuredPeople
			? {
					candidates: ctx.featuredPeople.candidates,
					representatives: ctx.featuredPeople.representatives,
				}
			: { hidden: true },
		component_testimonialBlockWithLink: { stateName: ctx.stateName },
	};
}

export function buildElectionsIndexPageSchema(ctx: ElectionsIndexPageContext) {
	if (!ctx.pageUrl) return undefined;
	// Most-specific jurisdiction the page represents (city > county > state).
	const localityName = ctx.cityName ?? ctx.countyName ?? ctx.stateName;
	return buildSchemaGraph([
		buildWebPageSchema({
			url: ctx.pageUrl,
			name: ctx.pageTitle ?? ctx.stateName,
			description: ctx.pageDescription,
		}),
		buildBreadcrumbSchema(ctx.breadcrumbs, toAbsoluteUrl),
		buildGovernmentOrganizationSchema({
			url: ctx.pageUrl,
			name: `${localityName} Government`,
			areaServed: localityName,
		}),
	]);
}
