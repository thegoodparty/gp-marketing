export function extractNumbersFromString(str) {
	const numbers = str.match(/\d+/g);
	return numbers ? numbers.map(Number)[0] : 0;
}
