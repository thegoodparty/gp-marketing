import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCandidacies, getRaceBySlug } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { buildRaceSlug, getStateName } from '~/lib/electionsHelpers';
import { CandidatesPageContent } from '~/ui/CandidatesPageContent';

export default async function Page({
	params,
}: {
	params: Promise<{ state: string; positionSlug: string }>;
}) {
	const { state, positionSlug } = await params;

	if (!isValidStateCode(state)) {
		notFound();
	}

	const raceSlug = buildRaceSlug(state, positionSlug);
	const [race, candidacies] = await Promise.all([
		getRaceBySlug(raceSlug),
		getCandidacies({ raceSlug }),
	]);

	if (!race) {
		notFound();
	}

	const stateName = getStateName(state);
	const officeName = race.normalizedPositionName ?? race.name ?? 'Position';

	const candidates = candidacies.map((c, i) => ({
		_key: c.id ?? `c-${i}`,
		name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Candidate',
		partyAffiliation: c.party ?? 'Unknown',
		avatar: c.image ?? undefined,
		href: c.slug
			? `/candidate/${c.slug}`
			: `/profile?slug=${encodeURIComponent([c.firstName, c.lastName].filter(Boolean).join('-').toLowerCase())}&raceId=${encodeURIComponent(c.raceId ?? '')}`,
	}));

	const positionHref = `/elections/${state.toLowerCase()}/position/${positionSlug}`;

	return (
		<CandidatesPageContent
			officeName={officeName}
			stateName={stateName}
			candidates={candidates}
			backHref={positionHref}
			backLabel={`Back to ${officeName}`}
		/>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ state: string; positionSlug: string }>;
}): Promise<Metadata> {
	const { state, positionSlug } = await params;
	if (!isValidStateCode(state)) return {};
	const stateName = getStateName(state);
	const raceSlug = buildRaceSlug(state, positionSlug);
	const race = await getRaceBySlug(raceSlug);
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	return {
		title: `Candidates for ${positionName} in ${stateName} | Good Party`,
		description: `View candidates running for ${positionName} in ${stateName}.`,
	};
}
