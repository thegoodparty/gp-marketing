export function parseAllowedFormIds(raw: string | undefined): Set<string> {
	return new Set((raw ?? '').split(',').filter(Boolean));
}

export function isAllowedFormId(formId: string | undefined, allowedFormIds: Set<string>): boolean {
	if (!formId) return false;
	if (allowedFormIds.size === 0) return true;
	return allowedFormIds.has(formId);
}
