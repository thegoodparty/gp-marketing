export function isSafeRelativeRedirect(path: string): boolean {
	let decoded = path;
	try {
		let prev: string;
		do {
			prev = decoded;
			decoded = decodeURIComponent(decoded);
		} while (decoded !== prev);
	} catch {
		// malformed %-encoding — use last successfully decoded value
	}
	return decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.startsWith('/\\');
}
