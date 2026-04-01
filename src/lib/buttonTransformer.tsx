import { stegaClean } from '@sanity/client/stega';
import type { Sections } from '~/PageSections';

import type { ComponentButtonProps } from '~/ui/Inputs/Button';

export type ButtonsType = Exclude<Extract<Sections, { _type: 'component_hero' }>['summaryInfo'], null | undefined>['list_buttons'];

export type ButtonType = Exclude<ButtonsType, null | undefined>[number];

/**
 * Type guard for raw CTA/button data from Sanity (e.g. ctaAction, ctaActionWithShared).
 * Ensures the value has the minimal shape expected by resolveCTALink and transformButtons.
 */
export function isButtonType(value: unknown): value is ButtonType {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}
	const obj = value as Record<string, unknown>;
	return 'action' in obj && typeof obj.action !== 'undefined';
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

	switch (action) {
		case 'Internal':
		case 'Contact':
			return button.link && 'href' in button.link ? (button.link.href as string | undefined) ?? undefined : undefined;
		case 'External':
			return button.field_externalLink ?? undefined;
		case 'Anchor':
			return button.anchor ?? undefined;
		case 'Download':
			return button.ref_download?.file?.url ?? undefined;
		case 'LogIn':
			return 'https://app.goodparty.org/login';
		case 'SignUp':
			return 'https://app.goodparty.org/sign-up';
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
		const action = stegaClean(button.action);
		const href = resolveButtonHref(button);

		switch (action) {
			case 'Internal':
				if (href)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text ?? button.link.title ?? button.link.name,
						buttonType: 'internal',
						href,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'Contact':
				if (href)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text ?? button.link.title ?? button.link.name,
						buttonType: 'contact',
						href,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'External':
				if (href)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text ?? button.field_externalLink,
						buttonType: 'external',
						href,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'Anchor':
				if (href)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text,
						buttonType: 'anchor',
						href,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'Download':
				if (href)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text ?? button.ref_download.name,
						buttonType: 'download',
						href,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'LogIn':
				if (href)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text ?? 'Login',
						buttonType: 'external',
						href,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'SignUp':
				if (href)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text ?? 'Sign up',
						buttonType: 'external',
						href,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
		}
	}
	return transformedButtons;
}
