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

export function transformButtons(buttons?: ButtonsType): ComponentButtonProps[] | undefined {
	if (!buttons) {
		return undefined;
	}

	const transformedButtons: ComponentButtonProps[] = [];
	for (const button of buttons) {
		if (!button) {
			continue;
		}
		switch (stegaClean(button.action)) {
			case 'Internal':
				if (button.link && 'href' in button.link && button.link.href)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text ?? button.link.title ?? button.link.name,
						buttonType: 'internal',
						href: button.link.href,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'Contact':
				if (button.link && 'href' in button.link && button.link.href)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text ?? button.link.title ?? button.link.name,
						buttonType: 'contact',
						href: button.link.href,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'External':
				if (button.field_externalLink)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text ?? button.field_externalLink,
						buttonType: 'external',
						href: button.field_externalLink,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'Anchor':
				if (button.anchor)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text,
						buttonType: 'anchor',
						href: button.anchor,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'Download':
				if (button.ref_download && button.ref_download.file?.url)
					transformedButtons.push({
						_key: button._key,
						formId: (button as { formId?: string }).formId,
						label: button.text ?? button.ref_download.name,
						buttonType: 'download',
						href: button.ref_download.file?.url,
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'LogIn':
				transformedButtons.push({
					_key: button._key,
					formId: (button as { formId?: string }).formId,
					label: button.text ?? 'Login',
					buttonType: 'external',
					href: 'https://app.goodparty.org/login',
						buttonProps: {
							styleType: resolveHierarchy(button.hierarchy),
						},
					});
				break;
			case 'SignUp':
				transformedButtons.push({
					_key: button._key,
					formId: (button as { formId?: string }).formId,
					label: button.text ?? 'Sign up',
					buttonType: 'external',
					href: 'https://app.goodparty.org/sign-up',
					buttonProps: {
						styleType: resolveHierarchy(button.hierarchy),
					},
				});
				break;
		}
	}
	return transformedButtons;
}
