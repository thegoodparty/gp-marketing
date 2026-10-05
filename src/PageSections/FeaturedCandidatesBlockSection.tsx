import { stegaClean } from 'next-sanity';

import { INDEPENDENTS_ANCHOR } from '~/constants/electionAnchors';
import { type FeaturedPeopleMode, selectFeaturedPeople } from '~/lib/featuredPeople';
import { resolveRichTextTokens, resolveSectionText } from '~/lib/resolveSectionText';
import type { TokenMap } from '~/lib/resolveTokens';
import type { SectionOverrides, Sections } from '~/PageSections';
import { FEATURED_CANDIDATES_DEFAULT_CALLOUT } from '~/sanity/schema/components/component_featuredCandidatesBlock';
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

/**
 * Data-backed: the people come from the location page route, not from Sanity.
 * Only the location pages populate the override today, so anywhere else the
 * block renders nothing. The heading and the callout are the editor's. The
 * section id falls back to the anchor the location hero's "See who's an
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
	const callout = !showCallout ? undefined : calloutText && calloutText.length > 0 ? (
		<RichData value={resolveRichTextTokens(calloutText, tokens)} />
	) : (
		<p>{FEATURED_CANDIDATES_DEFAULT_CALLOUT}</p>
	);

	return (
		<section id={stegaClean(section.componentSettings?.field_anchorId) || INDEPENDENTS_ANCHOR} data-section='Featured Candidates Block'>
			<FeaturedCandidatesBlock
				backgroundColor={resolveBg(settings?.field_blockColorCreamMidnight)}
				heading={resolveSectionText(section.field_heading, tokens)}
				callout={callout}
				people={people.map(person => ({
					key: person.personId ?? person.href,
					name: person.name,
					office: person.office,
					location: person.location,
					href: person.href,
					avatarUrl: person.avatarUrl,
					isPledged: person.isPledged,
				}))}
			/>
		</section>
	);
}
