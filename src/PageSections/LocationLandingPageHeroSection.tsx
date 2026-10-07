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
	// The editor's template copy wins; the route's sentence is only the fallback
	// for a template saved without one. Marketing rewrote the copy for the redesign
	// and the route's default was overriding it on every page (Emily, 2026-10-07).
	const editorCopy = resolveSectionText(section.locationLandingPageHeroContent?.field_bodyCopy, tokens)?.trim();
	const bodyCopy = editorCopy || resolveSectionText(locationOverride?.bodyCopy, tokens);
	// On a location page two cards carry live figures, told apart by the colour
	// the design gives each and no other: halo green is the races on the ballot,
	// lavender is the independent candidates. A real zero shows, and a card hides
	// when its figure cannot be trusted (null). The editor keeps the labels, and
	// anywhere else the cards render as written.
	const independents = locationOverride?.independents;
	const liveFigures = new Map<string, number | null>();
	if (locationOverride?.raceCount !== undefined) liveFigures.set('halo-green', locationOverride.raceCount);
	if (independents) liveFigures.set('lavender', independents.candidateCount);
	const stats = resolveStats(section.stats?.list_stats)
		?.filter(stat => !(stat.color && liveFigures.has(stat.color) && liveFigures.get(stat.color) === null))
		.map(stat => ({
			...stat,
			value: stat.color && liveFigures.has(stat.color) ? liveFigures.get(stat.color)?.toLocaleString('en-US') : stat.value,
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
