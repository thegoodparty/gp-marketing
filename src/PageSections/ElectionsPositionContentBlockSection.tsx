import type { ReactNode } from 'react';
import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { resolvePositionHeroState } from '~/lib/positionHeroState';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveSectionText } from '~/lib/resolveSectionText';
import { POSITION_CONTENT_DEFAULTS, POSITION_CONTENT_LINKS } from '~/sanity/schema/components/component_electionsPositionContentBlock';
import { ATTRIBUTION_PLEDGE_PHRASE } from '~/ui/_lib/attributionCopy';
import { resolveBg } from '~/ui/_lib/resolveBg';
import { Anchor } from '~/ui/Anchor';
import {
	ElectionsPositionContentBlock,
	type ElectionsPositionAttribute,
	type ElectionsPositionElectionType,
	type ElectionsPositionHowToRunStep,
	type ElectionsPositionPerson,
	type ElectionsPositionSeatFilter,
	type ElectionsPositionVoterItem,
} from '~/ui/ElectionsPositionContentBlock';
import type { ComponentButtonProps } from '~/ui/Inputs/Button';
import { PledgeModal } from '~/ui/PledgeModal';

/**
 * Everything the block needs from the route. `buildPositionSectionOverrides`
 * fills this for the position pages.
 *
 * The state inputs are the hero's: the same ISO dates and winner lists go to
 * `resolvePositionHeroState` here, so the body can never sit in a different
 * phase from the header above it.
 *
 * Seams no route populates yet, for the same reason as the hero's: election-api
 * records no results, so `winners` and `priorWinners` stay empty and no live page
 * reaches the decided state. `seatFilter` waits on seat data reaching the
 * candidate rows (see `buildPositionContentOverride`).
 */
export type ElectionsPositionContentBlockOverride = {
	electionDateIso?: string | null;
	filingDateStartIso?: string | null;
	filingDateEndIso?: string | null;
	winners?: ElectionsPositionPerson[];
	priorWinners?: ElectionsPositionPerson[];
	/** `undefined` means the route could not read the race's candidates; both that and `[]` hide the list. */
	candidates?: ElectionsPositionPerson[];
	/** Current holders of the position. `undefined` or `[]` hides the list. */
	officeholders?: ElectionsPositionPerson[];
	seatFilter?: ElectionsPositionSeatFilter;
	/** The location page the "Explore more races" card links to. Without it the card hides. */
	locationHref?: string;
	/** The page's own URL. Kept on the seam for the route; the block no longer draws a share card. */
	shareUrl?: string;
	about?: {
		description?: string;
		attributes: ElectionsPositionAttribute[];
		electionTypes?: ElectionsPositionElectionType[];
	};
	howToRun?: {
		eligibility?: string;
		filing?: ElectionsPositionAttribute[];
	};
};

type ElectionsPositionContentBlockSectionProps = Extract<Sections, { _type: 'component_electionsPositionContentBlock' }> & {
	contentOverride?: ElectionsPositionContentBlockOverride;
	tokens?: TokenMap;
	/** Injected by tests so the state is deterministic. */
	now?: Date;
};

function text(value: string | null | undefined, fallback: string, tokens?: TokenMap): string {
	return resolveSectionText(value ?? fallback, tokens) ?? fallback;
}

/** A pasted path or address from Studio, or the default. Anything off this site opens as an external link. */
function link(
	label: string | null | undefined,
	href: string | null | undefined,
	fallback: { label: string; href: string },
	tokens?: TokenMap,
): ComponentButtonProps {
	const target = stegaClean(href)?.trim() || fallback.href;
	return { buttonType: /^https?:\/\//i.test(target) ? 'external' : 'internal', href: target, label: text(label, fallback.label, tokens) };
}

function communityLine(copy: string): ReactNode {
	const phrase = 'GoodParty.org Community';
	const at = copy.indexOf(phrase);
	if (at < 0) return <p>{copy}</p>;
	return (
		<p>
			{copy.slice(0, at)}
			<Anchor href={POSITION_CONTENT_LINKS.community} className='text-goodparty-blue underline underline-offset-2'>
				{phrase}
			</Anchor>
			{copy.slice(at + phrase.length)}
		</p>
	);
}

/** The name of the pledge inside a sentence, wrapped by `render`; the rest of the sentence is left as typed. */
function withPledgePhrase(copy: string, render: (phrase: string) => ReactNode): ReactNode {
	const at = copy.indexOf(ATTRIBUTION_PLEDGE_PHRASE);
	if (at < 0) return <p>{copy}</p>;
	return (
		<p>
			{copy.slice(0, at)}
			{render(ATTRIBUTION_PLEDGE_PHRASE)}
			{copy.slice(at + ATTRIBUTION_PLEDGE_PHRASE.length)}
		</p>
	);
}

export function ElectionsPositionContentBlockSection(props: ElectionsPositionContentBlockSectionProps) {
	const { contentOverride, tokens, now, ...section } = props;
	const data = contentOverride ?? {};
	const backgroundColor = section.electionsPositionContentBlockDesignSettings?.field_blockColorCreamMidnight
		? resolveBg(stegaClean(section.electionsPositionContentBlockDesignSettings.field_blockColorCreamMidnight))
		: 'cream';

	const state = resolvePositionHeroState({
		filingDateStart: data.filingDateStartIso,
		filingDateEnd: data.filingDateEndIso,
		electionDate: data.electionDateIso,
		winnerCount: data.winners?.length,
		priorWinnerCount: data.priorWinners?.length,
		now,
	});
	const winners = state.phase === 'decided' && (data.winners?.length ?? 0) === 0 ? data.priorWinners : data.winners;
	const winnerKeys = new Set((winners ?? []).map(person => person.key));
	const candidates = data.candidates?.map(person => ({ ...person, isWinner: person.isWinner ?? winnerKeys.has(person.key) }));

	const officeName = tokens?.['[office name]'] ?? '';
	const d = POSITION_CONTENT_DEFAULTS;
	const rail = section.siderail;
	const explainer = section.pledgeExplainer;
	const lists = section.peopleLists;
	const voter = section.voterReadiness;
	const about = section.aboutPosition;
	const run = section.howToRun;

	const voterItems: ElectionsPositionVoterItem[] =
		voter?.list_voterLinks && voter.list_voterLinks.length > 0
			? voter.list_voterLinks.map(item => ({
					key: item._key,
					image: item.img_image ?? undefined,
					imageAlt: item.img_image?.alt ?? undefined,
					title: resolveSectionText(item.field_title, tokens),
					copy: item.field_copy ? <p>{resolveSectionText(item.field_copy, tokens)}</p> : undefined,
					button: item.field_href
						? link(item.field_linkLabel, item.field_href, { label: item.field_linkLabel ?? '', href: item.field_href }, tokens)
						: undefined,
				}))
			: d.voterReadiness.items.map(item => ({
					key: item.key,
					title: item.title,
					copy: <p>{item.copy}</p>,
					button: { buttonType: 'internal', href: item.href, label: item.buttonLabel },
				}));

	const steps: ElectionsPositionHowToRunStep[] = [];
	if (data.howToRun?.eligibility) {
		steps.push({
			number: 'Step 1',
			icon: 'user-round',
			title: text(run?.field_step1Title, d.howToRun.step1Title, tokens),
			body: <p>{data.howToRun.eligibility}</p>,
		});
	}
	if (data.howToRun?.filing && data.howToRun.filing.length > 0) {
		steps.push({
			number: 'Step 2',
			icon: 'file-text',
			title: text(run?.field_step2Title, d.howToRun.step2Title, tokens),
			attributes: data.howToRun.filing,
		});
	}
	// A lone editorial step is not "Step 1" of anything, so it carries no number
	// unless the data steps in front of it rendered.
	steps.push({
		number: steps.length > 0 ? `Step ${steps.length + 1}` : undefined,
		icon: 'trending-up',
		title: text(run?.field_step3Title, d.howToRun.step3Title, tokens),
		body: <p>{text(run?.field_step3Body, d.howToRun.step3Body, tokens)}</p>,
		button: link(
			run?.field_step3ButtonLabel,
			run?.field_step3ButtonHref,
			{ label: d.howToRun.step3ButtonLabel, href: POSITION_CONTENT_LINKS.run },
			tokens,
		),
	});

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId)} data-section='Elections Position Content Block'>
			<ElectionsPositionContentBlock
				backgroundColor={backgroundColor}
				state={state}
				officeName={officeName}
				siderail={{
					onThisPageTitle: text(rail?.field_onThisPageTitle, d.siderail.onThisPageTitle, tokens),
					explore: data.locationHref
						? {
								title: text(rail?.field_exploreTitle, d.siderail.exploreTitle, tokens),
								body: withPledgePhrase(text(rail?.field_exploreBody, d.siderail.exploreBody, tokens), phrase => (
									<PledgeModal source='position_content'>
										<button type='button' className='font-medium text-info-500 underline underline-offset-2'>
											{phrase}
										</button>
									</PledgeModal>
								)),
								buttonLabel: text(rail?.field_exploreButtonLabel, d.siderail.exploreButtonLabel, tokens),
								href: data.locationHref,
							}
						: undefined,
				}}
				pledgeExplainer={{
					title: text(explainer?.field_title, d.pledgeExplainer.title, tokens),
					body: withPledgePhrase(text(explainer?.field_body, d.pledgeExplainer.body, tokens), phrase => <strong>{phrase}</strong>),
					linkLabel: explainer?.field_showPledgeLink === false ? undefined : text(explainer?.field_linkLabel, d.pledgeExplainer.linkLabel, tokens),
				}}
				candidates={candidates}
				officeholders={data.officeholders}
				seatFilter={data.seatFilter}
				headings={{
					candidates: text(lists?.field_candidatesHeading, d.peopleLists.candidatesHeading, tokens),
					candidatesIntro: text(lists?.field_candidatesIntro, d.peopleLists.candidatesIntro, tokens),
					results: text(lists?.field_resultsHeading, d.peopleLists.resultsHeading, tokens),
					officeholders: text(lists?.field_officeholdersHeading, d.peopleLists.officeholdersHeading, tokens),
					officeholdersIntro: text(lists?.field_officeholdersIntro, d.peopleLists.officeholdersIntro, tokens),
					showMore: text(lists?.field_showMoreLabel, d.peopleLists.showMoreLabel, tokens),
					voter: text(voter?.field_title, d.voterReadiness.title, tokens),
					voterSubtitle: text(voter?.field_subtitle, d.voterReadiness.subtitle, tokens),
					about: text(about?.field_heading, d.aboutPosition.heading, tokens),
					howToRun: text(run?.field_heading, d.howToRun.heading, tokens),
				}}
				voterReadiness={{ items: voterItems }}
				about={
					data.about
						? {
								cardTitle: text(about?.field_cardTitle, d.aboutPosition.cardTitle, tokens),
								description: data.about.description,
								attributes: data.about.attributes,
								electionTypesLabel: d.aboutPosition.electionTypesLabel,
								electionTypes: data.about.electionTypes,
							}
						: undefined
				}
				howToRun={{
					electionOverBanner: text(run?.field_electionOverBanner, d.howToRun.electionOverBanner, tokens),
					steps,
					needHelp: communityLine(text(run?.field_needHelp, d.howToRun.needHelp, tokens)),
				}}
			/>
		</section>
	);
}
