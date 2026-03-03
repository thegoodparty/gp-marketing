export function transformToKebabCase(input: string): string {
	// If string already contains hyphens, return as is
	if (input.includes('-')) {
		return input;
	}

	// Convert PascalCase to kebab-case
	return input.replace(/([A-Z])/g, (match, letter, offset) => {
		// Don't add hyphen at the start of the string
		return offset === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`;
	});
}
