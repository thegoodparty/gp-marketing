import { stegaClean } from '@sanity/client/stega';
import type { Sections } from '~/PageSections';

import type { ComponentButtonProps } from '~/ui/Inputs/Button';

export type ButtonsType = Exclude<Extract<Sections, { _type: 'component_hero' }>['summaryInfo'], null | undefined>['list_buttons'];

export type ButtonType = Exclude<ButtonsType, null | undefined>[number];

export type RawCtaFields = {
	action?: ButtonType['action'];
	field_ctaActionWithShared?: ButtonType['action'];
	text?: string | null;
	field_buttonText?: string | null;
	_key?: string | null;
};

/** Raw Sanity/GROQ CTA payload; may include link, anchor, etc. preserved via spread. */
export type RawCtaInput = RawCtaFields & Partial<Omit<ButtonType, '_key' | 'action' | 'text'>>;

/**
 * Type guard for raw CTA/button data from Sanity (e.g. ctaAction, ctaActionWithShared).
 * Ensures the value has the minimal shape expected by transformButton and transformButtons.
 */
export function isButtonType(value: unknown): value is ButtonType {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}
	const obj = value as Record<string, unknown>;
	return 'action' in obj && obj.action != null;
}

export function normalizeRawCtaToButton(
	raw: RawCtaInput,
	keySuffix: string,
): ButtonType | undefined {
	const action = raw.action ?? raw.field_ctaActionWithShared;
	if (action == null) {
		return undefined;
	}
	return {
		...raw,
		action,
		text: raw.text ?? raw.field_buttonText ?? null,
		_key: keySuffix,
	} as ButtonType;
}

function resolveHierarchy(
	hierarchy: ButtonType['hierarchy'],
): 'primary' | 'secondary' | 'ghost' | undefined {
	if (!hierarchy) return undefined;
	const cleaned = stegaClean(hierarchy);
	if (cleaned === 'Primary') return 'primary';
	if (cleaned === 'Secondary') return 'secondary';
	return 'ghost';
}

export function resolveButtonHref(button: ButtonType): string | undefined {
	const action = stegaClean(button.action);
	let href: string | undefined;

	switch (action) {
		case 'Internal':
		case 'Contact':
			href =
				button.link && 'href' in button.link
					? ((button.link.href as string | undefined) ?? undefined)
					: undefined;
			break;
		case 'External':
			href = button.field_externalLink ?? undefined;
			break;
		case 'Anchor':
			href = button.anchor ?? undefined;
			break;
		case 'Download':
			href = button.ref_download?.file?.url ?? undefined;
			break;
		case 'LogIn':
			href = 'https://app.goodparty.org/login';
			break;
		case 'SignUp':
			href = 'https://app.goodparty.org/sign-up';
			break;
		default:
			href = undefined;
	}

	return href;
}

/** True when href is a non-empty string suitable for navigation or fallback decisions. */
export function isUsableHref(href: string | undefined): href is string {
	return href != null && href !== '';
}

export function transformButton(button: ButtonType): ComponentButtonProps | undefined {
	const action = stegaClean(button.action);
	const href = resolveButtonHref(button);

	switch (action) {
		case 'Internal':
			if (!isUsableHref(href)) return undefined;
			return {
				_key: button._key,
				formId: (button as { formId?: string }).formId,
				label: button.text ?? button.link.title ?? button.link.name,
				buttonType: 'internal',
				href,
				buttonProps: {
					styleType: resolveHierarchy(button.hierarchy),
				},
			};
		case 'Contact':
			if (!isUsableHref(href)) return undefined;
			return {
				_key: button._key,
				formId: (button as { formId?: string }).formId,
				label: button.text ?? button.link.title ?? button.link.name,
				buttonType: 'contact',
				href,
				buttonProps: {
					styleType: resolveHierarchy(button.hierarchy),
				},
			};
		case 'External':
			if (!isUsableHref(href)) return undefined;
			return {
				_key: button._key,
				formId: (button as { formId?: string }).formId,
				label: button.text ?? button.field_externalLink,
				buttonType: 'external',
				href,
				buttonProps: {
					styleType: resolveHierarchy(button.hierarchy),
				},
			};
		case 'Anchor':
			if (!isUsableHref(href)) return undefined;
			return {
				_key: button._key,
				formId: (button as { formId?: string }).formId,
				label: button.text,
				buttonType: 'anchor',
				href,
				buttonProps: {
					styleType: resolveHierarchy(button.hierarchy),
				},
			};
		case 'Download':
			if (!isUsableHref(href)) return undefined;
			return {
				_key: button._key,
				formId: (button as { formId?: string }).formId,
				label: button.text ?? button.ref_download.name,
				buttonType: 'download',
				href,
				buttonProps: {
					styleType: resolveHierarchy(button.hierarchy),
				},
			};
		case 'LogIn':
			if (!isUsableHref(href)) return undefined;
			return {
				_key: button._key,
				formId: (button as { formId?: string }).formId,
				label: button.text ?? 'Login',
				buttonType: 'external',
				href,
				buttonProps: {
					styleType: resolveHierarchy(button.hierarchy),
				},
			};
		case 'SignUp':
			if (!isUsableHref(href)) return undefined;
			return {
				_key: button._key,
				formId: (button as { formId?: string }).formId,
				label: button.text ?? 'Sign up',
				buttonType: 'external',
				href,
				buttonProps: {
					styleType: resolveHierarchy(button.hierarchy),
				},
			};
		default:
			return undefined;
	}
}

export function transformButtons(buttons?: ButtonsType): ComponentButtonProps[] | undefined {
	if (!buttons) {
		return undefined;
	}

	const transformedButtons: ComponentButtonProps[] = [];
	for (const button of buttons) {
		if (!button) {
			continue;
		}
		const transformed = transformButton(button);
		if (transformed) {
			transformedButtons.push(transformed);
		}
	}
	return transformedButtons;
}
