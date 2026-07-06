export function isSafeRelativeRedirect(path: string): boolean {
	let decoded = path;
	try {
		decoded = decodeURIComponent(path);
	} catch {
		// malformed %-encoding — use original
	}
	return decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.startsWith('/\\');
}
