import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
	getCandidacies,
	getPlacesByState,
	getPlacesBySlugWithChildren,
	getRaceBySlug,
} from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { buildRaceSlug, getStateName } from '~/lib/electionsHelpers';
import { CandidatesPageContent } from '~/ui/CandidatesPageContent';

export default async function Page({
	params,
}: {
	params: Promise<{
		state: string;
		county: string;
		municipality: string;
		positionSlug: string;
	}>;
}) {
	const { state, county, municipality, positionSlug } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const raceSlug = buildRaceSlug(state, positionSlug, county, municipality);
	let race = await getRaceBySlug(raceSlug);

	if (!race && !county.endsWith('-county')) {
		const retrySlug = buildRaceSlug(state, positionSlug, `${county}-county`, municipality);
		const retryRace = await getRaceBySlug(retrySlug);
		if (retryRace) {
			redirect(
				`/elections/${state.toLowerCase()}/${county}-county/${municipality.toLowerCase()}/position/${positionSlug}/candidates`,
			);
		}
	}

	if (!race) {
		notFound();
	}

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${municipality.toLowerCase()}`;

	const counties = await getPlacesByState({ state: stateCode, mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyName = countyPlace?.name?.replace(/\s+County$/i, '') ?? county;

	const placesWithChildren = await getPlacesBySlugWithChildren({
		slug: countySlug,
		includeChildren: true,
	});
	const children = placesWithChildren[0]?.children ?? [];
	const municipalityPlace = children.find(c => c.slug.toLowerCase() === fullSlug);

	if (!municipalityPlace) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const cityName = municipalityPlace.name;
	const officeName = race.normalizedPositionName ?? race.name ?? 'Position';

	const candidacies = await getCandidacies({ raceSlug });

	const candidates = candidacies.map((c, i) => ({
		_key: c.id ?? `c-${i}`,
		name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Candidate',
		partyAffiliation: c.party ?? 'Unknown',
		avatar: c.image ?? undefined,
		href: c.slug
			? `/candidate/${c.slug}`
			: `/profile?slug=${encodeURIComponent([c.firstName, c.lastName].filter(Boolean).join('-').toLowerCase())}&raceId=${encodeURIComponent(c.raceId ?? '')}`,
	}));

	const positionHref = `/elections/${fullSlug}/position/${positionSlug}`;

	return (
		<CandidatesPageContent
			officeName={officeName}
			stateName={`${cityName}, ${stateName}`}
			candidates={candidates}
			backHref={positionHref}
			backLabel={`Back to ${officeName}`}
		/>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{
		state: string;
		county: string;
		municipality: string;
		positionSlug: string;
	}>;
}): Promise<Metadata> {
	const { state, county, municipality, positionSlug } = await params;
	if (!isValidStateCode(state)) return {};
	const stateName = getStateName(state);
	const raceSlug = buildRaceSlug(state, positionSlug, county, municipality);
	const race = await getRaceBySlug(raceSlug);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const fullSlug = `${countySlug}/${municipality.toLowerCase()}`;
	const counties = await getPlacesByState({ state: state.toUpperCase(), mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyName = countyPlace?.name?.replace(/\s+County$/i, '') ?? county;
	const placesWithChildren = await getPlacesBySlugWithChildren({
		slug: countySlug,
		includeChildren: true,
	});
	const children = placesWithChildren[0]?.children ?? [];
	const municipalityPlace = children.find(c => c.slug.toLowerCase() === fullSlug);
	const cityName = municipalityPlace?.name ?? municipality;
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	return {
		title: `Candidates for ${positionName} in ${cityName}, ${stateName} | Good Party`,
		description: `View candidates running for ${positionName} in ${cityName}, ${countyName} County, ${stateName}.`,
	};
}
