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
