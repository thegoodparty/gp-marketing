import { stegaClean } from 'next-sanity';

import { INDEPENDENTS_ANCHOR } from '~/constants/electionAnchors';
import { type FeaturedPeopleMode, selectFeaturedPeople } from '~/lib/featuredPeople';
import { resolveRichTextTokens, resolveSectionText } from '~/lib/resolveSectionText';
import type { TokenMap } from '~/lib/resolveTokens';
import type { SectionOverrides, Sections } from '~/PageSections';
import {
	FEATURED_CANDIDATES_DEFAULT_BODY,
	FEATURED_CANDIDATES_DEFAULT_CALLOUT,
	FEATURED_CANDIDATES_DEFAULT_CALLOUT_TITLE,
	FEATURED_CANDIDATES_DEFAULT_PLEDGE_LINK,
} from '~/sanity/schema/components/component_featuredCandidatesBlock';
import { FeaturedCandidatesBlock } from '~/ui/FeaturedCandidatesBlock';
import { RichData } from '~/ui/RichData';
import { resolveBg } from '~/ui/_lib/resolveBg';

type Section = Extract<Sections, { _type: 'component_featuredCandidatesBlock' }>;

type Props = Section & {
	featuredOverride?: SectionOverrides['component_featuredCandidatesBlock'];
	tokens?: TokenMap;
};

type ModeValue = NonNullable<Section['featuredCandidatesBlockDesignSettings']>['field_featuredPeople'];

/** A document saved before the dropdown existed has no value; it renders both, which is what the design draws. */
export function resolveFeaturedPeopleMode(value: ModeValue | undefined): FeaturedPeopleMode {
	const cleaned = value ? stegaClean(value) : undefined;
	return cleaned === 'candidates' || cleaned === 'representatives' ? cleaned : 'both';
}

export const COUNT_OF_CANDIDATES_TOKEN = '[count of candidates]';

/**
 * The body copy, with its count placeholder either filled from the page or left
 * out of the sentence (Emily, 2026-10-06) and the gap it leaves closed up. The
 * placeholder is handled here, before the page tokens, so it reads the same on a
 * page that supplies no tokens at all.
 */
export function resolveFeaturedBodyCopy(value: string | null | undefined, count: number | null | undefined, tokens?: TokenMap): string {
	const cleaned = value == null ? '' : stegaClean(value).trim();
	const copy = cleaned || FEATURED_CANDIDATES_DEFAULT_BODY;
	const withCount = copy.split(COUNT_OF_CANDIDATES_TOKEN).join(typeof count === 'number' ? String(count) : '');
	const resolved = resolveSectionText(withCount, tokens) ?? withCount;
	return resolved
		.replace(/[ \t]{2,}/g, ' ')
		.replace(/ ([,.;:!?])/g, '$1')
		.trim();
}

/** The frame bolds "GoodParty.org Pledge" inside the default copy; an editor's own rich text carries its own marks. */
function defaultCalloutBody() {
	const phrase = 'GoodParty.org Pledge';
	const [before, after] = FEATURED_CANDIDATES_DEFAULT_CALLOUT.split(phrase);
	return (
		<p>
			{before}
			<strong>{phrase}</strong>
			{after}
		</p>
	);
}

/**
 * Data-backed: the people come from the location page route, not from Sanity.
 * Only the location pages populate the override today, so anywhere else the
 * block renders nothing. The heading, body copy and callout are the editor's.
 * The section id falls back to the anchor the location hero's "See who's an
 * independent" button is seeded with, so the jump lands without an editor
 * having to type matching ids.
 */
export function FeaturedCandidatesBlockSection(props: Props) {
	const { featuredOverride, tokens, ...section } = props;
	const settings = section.featuredCandidatesBlockDesignSettings;

	const people = selectFeaturedPeople(
		{ candidates: featuredOverride?.candidates ?? [], representatives: featuredOverride?.representatives ?? [] },
		resolveFeaturedPeopleMode(settings?.field_featuredPeople),
	);
	if (people.length === 0) return null;

	const calloutSettings = section.featuredCandidatesBlockCallout;
	const showCallout = calloutSettings?.field_showCallout !== false;
	const calloutText = calloutSettings?.block_calloutText;
	const showPledgeLink = calloutSettings?.field_showPledgeLink !== false;
	const callout = !showCallout
		? undefined
		: {
				title: resolveSectionText(calloutSettings?.field_calloutTitle, tokens) || FEATURED_CANDIDATES_DEFAULT_CALLOUT_TITLE,
				body: calloutText && calloutText.length > 0 ? <RichData value={resolveRichTextTokens(calloutText, tokens)} /> : defaultCalloutBody(),
				pledgeLinkLabel: showPledgeLink
					? resolveSectionText(calloutSettings?.field_pledgeLinkLabel, tokens) || FEATURED_CANDIDATES_DEFAULT_PLEDGE_LINK
					: undefined,
			};

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId) || INDEPENDENTS_ANCHOR} data-section='Featured Candidates Block'>
			<FeaturedCandidatesBlock
				backgroundColor={resolveBg(settings?.field_blockColorCreamMidnight)}
				heading={resolveSectionText(section.field_heading, tokens)}
				bodyCopy={resolveFeaturedBodyCopy(section.field_bodyCopy, featuredOverride?.pledgedCount, tokens)}
				callout={callout}
				people={people.map(person => ({
					key: person.personId ?? person.href,
					name: person.name,
					// A candidate's card names the office they are running for, not one
					// they hold: a council member running for mayor read as the mayor
					// (Japjeet Uppal, Livingston, CA; Emily, 2026-10-08). Officials keep
					// the plain office name.
					office: person.role === 'candidate' && person.office ? `Candidate for ${person.office}` : person.office,
					location: person.location,
					href: person.href,
					avatarUrl: person.avatarUrl,
					isPledged: person.isPledged,
				}))}
			/>
		</section>
	);
}
