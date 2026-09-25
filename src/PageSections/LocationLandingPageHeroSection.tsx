'use client';

import { stegaClean } from 'next-sanity';

import type { SectionOverrides, Sections } from '~/PageSections';
import { transformButtons } from '~/lib/buttonTransformer';
import { resolveSectionText } from '~/lib/resolveSectionText';
import type { TokenMap } from '~/lib/resolveTokens';
import { LocationLandingPageHero } from '~/ui/LocationLandingPageHero';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { resolveStats } from '~/ui/_lib/resolveStats';

type Props = Extract<Sections, { _type: 'component_locationLandingPageHero' }> & {
	locationOverride?: SectionOverrides['component_locationLandingPageHero'];
	tokens?: TokenMap;
};

export function LocationLandingPageHeroSection(props: Props) {
	const { locationOverride, tokens, ...section } = props;
	const backgroundColor = section.locationLandingPageHeroDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.locationLandingPageHeroDesignSettings.field_blockColorCreamMidnight))
		: 'midnight';

	const headline = resolveSectionText(locationOverride?.headline, tokens);
	const locationLevel = locationOverride?.locationLevel ?? 'state';
	const stateName = locationOverride?.stateName ?? 'State Name';
	const countyName = locationOverride?.countyName;
	const cityName = locationOverride?.cityName;
	const bodyCopy =
		resolveSectionText(locationOverride?.bodyCopy, tokens) ??
		resolveSectionText(section.locationLandingPageHeroContent?.field_bodyCopy, tokens);
	const stats = resolveStats(section.stats?.list_stats)?.map(stat => ({
		...stat,
		description: resolveSectionText(stat.description, tokens) ?? stat.description,
	}));
	const buttons = transformButtons(section.locationLandingPageHeroContent?.list_buttons)?.map(button => ({
		...button,
		label: resolveSectionText(typeof button.label === 'string' ? button.label : undefined, tokens) ?? button.label,
	}));

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Location Landing Page Hero'>
			<LocationLandingPageHero
				backgroundColor={backgroundColor}
				headline={headline}
				locationLevel={locationLevel}
				stateName={stateName}
				countyName={countyName}
				cityName={cityName}
				bodyCopy={bodyCopy}
				stats={stats}
				buttons={buttons}
			/>
		</section>
	);
}
