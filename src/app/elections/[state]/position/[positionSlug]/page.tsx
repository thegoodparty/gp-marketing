import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRaceBySlug } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	buildRaceSlug,
	formatElectionDateFromApi,
	formatFilingPeriodFromRace,
	getStateName,
} from '~/lib/electionsHelpers';
import { PositionPageContent } from '~/ui/PositionPageContent';

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
	const race = await getRaceBySlug(raceSlug);

	if (!race) {
		notFound();
	}

	const stateName = getStateName(state);
	const officeName = race.normalizedPositionName ?? race.name ?? 'Position';
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const candidatesHref = `/elections/${state.toLowerCase()}/position/${positionSlug}/candidates`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${state.toLowerCase()}`, label: stateName },
		{ href: '', label: officeName },
	];

	return (
		<PositionPageContent
			officeName={officeName}
			stateName={stateName}
			electionDate={electionDate}
			filingDate={filingDate}
			breadcrumbs={breadcrumbs}
			backHref={`/elections/${state.toLowerCase()}`}
			backLabel={`Back to ${stateName} elections`}
			candidatesHref={candidatesHref}
			race={race}
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
		title: `${positionName} in ${stateName} | Good Party`,
		description: `Election details and candidates for ${positionName} in ${stateName}.`,
	};
}
