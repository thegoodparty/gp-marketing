import { stegaClean } from '@sanity/client/stega';

import { type ButtonType, isButtonType, transformButtons } from '~/lib/buttonTransformer';
import { promoBannerDismissKey } from '~/lib/promoBanner';
import { goodpartyOrg_promoBannerQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { PromoBanner, type PromoBannerColor } from '~/ui/PromoBanner';

const colors: Record<string, PromoBannerColor> = {
	Red: 'red',
	Waxflower: 'waxflower',
	BrightYellow: 'bright-yellow',
	HaloGreen: 'halo-green',
	Blue: 'blue',
	Lavender: 'lavender',
	Midnight: 'midnight',
};

const cleanList = (list: ReadonlyArray<string | null> | null | undefined): string[] =>
	(list ?? []).map(entry => stegaClean(entry ?? '').trim()).filter(entry => entry.length > 0);

const cleanDate = (value: string | null | undefined): string | null => {
	const cleaned = value ? stegaClean(value).trim() : '';
	return cleaned.length > 0 ? cleaned : null;
};

export async function PromoBannerSection() {
	const navigation = await sanityFetch({ query: goodpartyOrg_promoBannerQuery, tags: ['goodpartyOrg_navigation'] });
	const banner = navigation?.promoBanner;
	if (!banner?.field_enabled) return null;

	const text = banner.field_text ?? '';
	const cleanText = stegaClean(text).trim();
	if (cleanText.length === 0) return null;

	const button = banner.button && isButtonType(banner.button) ? transformButtons([banner.button as ButtonType])?.[0] : undefined;
	const href = button && 'href' in button ? button.href : null;
	const startsAt = cleanDate(banner.field_startsAt);
	const endsAt = cleanDate(banner.field_endsAt);

	return (
		<PromoBanner
			text={text}
			color={colors[stegaClean(banner.field_color ?? '')] ?? 'bright-yellow'}
			button={button}
			countdownTo={cleanDate(banner.field_countdownTo)}
			countdownLabel={banner.field_countdownLabel}
			startsAt={startsAt}
			endsAt={endsAt}
			includePaths={cleanList(banner.list_includePaths)}
			excludePaths={cleanList(banner.list_excludePaths)}
			dismissKey={promoBannerDismissKey({ text: cleanText, href, startsAt })}
		/>
	);
}
