import type { ArticleQueryResult } from 'sanity.types';
import { stegaClean } from 'next-sanity';

import { isButtonType, transformButtons } from '~/lib/buttonTransformer';
import { resolveComponentColor } from '~/ui/_lib/resolveComponentColor';
import type { StickySidebarCTAProps } from '~/ui/StickySidebarCTA';

type StickySidebarCtaData = NonNullable<ArticleQueryResult>['stickySidebarCta'];

type ResolvedCtaConfig = Extract<
	NonNullable<NonNullable<StickySidebarCtaData>['ctaConfig']>,
	{ overview: unknown }
>;

function isResolvedCtaConfig(
	cta: NonNullable<StickySidebarCtaData>['ctaConfig'],
): cta is ResolvedCtaConfig {
	return cta != null && 'overview' in cta;
}

export function resolveStickySidebarCta(data: StickySidebarCtaData | null | undefined): StickySidebarCTAProps | undefined {
	if (!data?.field_showStickySidebarCta || !data.ctaConfig || !isResolvedCtaConfig(data.ctaConfig)) {
		return undefined;
	}

	const cta = data.ctaConfig;
	const title = cta.overview?.field_title ? stegaClean(cta.overview.field_title) : undefined;
	const primaryCta = cta.primaryCTA && isButtonType(cta.primaryCTA) ? cta.primaryCTA : undefined;
	const buttons = transformButtons(primaryCta ? [primaryCta] : undefined);

	if (!title && (!buttons || buttons.length === 0)) {
		return undefined;
	}

	const color = resolveComponentColor(stegaClean(cta.field_componentColor6Colors ?? undefined)) ?? 'lavender';

	return {
		title,
		label: cta.overview?.field_label ? stegaClean(cta.overview.field_label) : undefined,
		copy: cta.overview?.block_summaryText ?? undefined,
		buttons,
		color,
	};
}
