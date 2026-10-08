import { stripCityTypeSuffix, stripCountySuffix } from '~/lib/electionsHelpers';

/**
 * Plain-English names for election-api's normalised office names, used when
 * BallotReady's own names cannot settle it (see `officeDisplayName`). Emily's
 * table, 2026-10-08. "State Representative" is left as it is on purpose.
 */
export const OFFICE_NAME_FALLBACKS: Record<string, string> = {
	'City Legislature': 'City Council',
	'City Executive-Mayor': 'Mayor',
	'Local School Board': 'School Board',
	'County Legislature-Executive Board': 'County Board',
	'Township Trustee-Township Council': 'Township Trustee',
	'Township Treasurer-Fiscal Officer': 'Township Treasurer',
	'County Treasurer-Finance Officer': 'County Treasurer',
	'County Coroner-Medical Examiner': 'County Coroner',
	'County Assessor-Property Appraiser': 'County Assessor',
	'Township Tax Collector-Receiver': 'Township Tax Collector',
	'County Recorder-Register of Deeds-Register of Mesne Conveyance': 'County Recorder',
	'City Clerk-Ward Officer': 'City Clerk',
	'City Treasurer-Finance Officer': 'City Treasurer',
	'Local Court Judge': 'Local Judge',
	'State Trial Court Judge - General': 'Trial Court Judge',
	'City Legislature-Chair-President of Council': 'City Council President',
	'Local Higher Education Board-Community College Board': 'Community College Board',
	'Soil and Water District Board-Watershed Improvement District Board': 'Soil and Water District Board',
	'Healthcare District Board-Hospital District Board': 'Hospital District Board',
	'County Legislative Chair (non-executive)': 'County Board Chair',
	'County Executive Head': 'County Executive',
};

/** BallotReady names that no rule reads well; named by hand. */
const SPECIAL_BALLOTREADY_NAMES: Record<string, string> = {
	'Indianapolis/Marion City/County Council': 'City-County Council',
};

/** Office levels whose BallotReady names carry the place and read well without it. */
const LOCAL_LEVELS = new Set(['LOCAL', 'CITY', 'COUNTY', 'TOWNSHIP', 'REGIONAL']);

export type OfficeNameSource = {
	normalizedPositionName?: string | null;
	name?: string | null;
	positionNames?: string[] | null;
	positionLevel?: string | null;
};

/** "Garden Grove City Council - District 3" -> "Garden Grove City Council"; "(Term Commencing 1/2)" and the like drop too. */
export function stripSeat(positionName: string): string {
	const beforeSeat = positionName.split(' - ')[0] ?? positionName;
	return beforeSeat.replace(/\s*\((?:Term|Seat|Position|Place)[^)]*\)\s*$/i, '').trim();
}

/**
 * The generic cleanup for a normalised name the table does not cover: the
 * first of hyphen-joined alternatives, without "(Joint)" or "(non-executive)".
 * "County Court Judge - Probate-County Court Judge - Surrogate" -> "County Court Judge - Probate".
 */
export function cleanNormalizedName(name: string): string {
	const withoutQualifiers = name.replace(/\s*\((?:joint|non-executive)\)/gi, '');
	return (withoutQualifiers.split(/-(?=[A-Z])/)[0] ?? withoutQualifiers).trim();
}

/**
 * The office name a page shows. BallotReady's own names ("Orange County Board
 * of Supervisors", "Harris County Commission") are what voters call an office,
 * so for a local office they come first, with the seat and the place's own name
 * taken off, since the page already says where it is: "Board of Supervisors",
 * "County Commission", "City Council", "Mayor". When those names disagree (a
 * county page lumping several community college districts) or are missing, the
 * normalised name goes through Emily's table, then the generic cleanup. State
 * and federal offices keep their normalised names ("State Representative" stays).
 */
export function officeDisplayName(race: OfficeNameSource, place?: { name?: string | null } | null): string {
	const normalized = race.normalizedPositionName ?? race.name ?? 'Position';
	const level = race.positionLevel?.toUpperCase();
	if (level && LOCAL_LEVELS.has(level)) {
		const fromBallotReady = fromPositionNames(race.positionNames ?? [], place?.name ?? null);
		if (fromBallotReady) return fromBallotReady;
	}
	return OFFICE_NAME_FALLBACKS[normalized] ?? cleanNormalizedName(normalized);
}

function fromPositionNames(positionNames: string[], placeName: string | null): string | null {
	const bases = [...new Set(positionNames.map(stripSeat).filter(Boolean))];
	if (bases.length !== 1) return null;
	const base = bases[0] ?? '';
	const special = SPECIAL_BALLOTREADY_NAMES[base];
	if (special) return special;
	let name = base;
	if (placeName) {
		const placeBase = stripCityTypeSuffix(stripCountySuffix(placeName.trim()));
		if (placeBase && name.toLowerCase().startsWith(`${placeBase.toLowerCase()} `)) name = name.slice(placeBase.length).trim();
	}
	if (/^city mayor$/i.test(name)) name = 'Mayor';
	// "County Board of Supervisors" is a board of supervisors; "County Board" on
	// its own, or "County Commission", keeps the word the office is known by.
	name = name.replace(/^County Board of /i, 'Board of ');
	return name.length > 0 ? name : null;
}
