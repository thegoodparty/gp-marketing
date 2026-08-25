import type { USStateCode } from '~/constants/usStates';
import { US_STATES_TUPLES } from '~/constants/usStates';

export type { USStateCode };

/**
 * Array of valid US state codes (including DC).
 * Derived from US_STATES_TUPLES.
 */
export const US_STATE_CODES = US_STATES_TUPLES.map(([code]) => code) as readonly USStateCode[];

/**
 * Validates if a string is a valid US state code.
 * 
 * @param code - The state code to validate
 * @returns true if the code is valid, false otherwise
 */
export function isValidStateCode(code: string | null | undefined): code is USStateCode {
	if (!code || typeof code !== 'string') {
		return false;
	}
	return US_STATE_CODES.includes(code.toUpperCase() as USStateCode);
}

/** Full state name (lowercased) → code, for normalizing a spelled-out state. */
const CODE_BY_STATE_NAME = new Map<string, USStateCode>(
	US_STATES_TUPLES.map(([code, name]) => [name.toLowerCase(), code as USStateCode]),
);

/**
 * Coerces a state to its two-letter code, accepting either spelling.
 *
 * `Person.state` is treated as a code everywhere downstream — it builds
 * `/elections/<code>` and fills schema.org `addressRegion` — but the mart does
 * not guarantee one. Rows sourced from BallotReady carry `MN`; rows the ETL
 * creates from a gp-api account carry `Minnesota`, which is gp-api's own
 * format passed straight through. Lowercasing that second shape produced
 * `/elections/minnesota`, which 404s.
 *
 * Returns null for anything that is neither, so a caller can tell "no state"
 * from "a state I cannot place" rather than propagating a value that only
 * looks like a code.
 */
export function normalizeStateCode(value: string | null | undefined): USStateCode | null {
	if (!value || typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (isValidStateCode(trimmed)) return trimmed.toUpperCase() as USStateCode;
	return CODE_BY_STATE_NAME.get(trimmed.toLowerCase()) ?? null;
}
