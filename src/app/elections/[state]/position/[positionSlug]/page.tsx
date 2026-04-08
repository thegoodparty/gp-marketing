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
import { toAbsoluteUrl } from '~/lib/url';
import { PositionPageContent } from '~/ui/PositionPageContent';

export const revalidate = 3600;

export async function generateStaticParams() {
	return [];
}

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
	const race = await getRaceBySlug(raceSlug);

	if (!race) {
		notFound();
	}

	const stateName = getStateName(stateCode);
	const officeName = race.normalizedPositionName ?? race.name ?? 'Position';
	const electionDate = formatElectionDateFromApi(race.electionDate);
	const filingDate = formatFilingPeriodFromRace(race.filingDateStart, race.filingDateEnd);

	const candidatesHref = `/elections/${stateCode.toLowerCase()}/position/${positionSlug}/candidates`;

	const breadcrumbs = [
		{ href: '/elections', label: 'Elections' },
		{ href: `/elections/${stateCode.toLowerCase()}`, label: stateName },
		{ href: '', label: officeName },
	];

	const pageUrl = toAbsoluteUrl(`/elections/${stateCode.toLowerCase()}/position/${positionSlug}`);

	return (
		<PositionPageContent
			officeName={officeName}
			stateName={stateName}
			electionDate={electionDate}
			filingDate={filingDate}
			breadcrumbs={breadcrumbs}
			candidatesHref={candidatesHref}
			race={race}
			pageUrl={pageUrl}
		/>
	);
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
	const positionName = race?.normalizedPositionName ?? race?.name ?? 'Position';
	return {
		title: `${positionName} in ${stateName} | Good Party`,
		description: `Election details and candidates for ${positionName} in ${stateName}.`,
	};
}
