import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCandidaciesOrNull, getRaceBySlug } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import {
	buildRaceSlug,
	formatElectionDateFromApi,
	formatFilingPeriodFromRace,
	getStateName,
	mapCandidacyToCard,
} from '~/lib/electionsHelpers';
import { SITE_NAME, toAbsoluteUrl } from '~/lib/url';
import { renderElectionsCandidatesPage } from '~/lib/renderElectionsCandidatesPage';
import { currentCycleCandidacies, heroCandidatesFromCandidacies } from '~/lib/positionHeroCandidates';
import { officeDisplayName } from '~/lib/officeDisplayName';

export default async function Page({
	params,
}: {
	params: Promise<{ state: string; positionSlug: string }>;
}) {
	const { state, positionSlug } = await params;
	const stateCode = state.toUpperCase();

	if (!isValidStateCode(stateCode)) {
		notFound();
	}

	const raceSlug = buildRaceSlug(stateCode, positionSlug);
	const [race, candidacies] = await Promise.all([
		getRaceBySlug(raceSlug),
		getCandidaciesOrNull({ raceSlug }),
	]);

	if (!race) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const officeName = officeDisplayName(race, race.Place);
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const candidates = currentCycleCandidacies(candidacies ?? [], { raceElectionDate: race?.electionDate }).map((c, i) => mapCandidacyToCard(c, i));
	const heroCandidates = candidacies ? await heroCandidatesFromCandidacies(candidacies, { raceElectionDate: race?.electionDate }) : undefined;

	const statePath = stateCode.toLowerCase();
	const positionHref = `/elections/${statePath}/position/${positionSlug}`;
	const locationHref = `/elections/${statePath}`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${statePath}`, label: stateName },
		{ href: '', label: `Candidates for ${officeName}` },
	];

	return renderElectionsCandidatesPage({
		placeSlug: stateCode.toLowerCase(),
		raceSlug,
		officeName,
		stateName,
		electionDate,
		filingDate,
		breadcrumbs,
		positionHref,
		locationHref,
		candidates,
		race,
		heroCandidates,
	});
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ state: string; positionSlug: string }>;
}): Promise<Metadata> {
	const { state, positionSlug } = await params;
	const stateCode = state.toUpperCase();
	if (!isValidStateCode(stateCode)) return {};
	const stateName = getStateName(stateCode);
	const raceSlug = buildRaceSlug(stateCode, positionSlug);
	const race = await getRaceBySlug(raceSlug);
	const positionName = (race ? officeDisplayName(race, race.Place) : 'Position');
	return {
		title: `Candidates for ${positionName} in ${stateName} | ${SITE_NAME}`,
		description: `View candidates running for ${positionName} in ${stateName}.`,
		alternates: {
			canonical: toAbsoluteUrl(`/elections/${stateCode.toLowerCase()}/position/${positionSlug}/candidates`),
		},
	};
}
