import { stegaClean } from '@sanity/client/stega';
import type { Sections } from '~/PageSections';
import { resolveInternalLinkHref, type FaqLike } from '~/lib/faqSlugs';

import type { ComponentButtonProps } from '~/ui/Inputs/Button';

export type ButtonsType = Exclude<Extract<Sections, { _type: 'component_hero' }>['summaryInfo'], null | undefined>['list_buttons'];

export type ButtonType = Exclude<ButtonsType, null | undefined>[number];

export type RawCtaFields = {
	action?: ButtonType['action'];
	field_ctaAction?: ButtonType['action'];
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
function hasCtaAction(value: Record<string, unknown>): boolean {
	return (
		('action' in value && value['action'] != null) ||
		('field_ctaAction' in value && value['field_ctaAction'] != null) ||
		('field_ctaActionWithShared' in value && value['field_ctaActionWithShared'] != null)
	);
}

export function isButtonType(value: unknown): value is ButtonType {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}
	const obj = value as Record<string, unknown>;
	return hasCtaAction(obj);
}

export function normalizeRawCtaToButton(raw: RawCtaInput, keySuffix: string): ButtonType | undefined {
	const action = raw.action ?? raw.field_ctaAction ?? raw.field_ctaActionWithShared;
	if (action == null) {
		return undefined;
	}
	const button = {
		...raw,
		action,
		text: raw.text ?? raw.field_buttonText ?? null,
		_key: keySuffix,
	};
	return button as ButtonType;
}

function resolveHierarchy(hierarchy: ButtonType['hierarchy']): 'primary' | 'secondary' | 'ghost' | undefined {
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
		case null:
		case 'Reference':
			return undefined;
		case 'Internal':
		case 'Contact':
			href = resolveInternalLinkHref(button.link as FaqLike);
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
		case null:
		case 'Reference':
			return undefined;
		case 'Internal':
			if (!isUsableHref(href)) return undefined;
			return {
				_key: button._key,
				formId: (button as { formId?: string }).formId,
				label:
					button.text ??
					(button.link && 'title' in button.link ? button.link.title : null) ??
					(button.link && 'name' in button.link ? button.link.name : null),
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
				label:
					button.text ??
					(button.link && 'title' in button.link ? button.link.title : null) ??
					(button.link && 'name' in button.link ? button.link.name : null),
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
				label: button.text ?? button.ref_download?.name,
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
	for (const [index, button] of buttons.entries()) {
		if (!button) {
			continue;
		}
		const normalized = normalizeRawCtaToButton(button as RawCtaInput, button._key ?? `btn-${index}`);
		if (!normalized) {
			continue;
		}
		const transformed = transformButton(normalized);
		if (transformed) {
			transformedButtons.push(transformed);
		}
	}
	return transformedButtons;
}
