/**
 * Maps a value from a range defined by a1 and a2 to a new range defined by b1 and b2.
 * @param x - The value to be mapped.
 * @param a1 - The lower bound of the original range.
 * @param a2 - The upper bound of the original range.
 * @param b1 - The lower bound of the new range.
 * @param b2 - The upper bound of the new range.
 * @returns The mapped value within the new range.
 */
export function mapLinear(x: number, a1: number, a2: number, b1: number, b2: number) {
	return b1 + ((x - a1) * (b2 - b1)) / (a2 - a1);
}
