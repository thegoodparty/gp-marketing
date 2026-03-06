import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCandidacies, getPlacesByState, getPositionById } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { getStateName } from '~/lib/electionsHelpers';
import { CandidatesPageContent } from '~/ui/CandidatesPageContent';

function slugFromName(firstName?: string, lastName?: string, id?: string): string {
	if (firstName && lastName) {
		return `${firstName}-${lastName}`.toLowerCase().replace(/\s+/g, '-');
	}
	return id ?? 'candidate';
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ state: string; county: string }>;
	searchParams: Promise<{ positionId?: string; name?: string }>;
}) {
	const { state, county } = await params;
	const { positionId, name: positionName } = await searchParams;

	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode) || !positionId) {
		notFound();
	}

	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const counties = await getPlacesByState({ state: stateCode, mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);

	if (!countyPlace) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const countyName = countyPlace.name.replace(/\s+County$/i, '') || countyPlace.name;

	const [candidacies, position] = await Promise.all([
		getCandidacies({ positionId }),
		getPositionById(positionId),
	]);

	const officeName =
		position?.position?.name ??
		position?.name ??
		(typeof positionName === 'string' ? decodeURIComponent(positionName) : 'Position');

	const candidates = candidacies.map((c, i) => {
		const firstName = c.firstName ?? '';
		const lastName = c.lastName ?? '';
		const name = [firstName, lastName].filter(Boolean).join(' ') || 'Candidate';
		const slug = slugFromName(firstName, lastName, c.id);
		return {
			_key: c.id ?? `c-${i}`,
			name,
			partyAffiliation: c.party ?? 'Unknown',
			href: `/profile?slug=${encodeURIComponent(slug)}&raceId=${encodeURIComponent(c.raceId ?? positionId)}`,
		};
	});

	const positionHref = `/elections/${countySlug}/position?positionId=${encodeURIComponent(positionId)}`;

	return (
		<CandidatesPageContent
			officeName={officeName}
			stateName={`${countyName} County, ${stateName}`}
			candidates={candidates}
			backHref={positionHref}
			backLabel={`Back to ${officeName}`}
		/>
	);
}

export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ state: string; county: string }>;
	searchParams: Promise<{ positionId?: string; name?: string }>;
}): Promise<Metadata> {
	const { state, county } = await params;
	const { name } = await searchParams;
	if (!isValidStateCode(state)) return {};
	const stateName = getStateName(state);
	const countySlug = `${state.toLowerCase()}/${county.toLowerCase()}`;
	const counties = await getPlacesByState({ state: state.toUpperCase(), mtfcc: 'G4020' });
	const countyPlace = counties.find(c => c.slug.toLowerCase() === countySlug);
	const countyName = countyPlace?.name?.replace(/\s+County$/i, '') ?? county;
	const positionName =
		typeof name === 'string' ? decodeURIComponent(name) : 'Position';
	return {
		title: `Candidates for ${positionName} in ${countyName} County, ${stateName} | Good Party`,
		description: `View candidates running for ${positionName} in ${countyName} County, ${stateName}.`,
	};
}
