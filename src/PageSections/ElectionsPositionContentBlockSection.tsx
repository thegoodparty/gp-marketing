import type { ReactNode } from 'react';
import { stegaClean } from 'next-sanity';

import type { Sections } from '~/PageSections';
import { normalizeRawCtaToButton, type RawCtaInput, transformButton } from '~/lib/buttonTransformer';
import { resolvePositionHeroState, type PositionHeroState } from '~/lib/positionHeroState';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveRichTextTokens, resolveSectionText } from '~/lib/resolveSectionText';
import { POSITION_CONTENT_DEFAULTS, POSITION_CONTENT_LINKS } from '~/sanity/schema/components/component_electionsPositionContentBlock';
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
import { RichData } from '~/ui/RichData';

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
	/** The page's own URL, for the share card. Without it the card hides. */
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

type RichTextValue = Parameters<typeof resolveRichTextTokens>[0];

function text(value: string | null | undefined, fallback: string, tokens?: TokenMap): string {
	return resolveSectionText(value ?? fallback, tokens) ?? fallback;
}

/** Rich text from Sanity wins; otherwise the default sentence, tokens resolved. */
function rich(value: RichTextValue, fallback: ReactNode, tokens?: TokenMap): ReactNode {
	const resolved = resolveRichTextTokens(value, tokens);
	return Array.isArray(resolved) && resolved.length > 0 ? <RichData value={resolved} /> : fallback;
}

function button(raw: unknown, key: string, fallback: { label: string; href: string }): ComponentButtonProps {
	const normalized = raw ? normalizeRawCtaToButton(raw as RawCtaInput, key) : undefined;
	const fromSanity = normalized ? transformButton(normalized) : undefined;
	return fromSanity ?? { buttonType: 'internal', href: fallback.href, label: fallback.label };
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

type BrandedCtaVariant = 'noPledged' | 'pledgedRunning' | 'pledgedWon' | 'noPledgedWon';

/**
 * Which pair of headline and body the heart and star card shows. Decided races
 * speak about winners, open races about candidates, and each splits on whether
 * anyone in that group took the Pledge.
 */
export function pickBrandedCtaVariant(
	state: PositionHeroState,
	candidates: ElectionsPositionPerson[] | undefined,
	winners: ElectionsPositionPerson[] | undefined,
): BrandedCtaVariant {
	if (state.phase === 'decided') {
		return (winners ?? []).some(person => person.isPledged) ? 'pledgedWon' : 'noPledgedWon';
	}
	return (candidates ?? []).some(person => person.isPledged) ? 'pledgedRunning' : 'noPledged';
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
	const lists = section.peopleLists;
	const cta = section.brandedCta;
	const voter = section.voterReadiness;
	const about = section.aboutPosition;
	const run = section.howToRun;

	const variant = pickBrandedCtaVariant(state, candidates, winners);
	const brandedCopy = {
		noPledged: {
			headline: text(cta?.field_noPledgedHeadline, d.brandedCta.noPledgedHeadline, tokens),
			body: text(cta?.field_noPledgedBody, d.brandedCta.noPledgedBody, tokens),
		},
		pledgedRunning: {
			headline: text(cta?.field_pledgedRunningHeadline, d.brandedCta.pledgedRunningHeadline, tokens),
			body: text(cta?.field_pledgedRunningBody, d.brandedCta.pledgedRunningBody, tokens),
		},
		pledgedWon: {
			headline: text(cta?.field_pledgedWonHeadline, d.brandedCta.pledgedWonHeadline, tokens),
			body: text(cta?.field_pledgedWonBody, d.brandedCta.pledgedWonBody, tokens),
		},
		noPledgedWon: {
			headline: text(cta?.field_noPledgedWonHeadline, d.brandedCta.noPledgedWonHeadline, tokens),
			body: text(cta?.field_noPledgedWonBody, d.brandedCta.noPledgedWonBody, tokens),
		},
	}[variant];

	const voterItems: ElectionsPositionVoterItem[] =
		voter?.list_iconContentItems && voter.list_iconContentItems.length > 0
			? voter.list_iconContentItems.map(item => {
					const normalized = item.ctaActionWithShared
						? normalizeRawCtaToButton(item.ctaActionWithShared, `${item._key ?? ''}-voter-cta`)
						: undefined;
					return {
						key: item._key,
						icon: item.field_icon ? stegaClean(item.field_icon) : undefined,
						title: resolveSectionText(item.field_title, tokens),
						copy: rich(item.block_summaryText, undefined, tokens),
						button: normalized ? transformButton(normalized) : undefined,
					};
				})
			: d.voterReadiness.items.map(item => ({
					key: item.key,
					icon: item.icon,
					title: item.title,
					copy: <p>{item.copy}</p>,
					button: { buttonType: 'external', href: item.href, label: item.buttonLabel },
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
	steps.push({
		number: `Step ${steps.length + 1}`,
		icon: 'trending-up',
		title: text(run?.field_step3Title, d.howToRun.step3Title, tokens),
		body: <p>{text(run?.field_step3Body, d.howToRun.step3Body, tokens)}</p>,
		button: button(run?.ctaActionWithShared, `${section._key ?? 'position-content'}-run-cta`, {
			label: d.howToRun.step3ButtonLabel,
			href: POSITION_CONTENT_LINKS.run,
		}),
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
								body: rich(rail?.block_exploreBody, <p>{text(undefined, d.siderail.exploreBody, tokens)}</p>, tokens),
								buttonLabel: text(rail?.field_exploreButtonLabel, d.siderail.exploreButtonLabel, tokens),
								href: data.locationHref,
							}
						: undefined,
					share: data.shareUrl
						? {
								title: text(rail?.field_shareTitle, d.siderail.shareTitle, tokens),
								body: <p>{text(rail?.field_shareBody, d.siderail.shareBody, tokens)}</p>,
								buttonLabel: text(rail?.field_shareButtonLabel, d.siderail.shareButtonLabel, tokens),
								url: data.shareUrl,
							}
						: undefined,
				}}
				badgeCallout={{
					title: text(section.badgeCallout?.field_title, d.badgeCallout.title, tokens),
					body: rich(section.badgeCallout?.block_summaryText, <p>{d.badgeCallout.body}</p>, tokens),
				}}
				candidates={candidates}
				officeholders={data.officeholders}
				seatFilter={data.seatFilter}
				headings={{
					candidates: text(lists?.field_candidatesHeading, d.peopleLists.candidatesHeading, tokens),
					results: text(lists?.field_resultsHeading, d.peopleLists.resultsHeading, tokens),
					officeholders: text(lists?.field_officeholdersHeading, d.peopleLists.officeholdersHeading, tokens),
					showMore: text(lists?.field_showMoreLabel, d.peopleLists.showMoreLabel, tokens),
					voter: text(voter?.field_title, d.voterReadiness.title, tokens),
					voterSubtitle: text(voter?.field_subtitle, d.voterReadiness.subtitle, tokens),
					about: text(about?.field_heading, d.aboutPosition.heading, tokens),
					howToRun: text(run?.field_heading, d.howToRun.heading, tokens),
				}}
				brandedCta={{
					headline: brandedCopy.headline,
					body: <p>{brandedCopy.body}</p>,
					button: button(cta?.ctaActionWithShared, `${section._key ?? 'position-content'}-branded-cta`, {
						label: d.brandedCta.buttonLabel,
						href: POSITION_CONTENT_LINKS.run,
					}),
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
					needHelp: rich(run?.block_needHelp, communityLine(d.howToRun.needHelp), tokens),
				}}
			/>
		</section>
	);
}
