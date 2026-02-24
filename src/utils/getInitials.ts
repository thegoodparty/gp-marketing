/**
 * Generates initials from a person's name.
 * 
 * Takes the first letter of each word, converts to uppercase, and returns up to 2 characters.
 * 
 * @param name - The full name to generate initials from
 * @returns The initials (up to 2 characters) or empty string if name is invalid
 * 
 * @example
 * getInitials('John Doe') // 'JD'
 * getInitials('Mary Jane Watson') // 'MJ'
 * getInitials('Alice') // 'A'
 * getInitials('') // ''
 */
export function getInitials(name: string): string {
	if (!name || typeof name !== 'string') {
		return '';
	}

	return name
		.split(' ')
		.map(n => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}
