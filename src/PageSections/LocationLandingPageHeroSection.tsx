'use client';

import { stegaClean } from 'next-sanity';

import type { SectionOverrides, Sections } from '~/PageSections';
import { INDEPENDENTS_ANCHOR } from '~/constants/electionAnchors';
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
	// On a location page the lavender card is the independents card (the design
	// gives it that colour and no other), so its number comes from the data: a real
	// zero shows, and the card hides when the count cannot be trusted. The editor
	// keeps the label. Anywhere else the card renders as written.
	const independents = locationOverride?.independents;
	const stats = resolveStats(section.stats?.list_stats)
		?.filter(stat => !(independents && stat.color === 'lavender' && independents.candidateCount === null))
		.map(stat => ({
			...stat,
			value: independents && stat.color === 'lavender' ? independents.candidateCount?.toLocaleString('en-US') : stat.value,
			description: resolveSectionText(stat.description, tokens) ?? stat.description,
		}));
	const buttons = transformButtons(section.locationLandingPageHeroContent?.list_buttons)
		?.filter(
			button => !(independents && !independents.hasAny && button.buttonType === 'anchor' && button.href === `#${INDEPENDENTS_ANCHOR}`),
		)
		.map(button => ({
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
