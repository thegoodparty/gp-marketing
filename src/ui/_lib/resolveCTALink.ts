import type { ButtonType } from '~/lib/buttonTransformer';

export function resolveCTALink(cta?: ButtonType) {
	if (!cta) return;

	if (cta.link && 'href' in cta.link && cta.link.href) return cta.link.href;

	return undefined;
}
