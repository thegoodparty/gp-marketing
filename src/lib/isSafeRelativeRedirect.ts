export function isSafeRelativeRedirect(path: string): boolean {
	return path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\');
}
