import type { backgroundTypeValues, buttonStyleTypeValues, componentColorValues } from '../_lib/designTypesStore';

/**
 * Resolve the effective Button style based on the desired styleType
 * and the background it will be rendered on.
 */
export function resolveButtonStyleType(
	styleType: (typeof buttonStyleTypeValues)[number],
	backgroundColor?: (typeof backgroundTypeValues)[number],
) {
	const base = styleType ?? 'primary';

	if (backgroundColor === 'midnight') {
		if (base === 'secondary') return 'outline-inverse';
		if (base === 'ghost') return 'ghost-inverse';
		if (base === 'min-ghost') return 'min-ghost-inverse';
		return base;
	} else {
		if (base === 'secondary') return 'outline';
	}

	// // Default (e.g. "cream") mapping
	// if (base === 'secondary') return 'outline';
	return base;
}

export function resolveInverseButtonStyleType(
	styleType: (typeof buttonStyleTypeValues)[number],
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
