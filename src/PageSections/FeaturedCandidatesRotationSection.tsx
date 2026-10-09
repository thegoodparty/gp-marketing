import { stegaClean } from 'next-sanity';

import { getWeeklyFeaturedPeople } from '~/lib/featuredRotation';
import type { TokenMap } from '~/lib/resolveTokens';
import type { Sections } from '~/PageSections';
import { FeaturedCandidatesBlockSection } from '~/PageSections/FeaturedCandidatesBlockSection';

type Section = Extract<Sections, { _type: 'component_featuredCandidatesBlock' }>;

type Props = Section & {
	tokens?: TokenMap;
	/** Tests pass a loader with fake data; the page uses the real one. */
	loadRotation?: typeof getWeeklyFeaturedPeople;
};

function cleanList(values: Array<string | null> | null | undefined): string[] {
	return (values ?? []).flatMap(value => (value ? [stegaClean(value)] : []));
}

/**
 * The block on a page with no ballot of its own, such as the /elections landing
 * page: the weekly rotating pick of people with a published profile, with the
 * editor's pins and exclusions from the block's Weekly Rotation settings. The
 * location pages never reach this; their routes hand the block their own people.
 */
export async function FeaturedCandidatesRotationSection(props: Props) {
	const { loadRotation, ...section } = props;
	const rotation = section.featuredCandidatesBlockRotation;
	const people = await (loadRotation ?? getWeeklyFeaturedPeople)({
		pins: cleanList(rotation?.list_alwaysFeature),
		excludes: cleanList(rotation?.list_neverFeature),
	});
	if (people.candidates.length === 0 && people.representatives.length === 0) return null;
	return <FeaturedCandidatesBlockSection {...section} featuredOverride={people} />;
}
