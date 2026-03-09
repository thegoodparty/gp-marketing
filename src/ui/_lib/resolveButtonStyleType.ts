import { buttonStyleTypeValues, primaryButtonStyleType } from '../_lib/designTypesStore';
import type { backgroundTypeValues, componentColorValues } from '../_lib/designTypesStore';

export type ButtonStyleType = (typeof buttonStyleTypeValues)[number];

/**
 * Parse an unknown value (e.g. from Sanity) into a valid button style type.
 * Returns 'primary' when the value is not in the allowlist.
 */
export function parseButtonStyleType(value: unknown): ButtonStyleType {
	if (typeof value === 'string' && (buttonStyleTypeValues as readonly string[]).includes(value)) {
		return value as ButtonStyleType;
	}
	return primaryButtonStyleType;
}

/**
 * Resolve the effective Button style based on the desired styleType
 * and the background it will be rendered on.
 */
export function resolveButtonStyleType(
	styleType: ButtonStyleType,
	backgroundColor?: (typeof backgroundTypeValues)[number],
) {
	const base = styleType ?? primaryButtonStyleType;

	if (backgroundColor === 'midnight') {
		if (base === 'secondary') return 'outline-inverse';
		if (base === 'ghost') return 'ghost-inverse';
		if (base === 'min-ghost') return 'min-ghost-inverse';
		return base;
	} else {
		if (base === 'secondary') return 'outline';
	}

	return base;
}

export function resolveInverseButtonStyleType(
	styleType: ButtonStyleType,
	backgroundColor: (typeof backgroundTypeValues)[number],
	color: (typeof componentColorValues)[number],
) {
	const base = styleType ?? 'primary';

	if (color === 'midnight') {
		if (backgroundColor === 'midnight') {
			if (base === 'secondary') return 'outline-inverse';
			if (base === 'ghost') return 'ghost';
			return base;
		} else {
			if (base === 'secondary') return 'outline-inverse';
			if (base === 'ghost') return 'ghost-inverse';
			return base;
		}
	} else {
		if (backgroundColor === 'midnight') {
			if (base === 'primary' && color !== 'cream') return 'secondary';
			if (base === 'secondary') return 'outline';
			if (base === 'ghost') return 'ghost';
			return base;
		} else {
			if (base === 'primary') return 'secondary';
			if (base === 'secondary') return 'outline';
			if (base === 'ghost') return 'ghost';
		}
	}

	return base;
}
