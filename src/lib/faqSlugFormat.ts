export const FAQ_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyFaqQuestion(question: string): string {
	return question
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

export function isValidFaqSlug(slug: string): boolean {
	return FAQ_SLUG_PATTERN.test(slug);
}

export function validateFaqSlugFormat(slug: unknown): true | string {
	if (typeof slug !== 'string') return 'Slug is required';
	const trimmed = slug.trim();
	if (!trimmed) return 'Slug is required';
	if (trimmed !== slug) return 'Slug must not have leading or trailing whitespace';
	if (!isValidFaqSlug(trimmed)) {
		return 'Slug must be lowercase letters, numbers, and hyphens only (e.g. what-is-goodpartyorg)';
	}
	return true;
}
