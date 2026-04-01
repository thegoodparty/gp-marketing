import type { ButtonType } from '~/lib/buttonTransformer';
import { resolveButtonHref } from '~/lib/buttonTransformer';

export function resolveCTALink(cta?: ButtonType) {
	if (!cta) return;

	return resolveButtonHref(cta);
}
