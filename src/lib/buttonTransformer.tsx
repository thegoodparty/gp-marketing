import { stegaClean } from '@sanity/client/stega';
import type { Sections } from '~/PageSections';

import type { ComponentButtonProps } from '~/ui/Inputs/Button';

export type ButtonsType = Exclude<Extract<Sections, { _type: 'component_hero' }>['summaryInfo'], null | undefined>['list_buttons'];

export type ButtonType = Exclude<ButtonsType, null | undefined>[number];

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
						label: button.text ?? button.link.title ?? button.link.name,
						buttonType: 'internal',
						href: button.link.href,
						buttonProps: {
							styleType: button.hierarchy
								? stegaClean(button.hierarchy) === 'Primary'
									? 'primary'
									: stegaClean(button.hierarchy) === 'Secondary'
										? 'secondary'
										: 'ghost'
								: undefined,
						},
					});
				break;
			case 'Contact':
				if (button.link && 'href' in button.link && button.link.href)
					transformedButtons.push({
						_key: button._key,
						label: button.text ?? button.link.title ?? button.link.name,
						buttonType: 'contact',
						href: button.link.href,
						buttonProps: {
							styleType: button.hierarchy
								? stegaClean(button.hierarchy) === 'Primary'
									? 'primary'
									: stegaClean(button.hierarchy) === 'Secondary'
										? 'secondary'
										: 'ghost'
								: undefined,
						},
					});
				break;
			case 'External':
				if (button.field_externalLink)
					transformedButtons.push({
						_key: button._key,
						label: button.text ?? button.field_externalLink,
						buttonType: 'external',
						href: button.field_externalLink,
						buttonProps: {
							styleType: button.hierarchy
								? stegaClean(button.hierarchy) === 'Primary'
									? 'primary'
									: stegaClean(button.hierarchy) === 'Secondary'
										? 'secondary'
										: 'ghost'
								: undefined,
						},
					});
				break;
			case 'Anchor':
				if ('anchor' in button && button.anchor && button.link && 'href' in button.link)
					transformedButtons.push({
						_key: button._key,
						label: button.text ?? button.link.title ?? button.link.name,
						buttonType: 'anchor',
						href: button.anchor,
						buttonProps: {
							styleType: button.hierarchy
								? stegaClean(button.hierarchy) === 'Primary'
									? 'primary'
									: stegaClean(button.hierarchy) === 'Secondary'
										? 'secondary'
										: 'ghost'
								: undefined,
						},
					});
				break;
			case 'Download':
				if (button.ref_download && button.ref_download.file?.url)
					transformedButtons.push({
						_key: button._key,
						label: button.text ?? button.ref_download.name,
						buttonType: 'download',
						href: button.ref_download.file?.url,
						buttonProps: {
							styleType: button.hierarchy
								? stegaClean(button.hierarchy) === 'Primary'
									? 'primary'
									: stegaClean(button.hierarchy) === 'Secondary'
										? 'secondary'
										: 'ghost'
								: undefined,
						},
					});
				break;
			case 'LogIn':
				transformedButtons.push({
					_key: button._key,
					label: button.text,
					buttonType: 'login',
					buttonProps: {
						styleType: button.hierarchy
							? stegaClean(button.hierarchy) === 'Primary'
								? 'primary'
								: stegaClean(button.hierarchy) === 'Secondary'
									? 'secondary'
									: 'ghost'
							: undefined,
					},
				});
				break;
			case 'SignUp':
				transformedButtons.push({
					_key: button._key,
					buttonType: 'signup',
					label: button.text,
					buttonProps: {
						styleType: button.hierarchy
							? stegaClean(button.hierarchy) === 'Primary'
								? 'primary'
								: stegaClean(button.hierarchy) === 'Secondary'
									? 'secondary'
									: 'ghost'
							: undefined,
					},
				});
				break;
		}
	}
	return transformedButtons;
}
