/**
 * Array of valid US state codes (including DC).
 * Used for validation in StateIcon component.
 */
export const US_STATE_CODES = [
	'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA',
	'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA',
	'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
	'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
	'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

export type USStateCode = (typeof US_STATE_CODES)[number];

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
