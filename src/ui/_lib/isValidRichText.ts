import type { ReactNode } from 'react';

export function isValidRichText(field?: ReactNode) {
	return !field || field['props']?.['value']?.length === 0 || (typeof field === 'object' && field?.length === 0) ? null : true;
}
