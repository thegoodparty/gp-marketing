import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText } from '~/lib/resolveSectionText';
import { resolvePositionHeroState } from '~/lib/positionHeroState';

import { resolveBg } from '~/ui/_lib/resolveBg';
import {
	ElectionsPositionHero,
	type ElectionsPositionHeroCandidate,
	type ElectionsPositionHeroWinner,
} from '~/ui/ElectionsPositionHero';
import { HERO_INTRO_DEFAULTS } from '~/sanity/schema/components/component_electionsPositionHero';

/**
 * Everything the hero needs from the route. The position and candidates pages
 * fill this in `buildPositionSectionOverrides` / `buildCandidatesSectionOverrides`.
 *
 * The seams that no route populates yet, because election-api has no results
 * data (candidacies carry no win/loss, and Race.numberOfSeats only just reached
 * the API): `winners`, `priorWinners`, `resultsHref`. The state resolver treats
 * their absence as "results pending" rather than inventing a winner.
 */
export type OfficeData = {
	officeName: string;
	stateName: string;
	countyName?: string;
	cityName?: string;
	/** Pre-formatted dates kept for the page schema and older callers. */
	electionDate: string;
	filingDate: string;
	/** ISO dates the hero derives its state and countdowns from. */
	electionDateIso?: string | null;
	filingDateStartIso?: string | null;
	filingDateEndIso?: string | null;
	/** `undefined` hides the ballot card; `[]` is a genuine zero. */
	candidates?: ElectionsPositionHeroCandidate[];
	winners?: ElectionsPositionHeroWinner[];
	/** Winners of the previous cycle; holds the decided state until the next filing window nears. */
	priorWinners?: ElectionsPositionHeroWinner[];
	seatCount?: number | null;
	candidatesHref?: string;
	resultsHref?: string;
	/** Retained so older callers still typecheck; the redesigned hero draws no standalone button. */
	ctaHref?: string;
	ctaLabel?: string;
};

type ElectionsPositionHeroSectionProps = Extract<Sections, { _type: 'component_electionsPositionHero' }> & {
	officeData?: OfficeData;
	tokens?: TokenMap;
	/** Injected by tests so the state and countdowns are deterministic. */
	now?: Date;
};

export function ElectionsPositionHeroSection(props: ElectionsPositionHeroSectionProps) {
	const { officeData, tokens, now, ...section } = props;
	const backgroundColor = section.electionsPositionHeroDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.electionsPositionHeroDesignSettings.field_blockColorCreamMidnight))
		: 'midnight';

	// Only template previews in Studio reach here without route data; on a real
	// position page the override is always present.
	const data: OfficeData = officeData ?? {
		officeName: 'Mayor',
		stateName: 'Illinois',
		countyName: 'Cook County',
		cityName: 'Chicago',
		electionDate: 'TBD',
		filingDate: 'TBD',
	};

	const state = resolvePositionHeroState({
		filingDateStart: data.filingDateStartIso,
		filingDateEnd: data.filingDateEndIso,
		electionDate: data.electionDateIso,
		winnerCount: data.winners?.length,
		priorWinnerCount: data.priorWinners?.length,
		now,
	});

	const winners = state.phase === 'decided' && (data.winners?.length ?? 0) === 0 ? data.priorWinners : data.winners;

	const introField =
		state.phase === 'filing'
			? (stegaClean(section.field_filingIntro) ?? HERO_INTRO_DEFAULTS.filing)
			: state.phase === 'midElection'
				? (stegaClean(section.field_midElectionIntro) ?? HERO_INTRO_DEFAULTS.midElection)
				: (stegaClean(section.field_decidedIntro) ?? HERO_INTRO_DEFAULTS.decided);
	const intro = resolveSectionText(introField, tokens) ?? undefined;

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Elections Position Hero'>
			<ElectionsPositionHero
				backgroundColor={backgroundColor}
				officeName={data.officeName}
				stateName={data.stateName}
				countyName={data.countyName}
				cityName={data.cityName}
				intro={intro}
				state={state}
				electionDate={data.electionDateIso}
				filingDateStart={data.filingDateStartIso}
				filingDateEnd={data.filingDateEndIso}
				candidates={data.candidates}
				winners={winners}
				seatCount={data.seatCount}
				candidatesHref={data.candidatesHref}
				resultsHref={data.resultsHref}
				now={now}
			/>
		</section>
	);
}
