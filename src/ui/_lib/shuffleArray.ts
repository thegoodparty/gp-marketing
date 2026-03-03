/**
 * Returns a new array with the same items in random order.
 * Uses the Fisher–Yates shuffle algorithm.
 */
export function shuffleArray<T>(array: T[]): T[] {
	const result = [...array]; // copy to avoid mutating the original
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
